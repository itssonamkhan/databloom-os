import { businessAnalyticsLessons } from "@/lib/businessAnalyticsLessons";
import { dashboardProjects } from "@/lib/dashboardProjects";
import { formulas } from "@/lib/formulas";
import { powerBILessons } from "@/lib/powerBILessons";
import { powerQueryLessons } from "@/lib/powerQueryLessons";
import { pythonLessons } from "@/lib/pythonLessons";
import { sqlLessons } from "@/lib/sqlLessons";
import { statisticsLessons } from "@/lib/statisticsLessons";
import { tableauLessons } from "@/lib/tableauLessons";

type CurriculumTopic = {
  id: string;
  category: string;
};

const studioCurricula = {
  "formula-studio": formulas,
  "sql-studio": sqlLessons,
  "python-studio": pythonLessons,
  "statistics-studio": statisticsLessons,
  "power-bi-studio": powerBILessons,
  "power-query-studio": powerQueryLessons,
  "tableau-studio": tableauLessons,
  "business-analytics-studio": businessAnalyticsLessons,
} satisfies Record<string, readonly CurriculumTopic[]>;

export type AssessableStudioId = keyof typeof studioCurricula;

export type AssessmentCoverage = {
  chapterNames: readonly string[];
  topicIds: readonly string[];
};

export type AssessmentUnlockRequirement = {
  kind: "complete-covered-topics";
  requiredTopicIds: readonly string[];
};

export type StudioCheckpoint = {
  id: string;
  name: string;
  coverage: AssessmentCoverage;
  unlockRequirement: AssessmentUnlockRequirement;
  suggestedQuestionCount: number;
  suggestedPassingScore: number;
  xpReward: number;
  scoreVisibility: "internal";
};

export type StudioFinalSkillExam = {
  id: string;
  name: string;
  coverage: AssessmentCoverage;
  unlockRequirement: AssessmentUnlockRequirement;
  suggestedQuestionCount: number;
  suggestedPassingScore: number;
  xpReward: number;
  scoreVisibility: "final-skill-score";
};

export type StudioAssessmentConfiguration = {
  studioId: AssessableStudioId;
  studioName: string;
  studioRoute: `/${AssessableStudioId}`;
  curriculumChapterNames: readonly string[];
  curriculumTopicIds: readonly string[];
  checkpoints: readonly StudioCheckpoint[];
  finalExam: StudioFinalSkillExam;
};

export const DEFAULT_CHECKPOINT_PASSING_SCORE = 70 as const;
export const DEFAULT_CHECKPOINT_XP_REWARD = 50 as const;
export const DEFAULT_FINAL_SKILL_EXAM_PASSING_SCORE = 75 as const;
export const DEFAULT_FINAL_SKILL_EXAM_XP_REWARD = 150 as const;

function getChapterNames(studioId: AssessableStudioId) {
  return Array.from(
    new Set(studioCurricula[studioId].map((topic) => topic.category)),
  );
}

function getCoverage(
  studioId: AssessableStudioId,
  chapterNames: readonly string[],
): AssessmentCoverage {
  const curriculum = studioCurricula[studioId];
  const knownChapters = new Set(curriculum.map((topic) => topic.category));
  const missingChapters = chapterNames.filter(
    (chapterName) => !knownChapters.has(chapterName),
  );

  if (missingChapters.length > 0) {
    throw new Error(
      `Unknown ${studioId} assessment chapters: ${missingChapters.join(", ")}`,
    );
  }

  return {
    chapterNames,
    topicIds: curriculum
      .filter((topic) => chapterNames.includes(topic.category))
      .map((topic) => topic.id),
  };
}

function checkpoint(
  studioId: AssessableStudioId,
  id: string,
  name: string,
  chapterNames: readonly string[],
  suggestedQuestionCount: number,
  suggestedPassingScore = DEFAULT_CHECKPOINT_PASSING_SCORE,
  xpReward = DEFAULT_CHECKPOINT_XP_REWARD,
): StudioCheckpoint {
  const coverage = getCoverage(studioId, chapterNames);

  return {
    id,
    name,
    coverage,
    unlockRequirement: {
      kind: "complete-covered-topics",
      requiredTopicIds: coverage.topicIds,
    },
    suggestedQuestionCount,
    suggestedPassingScore,
    xpReward,
    scoreVisibility: "internal",
  };
}

function finalExam(
  studioId: AssessableStudioId,
  id: string,
  name: string,
  suggestedQuestionCount: number,
  suggestedPassingScore = DEFAULT_FINAL_SKILL_EXAM_PASSING_SCORE,
  xpReward = DEFAULT_FINAL_SKILL_EXAM_XP_REWARD,
): StudioFinalSkillExam {
  const coverage = getCoverage(studioId, getChapterNames(studioId));

  return {
    id,
    name,
    coverage,
    unlockRequirement: {
      kind: "complete-covered-topics",
      requiredTopicIds: coverage.topicIds,
    },
    suggestedQuestionCount,
    suggestedPassingScore,
    xpReward,
    scoreVisibility: "final-skill-score",
  };
}

