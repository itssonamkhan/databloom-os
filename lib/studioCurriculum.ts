import { formulas } from "@/lib/formulas";
import { pythonLessons } from "@/lib/pythonLessons";
import { sqlLessons } from "@/lib/sqlLessons";
import {
  studioAssessmentConfigurations,
  type AssessableStudioId,
} from "@/lib/studioAssessments";
import { statisticsLessons } from "@/lib/statisticsLessons";
import { tableauLessons } from "@/lib/tableauLessons";

export type SupportedCurriculumStudioId = Extract<
  AssessableStudioId,
  | "formula-studio"
  | "sql-studio"
  | "python-studio"
  | "statistics-studio"
  | "tableau-studio"
>;

export type CurriculumStructureKind =
  | "chapter-based"
  | "project-based"
  | "resource-hub";

export type CurriculumNavigationMode =
  | "guided-path"
  | "project-path"
  | "searchable-library";

export type CurriculumOrganizationStatus = "foundation" | "organized";

export type CurriculumPracticeMetadata = {
  kind: "existing-lesson-practice" | "module-review";
  placement: "lesson-level" | "after-module";
  label: string;
  routePattern?: `/${SupportedCurriculumStudioId}/[id]/practice`;
};

export type CurriculumReviewMetadata = {
  title: string;
  description?: string;
  status: "planned" | "available";
};

export type CurriculumModuleDefinition = {
  id: string;
  title: string;
  description?: string;
  lessonIds: readonly string[];
  practice?: CurriculumPracticeMetadata;
  review?: CurriculumReviewMetadata;
  presentation?: {
    eyebrow?: string;
    summary?: string;
  };
};

export type CurriculumCheckpointPlacement = {
  checkpointId: string;
  placementStatus: "pending" | "placed";
  afterModuleId: string | null;
};

export type CurriculumFinalReview = {
  title: string;
  description?: string;
  coverage: "all-core-lessons";
  placement: "after-modules";
  status: "planned" | "available";
};

export type CurriculumFinalSkillExamPlacement = {
  assessmentId: string;
  placement: "after-final-review";
};

export type StudioCurriculumConfiguration = {
  studioId: SupportedCurriculumStudioId;
  studioName: string;
  studioRoute: `/${SupportedCurriculumStudioId}`;
  overview: {
    description: string;
    organizationStatus: CurriculumOrganizationStatus;
  };
  structureKind: CurriculumStructureKind;
  navigationMode: CurriculumNavigationMode;
  officialCoreLessonIds: readonly string[];
  modules: readonly CurriculumModuleDefinition[];
  checkpointPlacements: readonly CurriculumCheckpointPlacement[];
  finalReview: CurriculumFinalReview;
  finalSkillExam: CurriculumFinalSkillExamPlacement;
};

type CurriculumLessonReference = {
  id: string;
};

type SupportedCurriculumSource = {
  studioId: SupportedCurriculumStudioId;
  studioName: string;
  description: string;
  structureKind: CurriculumStructureKind;
  navigationMode: CurriculumNavigationMode;
  lessons: readonly CurriculumLessonReference[];
  organizationStatus?: CurriculumOrganizationStatus;
  modules?: readonly CurriculumModuleDefinition[];
  checkpointPlacements?: readonly CurriculumCheckpointPlacement[];
};

function getFormulaIdsByCategory(categoryNames: readonly string[]) {
  const categories = new Set(categoryNames);
  return formulas
    .filter((formula) => categories.has(formula.category))
    .map((formula) => formula.id);
}

