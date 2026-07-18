import {
  studioAssessmentConfigurations,
  type AssessableStudioId,
  type StudioAssessmentConfiguration,
  type StudioCheckpoint,
  type StudioFinalSkillExam,
} from "@/lib/studioAssessments";
import { businessAnalyticsLessons } from "@/lib/businessAnalyticsLessons";
import {
  BUSINESS_ANALYTICS_PROGRESS_EVENT,
  loadBusinessAnalyticsProgress,
} from "@/lib/businessAnalyticsProgress";
import { formulas } from "@/lib/formulas";
import {
  FORMULA_PROGRESS_EVENT,
  getLearnedFormulas,
} from "@/lib/learnedFormulas";
import { powerBILessons } from "@/lib/powerBILessons";
import {
  loadPowerBIProgress,
  POWER_BI_PROGRESS_EVENT,
} from "@/lib/powerBIProgress";
import { powerQueryLessons } from "@/lib/powerQueryLessons";
import {
  loadPowerQueryProgress,
  POWER_QUERY_PROGRESS_EVENT,
} from "@/lib/powerQueryProgress";
import { pythonLessons } from "@/lib/pythonLessons";
import {
  loadPythonProgress,
  PYTHON_PROGRESS_EVENT,
} from "@/lib/pythonProgress";
import { sqlLessons } from "@/lib/sqlLessons";
import { loadSQLProgress, SQL_PROGRESS_EVENT } from "@/lib/sqlProgress";
import { statisticsLessons } from "@/lib/statisticsLessons";
import {
  loadStatisticsProgress,
  STATISTICS_PROGRESS_EVENT,
} from "@/lib/statisticsProgress";
import { tableauLessons } from "@/lib/tableauLessons";
import {
  loadTableauProgress,
  TABLEAU_PROGRESS_EVENT,
} from "@/lib/tableauProgress";

export const CHECKPOINT_PROGRESS_EVENT =
  "databloom:checkpoint-progress-updated";

const CHECKPOINT_PROGRESS_STORAGE_KEY = "databloom-checkpoint-progress-v1";

export type AssessmentQuestion = {
  id: string;
  topicId: string;
  prompt: string;
  options: readonly string[];
  correctAnswer: string;
  source: "existing-lesson-practice" | "derived-curriculum-seed";
};

export type CheckpointQuestion = AssessmentQuestion;

type QuestionAssessment = Pick<
  StudioCheckpoint,
  "id" | "coverage" | "suggestedQuestionCount"
>;

export type CheckpointCompletion = {
  studioId: AssessableStudioId;
  checkpointId: string;
  bestScore: number;
  latestPassedScore: number;
  completedAt: string;
  xpAwarded: boolean;
};

export type FinalMasteryResult = {
  studioId: AssessableStudioId;
  finalExamId: string;
  officialMasteryScore: number;
  completedAt: string;
  updatedAt: string;
  studioCompleted: true;
  xpAwarded: boolean;
  nextStudioUnlockId: AssessableStudioId | null;
};

export type CheckpointProgressState = {
  completions: Record<string, CheckpointCompletion>;
  masteryResults: Partial<Record<AssessableStudioId, FinalMasteryResult>>;
};

function completionKey(studioId: AssessableStudioId, checkpointId: string) {
  return `${studioId}:${checkpointId}`;
}

function emptyCheckpointProgress(): CheckpointProgressState {
  return { completions: {}, masteryResults: {} };
}

function normalizeScore(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(100, Math.round(value)))
    : 0;
}