export const studioAssessmentConfigurations: readonly StudioAssessmentConfiguration[] = [
  {
    studioId: "formula-studio",
    studioName: "Formula Studio",
    studioRoute: "/formula-studio",
    curriculumChapterNames: getChapterNames("formula-studio"),
    curriculumTopicIds: formulas.map((formula) => formula.id),
    checkpoints: [
      checkpoint(
        "formula-studio",
        "formula-foundations-analysis",
        "Checkpoint 1: Foundations and Analysis",
        [
          "Beginner Foundation",
          "Logical Functions",
          "Conditional Analysis",
          "Statistical Functions",
          "Number Formatting",
        ],
        18,
      ),
      checkpoint(
        "formula-studio",
        "formula-lookups-text",
        "Checkpoint 2: Lookups and Text",
        [
          "Lookup & Reference",
          "Text Cleaning",
          "Data Cleaning",
          "Text Formatting",
          "Text Combining",
        ],
        18,
      ),
      checkpoint(
        "formula-studio",
        "formula-dates-modern-excel",
        "Checkpoint 3: Dates and Modern Excel",
        ["Date & Time", "Dynamic Array", "Advanced Excel"],
        18,
      ),
    ],
    finalExam: finalExam(
      "formula-studio",
      "formula-final-skill-exam",
      "Formula Studio Final Skill Exam",
      35,
    ),
  },
  {
    studioId: "sql-studio",
    studioName: "SQL Studio",
    studioRoute: "/sql-studio",
    curriculumChapterNames: getChapterNames("sql-studio"),
    curriculumTopicIds: sqlLessons.map((lesson) => lesson.id),
    checkpoints: [
      checkpoint(
        "sql-studio",
        "sql-query-foundations",
        "Checkpoint 1: Query Foundations",
        ["Query Basics", "Filtering"],
        18,
      ),
      checkpoint(
        "sql-studio",
        "sql-analysis-combination",
        "Checkpoint 2: Analysis and Combining Data",
        ["Aggregations", "Joins", "Set Operations", "Conditional Logic"],
        20,
      ),
      checkpoint(
        "sql-studio",
        "sql-advanced-performance",
        "Checkpoint 3: Advanced Queries and Performance",
        ["Advanced Queries", "Window Functions", "Database Objects", "Performance"],
        20,
      ),
    ],
    finalExam: finalExam(
      "sql-studio",
      "sql-final-skill-exam",
      "SQL Studio Final Skill Exam",
      40,
    ),
  },
  {
    studioId: "python-studio",
    studioName: "Python Studio",
    studioRoute: "/python-studio",
    curriculumChapterNames: getChapterNames("python-studio"),
    curriculumTopicIds: pythonLessons.map((lesson) => lesson.id),
    checkpoints: [
      checkpoint(
        "python-studio",
        "python-language-foundations",
        "Checkpoint 1: Python Language Foundations",
        ["Python Fundamentals", "Collections", "Control Flow", "Functions and Modules"],
        20,
      ),
      checkpoint(
        "python-studio",
        "python-data-wrangling",
        "Checkpoint 2: NumPy and Data Wrangling",
        ["NumPy", "Pandas", "Data Cleaning"],
        22,
      ),
      checkpoint(
        "python-studio",
        "python-analysis-communication",
        "Checkpoint 3: Analysis and Communication",
        ["Data Analysis", "Visualization", "Analyst Workflow"],
        18,
      ),
    ],
    finalExam: finalExam(
      "python-studio",
      "python-final-skill-exam",
      "Python Studio Final Skill Exam",
      45,
    ),
  },
  {
    studioId: "statistics-studio",
    studioName: "Statistics Studio",
    studioRoute: "/statistics-studio",
    curriculumChapterNames: getChapterNames("statistics-studio"),
    curriculumTopicIds: statisticsLessons.map((lesson) => lesson.id),
    checkpoints: [
      checkpoint(
        "statistics-studio",
        "statistics-foundations-probability",
        "Checkpoint 1: Foundations and Probability",
        ["Foundations", "Descriptive Statistics", "Probability", "Distributions"],
        22,
      ),
      checkpoint(
        "statistics-studio",
        "statistics-inference",
        "Checkpoint 2: Sampling and Inference",
        ["Sampling", "Confidence Intervals", "Hypothesis Testing"],
        22,
      ),
      checkpoint(
        "statistics-studio",
        "statistics-applied-analysis",
        "Checkpoint 3: Applied Statistical Analysis",
        [
          "Correlation and Regression",
          "A/B Testing",
          "Business Statistics",
          "Analyst Interviews",
        ],
        22,
      ),
    ],
    finalExam: finalExam(
      "statistics-studio",
      "statistics-final-skill-exam",
      "Statistics Studio Final Skill Exam",
      50,
    ),
  },
  {
    studioId: "power-bi-studio",
    studioName: "Power BI Studio",
    studioRoute: "/power-bi-studio",
    curriculumChapterNames: getChapterNames("power-bi-studio"),
    curriculumTopicIds: powerBILessons.map((lesson) => lesson.id),
    checkpoints: [
      checkpoint(
        "power-bi-studio",
        "power-bi-data-preparation",
        "Checkpoint 1: Getting Started and Data Preparation",
        ["Getting Started", "Data Cleaning"],
        18,
      ),
      checkpoint(
        "power-bi-studio",
        "power-bi-modeling-reporting",
        "Checkpoint 2: Modeling and Reporting",
        ["Data Modelling", "Visuals", "Dashboard Design"],
        20,
      ),
    ],
    finalExam: finalExam(
      "power-bi-studio",
      "power-bi-final-skill-exam",
      "Power BI Studio Final Skill Exam",
      35,
    ),
  },
  {
    studioId: "power-query-studio",
    studioName: "Power Query Studio",
    studioRoute: "/power-query-studio",
    curriculumChapterNames: getChapterNames("power-query-studio"),
    curriculumTopicIds: powerQueryLessons.map((lesson) => lesson.id),
    checkpoints: [
      checkpoint(
        "power-query-studio",
        "power-query-foundations-connections",
        "Checkpoint 1: Foundations and Connections",
        ["Foundations", "Connections and Imports"],
        22,
      ),
      checkpoint(
        "power-query-studio",
        "power-query-transform-shape",
        "Checkpoint 2: Transforming and Shaping Data",
        ["Cleaning and Transforming", "Combining and Shaping"],
        24,
      ),
      checkpoint(
        "power-query-studio",
        "power-query-automation-performance",
        "Checkpoint 3: Automation and Performance",
        [
          "M Language and Automation",
          "Performance and Integration",
          "Business Scenarios and Interviews",
        ],
        22,
      ),
    ],
    finalExam: finalExam(
      "power-query-studio",
      "power-query-final-skill-exam",
      "Power Query Studio Final Skill Exam",
      50,
    ),
  },
  {
    studioId: "tableau-studio",
    studioName: "Tableau Studio",
    studioRoute: "/tableau-studio",
    curriculumChapterNames: getChapterNames("tableau-studio"),
    curriculumTopicIds: tableauLessons.map((lesson) => lesson.id),
    checkpoints: [
      checkpoint(
        "tableau-studio",
        "tableau-foundations-modeling",
        "Checkpoint 1: Foundations and Data Modeling",
        ["Tableau Foundations", "Data Connections and Modeling"],
        22,
      ),
      checkpoint(
        "tableau-studio",
        "tableau-analysis-interactivity",
        "Checkpoint 2: Visual and Interactive Analysis",
        ["Visual Analysis", "Calculations", "Interactive Analytics"],
        24,
      ),
      checkpoint(
        "tableau-studio",
        "tableau-publishing-readiness",
        "Checkpoint 3: Dashboards and Publishing Readiness",
        ["Dashboards and Stories", "Performance and Publishing", "Interview Preparation"],
        22,
      ),
    ],
    finalExam: finalExam(
      "tableau-studio",
      "tableau-final-skill-exam",
      "Tableau Studio Final Skill Exam",
      50,
    ),
  },
  {
    studioId: "business-analytics-studio",
    studioName: "Business Analytics Studio",
    studioRoute: "/business-analytics-studio",
    curriculumChapterNames: getChapterNames("business-analytics-studio"),
    curriculumTopicIds: businessAnalyticsLessons.map((lesson) => lesson.id),
    checkpoints: [
      checkpoint(
        "business-analytics-studio",
        "business-analytics-framing-metrics",
        "Checkpoint 1: Problem Framing and Metrics",
        ["Foundations and Problem Framing", "Metrics and Financial Performance"],
        22,
      ),
      checkpoint(
        "business-analytics-studio",
        "business-analytics-commercial-operations",
        "Checkpoint 2: Commercial, Operations, and People Analytics",
        ["Customer, Sales, and Marketing", "Operations and People"],
        24,
      ),
      checkpoint(
        "business-analytics-studio",
        "business-analytics-decisions-communication",
        "Checkpoint 3: Decisions, Communication, and Cases",
        [
          "Forecasting and Decision Science",
          "Strategy and Communication",
          "Case Studies and Interviews",
        ],
        24,
      ),
    ],
    finalExam: finalExam(
      "business-analytics-studio",
      "business-analytics-final-skill-exam",
      "Business Analytics Studio Final Skill Exam",
      50,
    ),
  },
];

export const studioAssessmentCurriculumGaps = [
  {
    studioId: "dashboard",
    studioName: "Dashboard Studio",
    studioRoute: "/dashboard",
    curriculumType: "project-based",
    existingProjectIds: dashboardProjects.map((project) => project.id),
    issue:
      "Dashboard Studio has standalone projects but no ordered chapters, so chapter checkpoint placement is deferred until its curriculum is organized.",
  },
] as const;

export const studioAssessmentOrderingNotes = [
  {
    studioId: "formula-studio",
    note:
      "Formula Studio is a categorized reference library rather than a strictly ordered course; its checkpoints group existing categories without changing their order.",
  },
] as const;