const formulaCurriculumModules: readonly CurriculumModuleDefinition[] = [
  {
    id: "numeric-foundations",
    title: "Numeric Foundations",
    lessonIds: getFormulaIdsByCategory([
      "Beginner Foundation",
      "Statistical Functions",
      "Number Formatting",
    ]),
    practice: {
      kind: "existing-lesson-practice",
      placement: "lesson-level",
      label: "Formula practice",
      routePattern: "/formula-studio/[id]/practice",
    },
    presentation: {
      eyebrow: "Module 1",
      summary: "Totals, counts, statistical measures, and reliable rounding.",
    },
  },
  {
    id: "logical-conditional-analysis",
    title: "Logical & Conditional Analysis",
    lessonIds: getFormulaIdsByCategory([
      "Logical Functions",
      "Conditional Analysis",
    ]),
    practice: {
      kind: "existing-lesson-practice",
      placement: "lesson-level",
      label: "Formula practice",
      routePattern: "/formula-studio/[id]/practice",
    },
    presentation: {
      eyebrow: "Module 2",
      summary: "Decision rules and analysis across one or more conditions.",
    },
  },
  {
    id: "lookup-reference",
    title: "Lookup & Reference",
    lessonIds: getFormulaIdsByCategory(["Lookup & Reference"]),
    practice: {
      kind: "existing-lesson-practice",
      placement: "lesson-level",
      label: "Formula practice",
      routePattern: "/formula-studio/[id]/practice",
    },
    presentation: {
      eyebrow: "Module 3",
      summary: "Find, match, and return values from structured data.",
    },
  },
  {
    id: "text-data-cleaning",
    title: "Text & Data Cleaning",
    lessonIds: getFormulaIdsByCategory([
      "Text Cleaning",
      "Data Cleaning",
      "Text Formatting",
      "Text Combining",
    ]),
    practice: {
      kind: "existing-lesson-practice",
      placement: "lesson-level",
      label: "Formula practice",
      routePattern: "/formula-studio/[id]/practice",
    },
    presentation: {
      eyebrow: "Module 4",
      summary: "Extract, clean, format, and combine worksheet text.",
    },
  },
  {
    id: "date-time",
    title: "Date & Time",
    lessonIds: getFormulaIdsByCategory(["Date & Time"]),
    practice: {
      kind: "existing-lesson-practice",
      placement: "lesson-level",
      label: "Formula practice",
      routePattern: "/formula-studio/[id]/practice",
    },
    presentation: {
      eyebrow: "Module 5",
      summary: "Build dependable calendar and reporting-period logic.",
    },
  },
  {
    id: "modern-advanced-excel",
    title: "Modern & Advanced Excel",
    lessonIds: getFormulaIdsByCategory(["Dynamic Array", "Advanced Excel"]),
    practice: {
      kind: "existing-lesson-practice",
      placement: "lesson-level",
      label: "Formula practice",
      routePattern: "/formula-studio/[id]/practice",
    },
    presentation: {
      eyebrow: "Module 6",
      summary: "Dynamic arrays and reusable modern Excel formulas.",
    },
  },
];

const supportedCurriculumSources: readonly SupportedCurriculumSource[] = [
  {
    studioId: "formula-studio",
    studioName: "Formula Studio",
    description:
      "A searchable formula reference library whose existing categories can later be grouped into review pathways.",
    structureKind: "resource-hub",
    navigationMode: "searchable-library",
    lessons: formulas,
    organizationStatus: "organized",
    modules: formulaCurriculumModules,
    checkpointPlacements: [
      {
        checkpointId: "formula-foundations-analysis",
        placementStatus: "placed",
        afterModuleId: "logical-conditional-analysis",
      },
      {
        checkpointId: "formula-lookups-text",
        placementStatus: "placed",
        afterModuleId: "text-data-cleaning",
      },
      {
        checkpointId: "formula-dates-modern-excel",
        placementStatus: "placed",
        afterModuleId: "modern-advanced-excel",
      },
    ],
  },
  {
    studioId: "sql-studio",
    studioName: "SQL Studio",
    description:
      "A guided SQL learning path built from the existing ordered lesson collection.",
    structureKind: "chapter-based",
    navigationMode: "guided-path",
    lessons: sqlLessons,
  },
  {
    studioId: "python-studio",
    studioName: "Python Studio",
    description:
      "A guided Python learning path built from the existing ordered lesson collection.",
    structureKind: "chapter-based",
    navigationMode: "guided-path",
    lessons: pythonLessons,
  },
  {
    studioId: "statistics-studio",
    studioName: "Statistics Studio",
    description:
      "A guided statistics learning path built from the existing ordered lesson collection.",
    structureKind: "chapter-based",
    navigationMode: "guided-path",
    lessons: statisticsLessons,
  },
  {
    studioId: "tableau-studio",
    studioName: "Tableau Studio",
    description:
      "A guided Tableau learning path built from the existing ordered lesson collection.",
    structureKind: "chapter-based",
    navigationMode: "guided-path",
    lessons: tableauLessons,
  },
];