function normalizeCheckpointProgress(value: unknown): CheckpointProgressState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return emptyCheckpointProgress();
  }

  const rawState = value as Partial<CheckpointProgressState>;
  const rawCompletions =
    rawState.completions &&
    typeof rawState.completions === "object" &&
    !Array.isArray(rawState.completions)
      ? rawState.completions
      : {};
  const completions = Object.fromEntries(
    Object.entries(rawCompletions).flatMap(([key, entry]) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
      const completion = entry as Partial<CheckpointCompletion>;
      const studio = studioAssessmentConfigurations.find(
        (item) => item.studioId === completion.studioId,
      );
      const checkpoint = studio?.checkpoints.find(
        (item) => item.id === completion.checkpointId,
      );
      if (!studio || !checkpoint) return [];

      const normalized: CheckpointCompletion = {
        studioId: studio.studioId,
        checkpointId: checkpoint.id,
        bestScore: normalizeScore(completion.bestScore),
        latestPassedScore: normalizeScore(completion.latestPassedScore),
        completedAt:
          typeof completion.completedAt === "string"
            ? completion.completedAt
            : "",
        xpAwarded: completion.xpAwarded === true,
      };
      return [[key, normalized] as const];
    }),
  );

  const rawMasteryResults =
    rawState.masteryResults &&
    typeof rawState.masteryResults === "object" &&
    !Array.isArray(rawState.masteryResults)
      ? rawState.masteryResults
      : {};
  const masteryResults = Object.fromEntries(
    Object.values(rawMasteryResults).flatMap((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
      const result = entry as Partial<FinalMasteryResult>;
      const studio = studioAssessmentConfigurations.find(
        (item) =>
          item.studioId === result.studioId &&
          item.finalExam.id === result.finalExamId,
      );
      if (!studio) return [];

      const normalized: FinalMasteryResult = {
        studioId: studio.studioId,
        finalExamId: studio.finalExam.id,
        officialMasteryScore: normalizeScore(result.officialMasteryScore),
        completedAt:
          typeof result.completedAt === "string" ? result.completedAt : "",
        updatedAt:
          typeof result.updatedAt === "string" ? result.updatedAt : "",
        studioCompleted: true,
        xpAwarded: result.xpAwarded === true,
        nextStudioUnlockId: null,
      };
      return [[studio.studioId, normalized] as const];
    }),
  );

  return { completions, masteryResults };
}

export function loadCheckpointProgress(): CheckpointProgressState {
  if (typeof window === "undefined" || !("localStorage" in window)) {
    return emptyCheckpointProgress();
  }

  try {
    const saved = window.localStorage.getItem(CHECKPOINT_PROGRESS_STORAGE_KEY);
    return saved
      ? normalizeCheckpointProgress(JSON.parse(saved))
      : emptyCheckpointProgress();
  } catch {
    return emptyCheckpointProgress();
  }
}

export function getCheckpointCompletion(
  studioId: AssessableStudioId,
  checkpointId: string,
) {
  return loadCheckpointProgress().completions[
    completionKey(studioId, checkpointId)
  ];
}

export function saveCheckpointPass({
  studioId,
  checkpointId,
  score,
  passingScore,
}: {
  studioId: AssessableStudioId;
  checkpointId: string;
  score: number;
  passingScore: number;
}) {
  const normalizedScore = normalizeScore(score);
  const state = loadCheckpointProgress();
  const key = completionKey(studioId, checkpointId);
  const existing = state.completions[key];

  if (normalizedScore < passingScore) {
    return { saved: false, newlyCompleted: false, xpAwarded: false, state };
  }

  const nextCompletion: CheckpointCompletion = {
    studioId,
    checkpointId,
    bestScore: Math.max(existing?.bestScore ?? 0, normalizedScore),
    latestPassedScore: normalizedScore,
    completedAt: new Date().toISOString(),
    xpAwarded: true,
  };
  const next = {
    completions: { ...state.completions, [key]: nextCompletion },
    masteryResults: state.masteryResults,
  };

  if (typeof window === "undefined" || !("localStorage" in window)) {
    return { saved: false, newlyCompleted: false, xpAwarded: false, state };
  }

  try {
    window.localStorage.setItem(
      CHECKPOINT_PROGRESS_STORAGE_KEY,
      JSON.stringify(next),
    );
    window.dispatchEvent(
      new CustomEvent(CHECKPOINT_PROGRESS_EVENT, {
        detail: { studioId, checkpointId, state: next },
      }),
    );
    return {
      saved: true,
      newlyCompleted: !existing,
      xpAwarded: !existing?.xpAwarded,
      state: next,
    };
  } catch {
    return { saved: false, newlyCompleted: false, xpAwarded: false, state };
  }
}

