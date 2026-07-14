import { getLearnedFormulas } from "@/lib/learnedFormulas";
import { loadBusinessAnalyticsProgress } from "@/lib/businessAnalyticsProgress";
import { loadPowerBIProgress } from "@/lib/powerBIProgress";
import { loadPowerQueryProgress } from "@/lib/powerQueryProgress";
import { loadPythonProgress } from "@/lib/pythonProgress";
import { loadSQLProgress } from "@/lib/sqlProgress";
import { loadStatisticsProgress } from "@/lib/statisticsProgress";
import { loadTableauProgress } from "@/lib/tableauProgress";
import {
  getQuestionById,
  practiceCategories,
  practiceQuestions,
  type PracticeCategory,
  type PracticeDifficulty,
} from "@/lib/practiceLabQuestions";

export const PRACTICE_LAB_STORAGE_KEY = "databloom-practice-lab-v1";
export const PRACTICE_LAB_EVENT = "databloom:practice-lab-updated";

export type PracticeHistoryEntry = {
  id: string;
  score: number;
  accuracy: number;
  time: number;
  date: string;
  topic: string;
  xpEarned: number;
  questionCount: number;
};

export type QuestionPerformance = {
  attempts: number;
  correct: number;
  incorrect: number;
};

export type ActivePracticeSession = {
  id: string;
  kind: "daily" | "category" | "recommended" | "weak-topic";
  topic: string;
  questionIds: string[];
  currentIndex: number;
  attemptsByQuestion: Record<string, number>;
  firstTryCorrectIds: string[];
  xpEarned: number;
  timerEnabled: boolean;
  startedAt: string;
};

export type PracticeLabState = {
  version: 1;
  completedQuestionIds: string[];
  rewardedQuestionIds: string[];
  favoriteQuestionIds: string[];
  notes: Record<string, string>;
  completedAt: Record<string, string>;
  performance: Record<string, QuestionPerformance>;
  history: PracticeHistoryEntry[];
  activeSession: ActivePracticeSession | null;
  dailyChallenges: Record<string, string>;
};

export type PracticeTopicInsight = {
  category: PracticeCategory;
  topic: string;
  accuracy: number;
  attempts: number;
  priority: number;
};

const emptyState = (): PracticeLabState => ({
  version: 1,
  completedQuestionIds: [],
  rewardedQuestionIds: [],
  favoriteQuestionIds: [],
  notes: {},
  completedAt: {},
  performance: {},
  history: [],
  activeSession: null,
  dailyChallenges: {},
});

function canUseStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
}

function uniqueStrings(value: unknown) {
  return Array.isArray(value)
    ? Array.from(
        new Set(value.filter((item): item is string => typeof item === "string")),
      )
    : [];
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, value)
    : 0;
}

function stringRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] =>
      typeof entry[1] === "string",
    ),
  );
}

function normalizePerformance(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result: Record<string, QuestionPerformance> = {};
  for (const [id, raw] of Object.entries(value)) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const item = raw as Partial<QuestionPerformance>;
    result[id] = {
      attempts: numberValue(item.attempts),
      correct: numberValue(item.correct),
      incorrect: numberValue(item.incorrect),
    };
  }
  return result;
}

function normalizeHistory(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object" && !Array.isArray(item),
    )
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : cryptoSafeId(),
      score: numberValue(item.score),
      accuracy: Math.min(100, numberValue(item.accuracy)),
      time: numberValue(item.time),
      date: typeof item.date === "string" ? item.date : new Date().toISOString(),
      topic: typeof item.topic === "string" ? item.topic : "Mixed Practice",
      xpEarned: numberValue(item.xpEarned),
      questionCount: numberValue(item.questionCount),
    }))
    .slice(-100);
}

function normalizeActiveSession(value: unknown): ActivePracticeSession | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const session = value as Partial<ActivePracticeSession>;
  const questionIds = uniqueStrings(session.questionIds).filter((id) =>
    Boolean(getQuestionById(id)),
  );
  if (!session.id || questionIds.length === 0) return null;
  const attemptsByQuestion: Record<string, number> = {};
  if (
    session.attemptsByQuestion &&
    typeof session.attemptsByQuestion === "object" &&
    !Array.isArray(session.attemptsByQuestion)
  ) {
    for (const [id, attempts] of Object.entries(session.attemptsByQuestion)) {
      attemptsByQuestion[id] = numberValue(attempts);
    }
  }
  return {
    id: session.id,
    kind:
      session.kind === "daily" ||
      session.kind === "recommended" ||
      session.kind === "weak-topic"
        ? session.kind
        : "category",
    topic: typeof session.topic === "string" ? session.topic : "Mixed Practice",
    questionIds,
    currentIndex: Math.min(
      questionIds.length - 1,
      Math.floor(numberValue(session.currentIndex)),
    ),
    attemptsByQuestion,
    firstTryCorrectIds: uniqueStrings(session.firstTryCorrectIds),
    xpEarned: numberValue(session.xpEarned),
    timerEnabled: session.timerEnabled === true,
    startedAt:
      typeof session.startedAt === "string"
        ? session.startedAt
        : new Date().toISOString(),
  };
}