function createFoundationConfiguration(
  source: SupportedCurriculumSource,
): StudioCurriculumConfiguration {
  const assessment = studioAssessmentConfigurations.find(
    (configuration) => configuration.studioId === source.studioId,
  );

  if (!assessment) {
    throw new Error(
      `Missing assessment configuration for ${source.studioId}.`,
    );
  }

  const officialCoreLessonIds = source.lessons.map((lesson) => lesson.id);

  return {
    studioId: source.studioId,
    studioName: source.studioName,
    studioRoute: `/${source.studioId}`,
    overview: {
      description: source.description,
      organizationStatus: source.organizationStatus ?? "foundation",
    },
    structureKind: source.structureKind,
    navigationMode: source.navigationMode,
    officialCoreLessonIds,
    modules: source.modules ?? [
      {
        id: "current-sequence",
        title: "Current curriculum sequence",
        description:
          "Preserves the raw lesson array order until detailed module organization is approved.",
        lessonIds: officialCoreLessonIds,
        practice: {
          kind: "existing-lesson-practice",
          placement: "lesson-level",
          label: "Lesson practice",
          routePattern: `/${source.studioId}/[id]/practice`,
        },
      },
    ],
    checkpointPlacements:
      source.checkpointPlacements ??
      assessment.checkpoints.map((checkpoint) => ({
        checkpointId: checkpoint.id,
        placementStatus: "pending",
        afterModuleId: null,
      })),
    finalReview: {
      title: "Final review",
      description:
        "A future review of all official core lessons before the existing Final Skill Exam.",
      coverage: "all-core-lessons",
      placement: "after-modules",
      status:
        source.organizationStatus === "organized" ? "available" : "planned",
    },
    finalSkillExam: {
      assessmentId: assessment.finalExam.id,
      placement: "after-final-review",
    },
  };
}

export const studioCurriculumConfigurations: readonly StudioCurriculumConfiguration[] =
  supportedCurriculumSources.map(createFoundationConfiguration);

export type CurriculumValidationIssueCode =
  | "duplicate-lesson-id"
  | "missing-core-lesson-id"
  | "unknown-lesson-id"
  | "duplicate-checkpoint-id"
  | "missing-checkpoint-reference"
  | "unknown-checkpoint-reference"
  | "unknown-final-exam-reference"
  | "unknown-module-reference";

export type CurriculumValidationIssue = {
  code: CurriculumValidationIssueCode;
  ids: readonly string[];
  message: string;
};

export type StudioCurriculumValidationResult = {
  studioId: SupportedCurriculumStudioId;
  structureKind: CurriculumStructureKind;
  navigationMode: CurriculumNavigationMode;
  isValid: boolean;
  everyOfficialCoreLessonAppearsExactlyOnce: boolean;
  duplicateLessonIds: readonly string[];
  missingCoreLessonIds: readonly string[];
  unknownLessonIds: readonly string[];
  duplicateCheckpointIds: readonly string[];
  missingCheckpointReferences: readonly string[];
  unknownCheckpointReferences: readonly string[];
  unknownFinalExamReference: string | null;
  unknownModuleReferences: readonly string[];
  issues: readonly CurriculumValidationIssue[];
};

function unique(values: readonly string[]) {
  return Array.from(new Set(values));
}