export function getFinalMasteryResult(studioId: AssessableStudioId) {
  return loadCheckpointProgress().masteryResults[studioId];
}

export function saveFinalSkillExamPass({
  studioId,
  finalExamId,
  score,
  passingScore,
}: {
  studioId: AssessableStudioId;
  finalExamId: string;
  score: number;
  passingScore: number;
}) {
  const normalizedScore = normalizeScore(score);
  const state = loadCheckpointProgress();
  const existing = state.masteryResults[studioId];

  if (normalizedScore < passingScore) {
    return {
      saved: false,
      newlyCompleted: false,
      scoreImproved: false,
      xpAwarded: false,
      masteryResult: existing,
      nextStudioUnlocked: null,
      state,
    };
  }

  const now = new Date().toISOString();
  const masteryResult: FinalMasteryResult = {
    studioId,
    finalExamId,
    officialMasteryScore: Math.max(
      existing?.officialMasteryScore ?? 0,
      normalizedScore,
    ),
    completedAt: existing?.completedAt || now,
    updatedAt: now,
    studioCompleted: true,
    xpAwarded: true,
    nextStudioUnlockId: null,
  };
  const next: CheckpointProgressState = {
    completions: state.completions,
    masteryResults: { ...state.masteryResults, [studioId]: masteryResult },
  };

  if (typeof window === "undefined" || !("localStorage" in window)) {
    return {
      saved: false,
      newlyCompleted: false,
      scoreImproved: false,
      xpAwarded: false,
      masteryResult: existing,
      nextStudioUnlocked: null,
      state,
    };
  }

  try {
    window.localStorage.setItem(
      CHECKPOINT_PROGRESS_STORAGE_KEY,
      JSON.stringify(next),
    );
    window.dispatchEvent(
      new CustomEvent(CHECKPOINT_PROGRESS_EVENT, {
        detail: {
          kind: "final-skill-exam",
          studioId,
          finalExamId,
          state: next,
        },
      }),
    );
    return {
      saved: true,
      newlyCompleted: !existing,
      scoreImproved:
        normalizedScore > (existing?.officialMasteryScore ?? 0),
      xpAwarded: !existing?.xpAwarded,
      masteryResult,
      nextStudioUnlocked: null,
      state: next,
    };
  } catch {
    return {
      saved: false,
      newlyCompleted: false,
      scoreImproved: false,
      xpAwarded: false,
      masteryResult: existing,
      nextStudioUnlocked: null,
      state,
    };
  }
}

export function getStudioAssessmentConfiguration(studioId: string) {
  return studioAssessmentConfigurations.find(
    (studio) => studio.studioId === studioId,
  );
}

export function getStudioCheckpoint(
  studioId: string,
  checkpointId: string,
):
  | {
      studio: StudioAssessmentConfiguration;
      checkpoint: StudioCheckpoint;
    }
  | undefined {
  const studio = getStudioAssessmentConfiguration(studioId);
  const checkpoint = studio?.checkpoints.find((item) => item.id === checkpointId);
  return studio && checkpoint ? { studio, checkpoint } : undefined;
}

export function getStudioFinalSkillExam(
  studioId: string,
  finalExamId: string,
):
  | {
      studio: StudioAssessmentConfiguration;
      finalExam: StudioFinalSkillExam;
    }
  | undefined {
  const studio = getStudioAssessmentConfiguration(studioId);
  return studio?.finalExam.id === finalExamId
    ? { studio, finalExam: studio.finalExam }
    : undefined;
}