function normalizeState(value: unknown): PracticeLabState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return emptyState();
  }
  const state = value as Partial<PracticeLabState>;
  return {
    version: 1,
    completedQuestionIds: uniqueStrings(state.completedQuestionIds),
    rewardedQuestionIds: uniqueStrings(state.rewardedQuestionIds),
    favoriteQuestionIds: uniqueStrings(state.favoriteQuestionIds),
    notes: stringRecord(state.notes),
    completedAt: stringRecord(state.completedAt),
    performance: normalizePerformance(state.performance),
    history: normalizeHistory(state.history),
    activeSession: normalizeActiveSession(state.activeSession),
    dailyChallenges: stringRecord(state.dailyChallenges),
  };
}

export function loadPracticeLabState(): PracticeLabState {
  if (!canUseStorage()) return emptyState();
  try {
    const saved = window.localStorage.getItem(PRACTICE_LAB_STORAGE_KEY);
    return saved ? normalizeState(JSON.parse(saved)) : emptyState();
  } catch {
    return emptyState();
  }
}

function savePracticeLabState(state: PracticeLabState, reason: string) {
  if (!canUseStorage()) return false;
  try {
    window.localStorage.setItem(PRACTICE_LAB_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(
      new CustomEvent(PRACTICE_LAB_EVENT, { detail: { reason, state } }),
    );
    return true;
  } catch {
    return false;
  }
}

function cryptoSafeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `practice-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function deterministicIndex(seed: string, length: number) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % Math.max(1, length);
}

function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function safeCount(loader: () => string[]) {
  try {
    return loader().length;
  } catch {
    return 0;
  }
}

export function getLearningSignals(): Record<PracticeCategory, number> {
  return {
    Excel: safeCount(getLearnedFormulas),
    SQL: safeCount(() => loadSQLProgress().completedLessonIds),
    Python: safeCount(() => loadPythonProgress().completedLessonIds),
    Statistics: safeCount(() => loadStatisticsProgress().completedLessonIds),
    "Power BI": safeCount(() => loadPowerBIProgress().completedLessonIds),
    Tableau: safeCount(() => loadTableauProgress().completedLessonIds),
    "Power Query": safeCount(() => loadPowerQueryProgress().completedLessonIds),
    "Business Analytics": safeCount(
      () => loadBusinessAnalyticsProgress().completedLessonIds,
    ),
  };
}

export function getOrCreateDailyChallenge(date = new Date()) {
  const state = loadPracticeLabState();
  const key = dateKey(date);
  const saved = getQuestionById(state.dailyChallenges[key] ?? "");
  if (saved) return saved;

  const signals = getLearningSignals();
  const learnedCategories = practiceCategories.filter(
    (category) => signals[category] > 0,
  );
  const categories = learnedCategories.length > 0 ? learnedCategories : practiceCategories;
  const eligible = practiceQuestions.filter((question) =>
    categories.includes(question.category),
  );
  const unfinished = eligible.filter(
    (question) => !state.completedQuestionIds.includes(question.id),
  );
  const pool = unfinished.length > 0 ? unfinished : eligible;
  const question = pool[deterministicIndex(`${key}:${categories.join("|")}`, pool.length)];
  if (!question) return practiceQuestions[0];

  const next = {
    ...state,
    dailyChallenges: { ...state.dailyChallenges, [key]: question.id },
  };
  savePracticeLabState(next, "daily-challenge");
  return question;
}

export function getWeakTopicInsights(state = loadPracticeLabState()) {
  const signals = getLearningSignals();
  const insights = new Map<string, PracticeTopicInsight>();

  for (const question of practiceQuestions) {
    const performance = state.performance[question.id];
    const attempts = performance?.attempts ?? 0;
    const correct = performance?.correct ?? 0;
    const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 100;
    const key = `${question.category}:${question.topic}`;
    const existing = insights.get(key);
    const learningBoost = signals[question.category] > 0 && attempts === 0 ? 18 : 0;
    const priority = attempts > 0 ? 100 - accuracy + Math.min(20, attempts * 2) : learningBoost;
    if (!existing || priority > existing.priority) {
      insights.set(key, {
        category: question.category,
        topic: question.topic,
        accuracy,
        attempts,
        priority,
      });
    }
  }

  return Array.from(insights.values())
    .filter((insight) => insight.priority > 0)
    .sort(
      (left, right) =>
        right.priority - left.priority || left.accuracy - right.accuracy,
    );
}

export function getRecommendedQuestions(state = loadPracticeLabState()) {
  const weakTopics = getWeakTopicInsights(state);
  const ranked = weakTopics.flatMap((insight) =>
    practiceQuestions.filter(
      (question) =>
        question.category === insight.category && question.topic === insight.topic,
    ),
  );
  const rest = practiceQuestions.filter(
    (question) => !ranked.some((rankedQuestion) => rankedQuestion.id === question.id),
  );
  if (ranked.length > 0) return [...ranked, ...rest];

  return [...rest].sort((left, right) => {
    const leftDone = state.completedQuestionIds.includes(left.id) ? 1 : 0;
    const rightDone = state.completedQuestionIds.includes(right.id) ? 1 : 0;
    return leftDone - rightDone;
  });
}

function chooseSessionQuestions(
  category: PracticeCategory | "All",
  difficulty: PracticeDifficulty | "All",
  preferredIds: string[] = [],
) {
  const filtered = practiceQuestions.filter(
    (question) =>
      (category === "All" || question.category === category) &&
      (difficulty === "All" || question.difficulty === difficulty),
  );
  const preferred = preferredIds
    .map(getQuestionById)
    .filter((question): question is NonNullable<typeof question> =>
      Boolean(
        question &&
          (category === "All" || question.category === category) &&
          (difficulty === "All" || question.difficulty === difficulty),
      ),
    );
  const pool = [
    ...preferred,
    ...filtered.filter(
      (question) => !preferred.some((item) => item.id === question.id),
    ),
  ];
  return pool.slice(0, Math.min(5, pool.length));
}

export function startPracticeSession(options: {
  category: PracticeCategory | "All";
  difficulty: PracticeDifficulty | "All";
  timerEnabled: boolean;
  kind?: ActivePracticeSession["kind"];
  questionIds?: string[];
  topic?: string;
}) {
  const state = loadPracticeLabState();
  const questions = chooseSessionQuestions(
    options.category,
    options.difficulty,
    options.questionIds,
  );
  if (questions.length === 0) return null;

  const session: ActivePracticeSession = {
    id: cryptoSafeId(),
    kind: options.kind ?? "category",
    topic:
      options.topic ??
      (options.category === "All" ? "Mixed Practice" : options.category),
    questionIds: questions.map((question) => question.id),
    currentIndex: 0,
    attemptsByQuestion: {},
    firstTryCorrectIds: [],
    xpEarned: 0,
    timerEnabled: options.timerEnabled,
    startedAt: new Date().toISOString(),
  };
  const next = { ...state, activeSession: session };
  return savePracticeLabState(next, "session-started") ? session : null;
}

export function startDailyChallenge(questionId: string, timerEnabled: boolean) {
  const question = getQuestionById(questionId);
  if (!question) return null;
  const state = loadPracticeLabState();
  const session: ActivePracticeSession = {
    id: cryptoSafeId(),
    kind: "daily",
    topic: `Daily · ${question.topic}`,
    questionIds: [question.id],
    currentIndex: 0,
    attemptsByQuestion: {},
    firstTryCorrectIds: [],
    xpEarned: 0,
    timerEnabled,
    startedAt: new Date().toISOString(),
  };
  return savePracticeLabState(
    { ...state, activeSession: session },
    "session-started",
  )
    ? session
    : null;
}

export function recordPracticeAttempt(questionId: string, isCorrect: boolean) {
  const state = loadPracticeLabState();
  const session = state.activeSession;
  const question = getQuestionById(questionId);
  if (!session || !question || !session.questionIds.includes(questionId)) {
    return { saved: false, newlyRewarded: false, xpAward: 0, state };
  }

  const performance = state.performance[questionId] ?? {
    attempts: 0,
    correct: 0,
    incorrect: 0,
  };
  const sessionAttempts = session.attemptsByQuestion[questionId] ?? 0;
  const newlyRewarded =
    isCorrect && !state.rewardedQuestionIds.includes(questionId);
  const completedQuestionIds = isCorrect
    ? Array.from(new Set([...state.completedQuestionIds, questionId]))
    : state.completedQuestionIds;
  const rewardedQuestionIds = newlyRewarded
    ? [...state.rewardedQuestionIds, questionId]
    : state.rewardedQuestionIds;
  const firstTryCorrectIds =
    isCorrect && sessionAttempts === 0
      ? Array.from(new Set([...session.firstTryCorrectIds, questionId]))
      : session.firstTryCorrectIds;
  const xpAward = newlyRewarded ? question.xpReward : 0;
  const nextSession: ActivePracticeSession = {
    ...session,
    attemptsByQuestion: {
      ...session.attemptsByQuestion,
      [questionId]: sessionAttempts + 1,
    },
    firstTryCorrectIds,
    xpEarned: session.xpEarned + xpAward,
  };
  const next: PracticeLabState = {
    ...state,
    completedQuestionIds,
    rewardedQuestionIds,
    completedAt: isCorrect
      ? { ...state.completedAt, [questionId]: new Date().toISOString() }
      : state.completedAt,
    performance: {
      ...state.performance,
      [questionId]: {
        attempts: performance.attempts + 1,
        correct: performance.correct + (isCorrect ? 1 : 0),
        incorrect: performance.incorrect + (isCorrect ? 0 : 1),
      },
    },
    activeSession: nextSession,
  };
  const saved = savePracticeLabState(next, "attempt-recorded");
  return {
    saved,
    newlyRewarded: saved && newlyRewarded,
    xpAward: saved ? xpAward : 0,
    state: saved ? next : state,
  };
}

export function advancePracticeSession() {
  const state = loadPracticeLabState();
  if (!state.activeSession) return null;
  const nextIndex = Math.min(
    state.activeSession.questionIds.length - 1,
    state.activeSession.currentIndex + 1,
  );
  const activeSession = { ...state.activeSession, currentIndex: nextIndex };
  const next = { ...state, activeSession };
  return savePracticeLabState(next, "session-advanced") ? activeSession : null;
}

export function completePracticeSession(elapsedSeconds: number) {
  const state = loadPracticeLabState();
  const session = state.activeSession;
  if (!session) return { completed: false, entry: null, state };
  const existing = state.history.find((entry) => entry.id === session.id);
  if (existing) return { completed: false, entry: existing, state };

  const questionCount = session.questionIds.length;
  const firstTryCorrect = session.firstTryCorrectIds.length;
  const accuracy = questionCount
    ? Math.round((firstTryCorrect / questionCount) * 100)
    : 0;
  const entry: PracticeHistoryEntry = {
    id: session.id,
    score: firstTryCorrect,
    accuracy,
    time: Math.max(0, Math.round(elapsedSeconds)),
    date: new Date().toISOString(),
    topic: session.topic,
    xpEarned: session.xpEarned,
    questionCount,
  };
  const next: PracticeLabState = {
    ...state,
    history: [...state.history, entry].slice(-100),
    activeSession: null,
  };
  const saved = savePracticeLabState(next, "session-completed");
  return { completed: saved, entry: saved ? entry : null, state: saved ? next : state };
}

export function abandonPracticeSession() {
  const state = loadPracticeLabState();
  if (!state.activeSession) return true;
  return savePracticeLabState({ ...state, activeSession: null }, "session-abandoned");
}

export function togglePracticeFavorite(questionId: string) {
  const state = loadPracticeLabState();
  const favoriteQuestionIds = state.favoriteQuestionIds.includes(questionId)
    ? state.favoriteQuestionIds.filter((id) => id !== questionId)
    : [...state.favoriteQuestionIds, questionId];
  const next = { ...state, favoriteQuestionIds };
  return savePracticeLabState(next, "favorite-updated") ? next : state;
}

export function savePracticeNote(questionId: string, note: string) {
  const state = loadPracticeLabState();
  const notes = { ...state.notes };
  if (note.trim()) notes[questionId] = note;
  else delete notes[questionId];
  const next = { ...state, notes };
  return savePracticeLabState(next, "note-updated");
}

export function getPracticeSummary(state = loadPracticeLabState()) {
  const sessions = state.history.length;
  const totalAccuracy = state.history.reduce(
    (total, entry) => total + entry.accuracy,
    0,
  );
  const totalXP = state.history.reduce((total, entry) => total + entry.xpEarned, 0);
  return {
    sessions,
    averageAccuracy: sessions ? Math.round(totalAccuracy / sessions) : 0,
    totalXP,
    completedQuestions: state.completedQuestionIds.length,
    progressPercentage: Math.round(
      (state.completedQuestionIds.length / practiceQuestions.length) * 100,
    ),
  };
}