function findDuplicates(values: readonly string[]) {
  const counts = new Map<string, number>();

  values.forEach((value) => {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([value]) => value);
}

export function getStudioCurriculumConfiguration(
  studioId: string,
): StudioCurriculumConfiguration | undefined {
  return studioCurriculumConfigurations.find(
    (configuration) => configuration.studioId === studioId,
  );
}

export function validateStudioCurriculum(
  configuration: StudioCurriculumConfiguration,
): StudioCurriculumValidationResult {
  const assessment = studioAssessmentConfigurations.find(
    (item) => item.studioId === configuration.studioId,
  );
  const configuredLessonIds = configuration.modules.flatMap(
    (module) => module.lessonIds,
  );
  const officialCoreLessonIds = unique(configuration.officialCoreLessonIds);
  const officialCoreLessonIdSet = new Set(officialCoreLessonIds);
  const lessonCounts = new Map<string, number>();

  configuredLessonIds.forEach((lessonId) => {
    lessonCounts.set(lessonId, (lessonCounts.get(lessonId) ?? 0) + 1);
  });

  const duplicateLessonIds = unique([
    ...findDuplicates(configuration.officialCoreLessonIds),
    ...findDuplicates(configuredLessonIds),
  ]);
  const missingCoreLessonIds = officialCoreLessonIds.filter(
    (lessonId) => !lessonCounts.has(lessonId),
  );
  const unknownLessonIds = unique(
    configuredLessonIds.filter(
      (lessonId) => !officialCoreLessonIdSet.has(lessonId),
    ),
  );

  const knownCheckpointIds = assessment?.checkpoints.map(
    (checkpoint) => checkpoint.id,
  ) ?? [];
  const checkpointReferences = configuration.checkpointPlacements.map(
    (placement) => placement.checkpointId,
  );
  const duplicateCheckpointIds = unique([
    ...findDuplicates(knownCheckpointIds),
    ...findDuplicates(checkpointReferences),
  ]);
  const knownCheckpointIdSet = new Set(knownCheckpointIds);
  const checkpointReferenceSet = new Set(checkpointReferences);
  const missingCheckpointReferences = knownCheckpointIds.filter(
    (checkpointId) => !checkpointReferenceSet.has(checkpointId),
  );
  const unknownCheckpointReferences = unique(
    checkpointReferences.filter(
      (checkpointId) => !knownCheckpointIdSet.has(checkpointId),
    ),
  );

  const knownModuleIds = new Set(
    configuration.modules.map((module) => module.id),
  );
  const unknownModuleReferences = unique(
    configuration.checkpointPlacements.flatMap((placement) =>
      placement.placementStatus === "placed" &&
      placement.afterModuleId !== null &&
      !knownModuleIds.has(placement.afterModuleId)
        ? [placement.afterModuleId]
        : [],
    ),
  );

  const unknownFinalExamReference =
    assessment?.finalExam.id === configuration.finalSkillExam.assessmentId
      ? null
      : configuration.finalSkillExam.assessmentId;

  const everyOfficialCoreLessonAppearsExactlyOnce =
    findDuplicates(configuration.officialCoreLessonIds).length === 0 &&
    unknownLessonIds.length === 0 &&
    officialCoreLessonIds.every(
      (lessonId) => lessonCounts.get(lessonId) === 1,
    );

  const issues: CurriculumValidationIssue[] = [];
  const addIssue = (
    code: CurriculumValidationIssueCode,
    ids: readonly string[],
    message: string,
  ) => {
    if (ids.length > 0) issues.push({ code, ids, message });
  };

  addIssue(
    "duplicate-lesson-id",
    duplicateLessonIds,
    "Lesson IDs must appear only once inside a studio curriculum.",
  );
  addIssue(
    "missing-core-lesson-id",
    missingCoreLessonIds,
    "Every official core lesson must appear in the curriculum.",
  );
  addIssue(
    "unknown-lesson-id",
    unknownLessonIds,
    "Curriculum modules may reference only existing official lesson IDs.",
  );
  addIssue(
    "duplicate-checkpoint-id",
    duplicateCheckpointIds,
    "Checkpoint IDs must be unique within the studio assessment and curriculum references.",
  );
  addIssue(
    "missing-checkpoint-reference",
    missingCheckpointReferences,
    "Every existing checkpoint must be represented by a curriculum placement reference.",
  );
  addIssue(
    "unknown-checkpoint-reference",
    unknownCheckpointReferences,
    "Curriculum placement may reference only existing checkpoint IDs.",
  );
  addIssue(
    "unknown-final-exam-reference",
    unknownFinalExamReference ? [unknownFinalExamReference] : [],
    "The curriculum must reference the studio's existing Final Skill Exam.",
  );
  addIssue(
    "unknown-module-reference",
    unknownModuleReferences,
    "Placed checkpoints must reference an existing curriculum module.",
  );

  return {
    studioId: configuration.studioId,
    structureKind: configuration.structureKind,
    navigationMode: configuration.navigationMode,
    isValid:
      issues.length === 0 && everyOfficialCoreLessonAppearsExactlyOnce,
    everyOfficialCoreLessonAppearsExactlyOnce,
    duplicateLessonIds,
    missingCoreLessonIds,
    unknownLessonIds,
    duplicateCheckpointIds,
    missingCheckpointReferences,
    unknownCheckpointReferences,
    unknownFinalExamReference,
    unknownModuleReferences,
    issues,
  };
}

export function validateAllStudioCurricula() {
  return studioCurriculumConfigurations.map(validateStudioCurriculum);
}

export const studioCurriculumValidationResults = validateAllStudioCurricula();