export function loadCompletedStudioTopicIds(studioId: AssessableStudioId) {
  switch (studioId) {
    case "formula-studio":
      return getLearnedFormulas();
    case "sql-studio":
      return loadSQLProgress().completedLessonIds;
    case "python-studio":
      return loadPythonProgress().completedLessonIds;
    case "statistics-studio":
      return loadStatisticsProgress().completedLessonIds;
    case "power-bi-studio":
      return loadPowerBIProgress().completedLessonIds;
    case "power-query-studio":
      return loadPowerQueryProgress().completedLessonIds;
    case "tableau-studio":
      return loadTableauProgress().completedLessonIds;
    case "business-analytics-studio":
      return loadBusinessAnalyticsProgress().completedLessonIds;
  }
}

export function getStudioProgressEventName(studioId: AssessableStudioId) {
  const eventNames: Record<AssessableStudioId, string> = {
    "formula-studio": FORMULA_PROGRESS_EVENT,
    "sql-studio": SQL_PROGRESS_EVENT,
    "python-studio": PYTHON_PROGRESS_EVENT,
    "statistics-studio": STATISTICS_PROGRESS_EVENT,
    "power-bi-studio": POWER_BI_PROGRESS_EVENT,
    "power-query-studio": POWER_QUERY_PROGRESS_EVENT,
    "tableau-studio": TABLEAU_PROGRESS_EVENT,
    "business-analytics-studio": BUSINESS_ANALYTICS_PROGRESS_EVENT,
  };
  return eventNames[studioId];
}

export function isCheckpointUnlocked(
  checkpoint: StudioCheckpoint,
  completedTopicIds: readonly string[],
) {
  const completed = new Set(completedTopicIds);
  return checkpoint.unlockRequirement.requiredTopicIds.every((topicId) =>
    completed.has(topicId),
  );
}

export function getFinalSkillExamUnlockStatus(
  studio: StudioAssessmentConfiguration,
  completedTopicIds: readonly string[],
  progress = loadCheckpointProgress(),
) {
  const completed = new Set(completedTopicIds);
  const missingTopicIds = studio.finalExam.unlockRequirement.requiredTopicIds.filter(
    (topicId) => !completed.has(topicId),
  );
  const missingCheckpointIds = studio.checkpoints
    .filter(
      (checkpoint) =>
        !progress.completions[completionKey(studio.studioId, checkpoint.id)],
    )
    .map((checkpoint) => checkpoint.id);

  return {
    unlocked: missingTopicIds.length === 0 && missingCheckpointIds.length === 0,
    curriculumComplete: missingTopicIds.length === 0,
    checkpointsComplete: missingCheckpointIds.length === 0,
    missingTopicIds,
    missingCheckpointIds,
  };
}

export function getCheckpointQuestions(
  studioId: AssessableStudioId,
  checkpoint: StudioCheckpoint,
): AssessmentQuestion[] {
  return getAssessmentQuestions(studioId, checkpoint);
}

export function getFinalSkillExamQuestions(
  studioId: AssessableStudioId,
  finalExam: StudioFinalSkillExam,
): AssessmentQuestion[] {
  return getAssessmentQuestions(studioId, finalExam);
}

function getAssessmentQuestions(
  studioId: AssessableStudioId,
  assessment: QuestionAssessment,
): AssessmentQuestion[] {
  const allowedIds = new Set(assessment.coverage.topicIds);
  const limit = assessment.suggestedQuestionCount;

  switch (studioId) {
    case "formula-studio": {
      const topics = formulas.filter((item) => allowedIds.has(item.id));
      return topics.slice(0, limit).map((item, index) => ({
        id: `${assessment.id}:${item.id}`,
        topicId: item.id,
        prompt: `Which formula best matches this purpose? ${item.purpose}`,
        options: peerOptions(
          `${assessment.id}:${item.id}`,
          item.name,
          topics.map((topic) => topic.name),
          index,
        ),
        correctAnswer: item.name,
        source: "derived-curriculum-seed",
      }));
    }
    case "sql-studio": {
      const topics = sqlLessons.filter((item) => allowedIds.has(item.id));
      return topics.slice(0, limit).map((item, index) => ({
        id: `${assessment.id}:${item.id}`,
        topicId: item.id,
        prompt: item.practiceTask,
        options: peerOptions(
          `${assessment.id}:${item.id}`,
          item.expectedAnswer,
          topics.map((topic) => topic.expectedAnswer),
          index,
        ),
        correctAnswer: item.expectedAnswer,
        source: "existing-lesson-practice",
      }));
    }
    case "python-studio": {
      const topics = pythonLessons.filter((item) => allowedIds.has(item.id));
      return topics.slice(0, limit).map((item, index) => {
        const correctAnswer = item.acceptedAnswers[0];
        return {
          id: `${assessment.id}:${item.id}`,
          topicId: item.id,
          prompt: item.practiceTask,
          options: peerOptions(
            `${assessment.id}:${item.id}`,
            correctAnswer,
            topics.map((topic) => topic.acceptedAnswers[0]),
            index,
          ),
          correctAnswer,
          source: "existing-lesson-practice",
        };
      });
    }
    case "statistics-studio": {
      const topics = statisticsLessons.filter((item) => allowedIds.has(item.id));
      return topics.slice(0, limit).map((item, index) => {
        const correctAnswer = item.acceptedAnswers[0];
        return {
          id: `${assessment.id}:${item.id}`,
          topicId: item.id,
          prompt: item.practiceTask,
          options: peerOptions(
            `${assessment.id}:${item.id}`,
            correctAnswer,
            topics.map((topic) => topic.acceptedAnswers[0]),
            index,
          ),
          correctAnswer,
          source: "existing-lesson-practice",
        };
      });
    }
    case "power-bi-studio": {
      const topics = powerBILessons.filter((item) => allowedIds.has(item.id));
      return topics.slice(0, limit).map((item, index) => ({
        id: `${assessment.id}:${item.id}`,
        topicId: item.id,
        prompt: `Which Power BI skill best matches this outcome? ${item.description}`,
        options: peerOptions(
          `${assessment.id}:${item.id}`,
          item.title,
          topics.map((topic) => topic.title),
          index,
        ),
        correctAnswer: item.title,
        source: "derived-curriculum-seed",
      }));
    }
    case "power-query-studio":
      return powerQueryLessons
        .filter((item) => allowedIds.has(item.id))
        .slice(0, limit)
        .map((item) => ({
          id: `${assessment.id}:${item.id}`,
          topicId: item.id,
          prompt: item.practiceQuestion,
          options: item.practiceOptions,
          correctAnswer: item.correctAnswer,
          source: "existing-lesson-practice",
        }));
    case "tableau-studio":
      return tableauLessons
        .filter((item) => allowedIds.has(item.id))
        .slice(0, limit)
        .map((item) => ({
          id: `${assessment.id}:${item.id}`,
          topicId: item.id,
          prompt: item.practiceQuestion,
          options: item.practiceOptions,
          correctAnswer: item.correctAnswer,
          source: "existing-lesson-practice",
        }));
    case "business-analytics-studio":
      return businessAnalyticsLessons
        .filter((item) => allowedIds.has(item.id))
        .slice(0, limit)
        .map((item) => ({
          id: `${assessment.id}:${item.id}`,
          topicId: item.id,
          prompt: item.practiceQuestion,
          options: item.practiceOptions,
          correctAnswer: item.correctAnswer,
          source: "existing-lesson-practice",
        }));
  }
}

function peerOptions(
  questionId: string,
  correctAnswer: string,
  peerAnswers: readonly string[],
  currentIndex: number,
) {
  const candidates = [correctAnswer];

  for (let offset = 1; offset < peerAnswers.length && candidates.length < 4; offset += 1) {
    const candidate = peerAnswers[(currentIndex + offset) % peerAnswers.length];
    if (candidate && !candidates.includes(candidate)) candidates.push(candidate);
  }

  const rotation =
    Array.from(questionId).reduce(
      (total, character) => total + character.charCodeAt(0),
      0,
    ) % candidates.length;

  return [...candidates.slice(rotation), ...candidates.slice(0, rotation)];
}
