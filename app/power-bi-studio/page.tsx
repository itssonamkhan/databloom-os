"use client";

import { BarChart3, Download, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import AppLayout from "@/components/layout/AppLayout";
import PowerBILessonCard from "@/components/power-bi/PowerBILessonCard";
import StudioFilterToolbar from "@/components/studio/StudioFilterToolbar";
import {
  CHECKPOINT_PROGRESS_EVENT,
  getCurrentFinalMasteryScore,
  getFinalSkillExamUnlockStatus,
  getStudioAssessmentConfiguration,
  isCheckpointUnlocked,
  loadCheckpointProgress,
  type CheckpointCompletion,
  type CheckpointProgressState,
} from "@/lib/checkpointExams";
import { daxCategories, daxLessons } from "@/lib/daxFormulas";
import {
  powerBICategories,
  powerBIDifficulties,
  powerBILessons,
  type PowerBILesson,
} from "@/lib/powerBILessons";
import {
  calculatePowerBIProgress,
  getCompletedPowerBITopicIds,
  loadPowerBIProgress,
  POWER_BI_PROGRESS_EVENT,
  togglePowerBIFavorite,
  type PowerBIProgressState,
} from "@/lib/powerBIProgress";
import { playClickSound, playNotificationSound } from "@/lib/sounds";
import {
  getStudioCurriculumConfiguration,
  validateStudioCurriculum,
} from "@/lib/studioCurriculum";
import type { StudioCheckpoint } from "@/lib/studioAssessments";

const powerBILessonsById = new Map(
  [...powerBILessons, ...daxLessons].map((lesson) => [lesson.id, lesson]),
);

function getPowerBIStudioConfigurations() {
  const curriculum = getStudioCurriculumConfiguration("power-bi-studio");
  const assessment = getStudioAssessmentConfiguration("power-bi-studio");

  if (!curriculum || !assessment) {
    throw new Error(
      "Power BI Studio curriculum or assessment configuration is missing.",
    );
  }

  const validation = validateStudioCurriculum(curriculum);
  if (!validation.isValid) {
    throw new Error("Power BI Studio curriculum configuration is invalid.");
  }

  return { curriculum, assessment };
}

const {
  curriculum: powerBICurriculum,
  assessment: powerBIAssessment,
} = getPowerBIStudioConfigurations();

function PowerBICheckpointMilestone({
  checkpoint,
  completedTopicIds,
  completion,
}: {
  checkpoint: StudioCheckpoint;
  completedTopicIds: readonly string[];
  completion?: CheckpointCompletion;
}) {
  const unlocked = isCheckpointUnlocked(checkpoint, completedTopicIds);
  const completed = new Set(completedTopicIds);
  const remaining = checkpoint.unlockRequirement.requiredTopicIds.filter(
    (topicId) => !completed.has(topicId),
  ).length;

  return (
    <aside
      aria-label={`${checkpoint.name} milestone`}
      className="min-w-0 rounded-3xl border border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] p-5 shadow-md sm:p-6"
    >
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-black uppercase tracking-wider text-[var(--databloom-text-accent)]">
            Guided checkpoint
          </p>
          <h3 className="mt-1 break-words text-xl font-black text-[var(--databloom-text-heading)] sm:text-2xl">
            {checkpoint.name}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--databloom-text-secondary)]">
            {completion
              ? `Passed · Best score ${completion.bestScore}%`
              : unlocked
                ? `Ready · Pass at ${checkpoint.suggestedPassingScore}%`
                : `Complete ${remaining} more ${remaining === 1 ? "lesson" : "lessons"} to unlock.`}
          </p>
        </div>

        {unlocked ? (
          <Link
            href={`/checkpoint/power-bi-studio/${checkpoint.id}`}
            className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-2xl bg-[var(--databloom-action)] px-5 py-3 text-center font-black text-[var(--databloom-text-on-accent)] transition hover:bg-[var(--databloom-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--databloom-focus)] sm:w-auto"
          >
            {completion ? "Review checkpoint" : "Start checkpoint"}
          </Link>
        ) : (
          <span className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-card)] px-5 py-3 font-black text-[var(--databloom-text-muted)] sm:w-auto">
            Locked
          </span>
        )}
      </div>
    </aside>
  );
}

export default function PowerBIStudio() {
  const [learningView, setLearningView] = useState<"guided" | "library">(
    "guided",
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [daxSearch, setDaxSearch] = useState("");
  const [daxCategory, setDaxCategory] = useState("All");
  const [daxDifficulty, setDaxDifficulty] = useState("All");
  const [progress, setProgress] = useState<PowerBIProgressState>(() =>
    loadPowerBIProgress(),
  );
  const [checkpointProgress, setCheckpointProgress] =
    useState<CheckpointProgressState | null>(null);

  useEffect(() => {
    const syncProgress = () => setProgress(loadPowerBIProgress());
    window.addEventListener(POWER_BI_PROGRESS_EVENT, syncProgress);
    window.addEventListener("storage", syncProgress);
    return () => {
      window.removeEventListener(POWER_BI_PROGRESS_EVENT, syncProgress);
      window.removeEventListener("storage", syncProgress);
    };
  }, []);

  useEffect(() => {
    const syncCheckpointProgress = () => {
      setCheckpointProgress(loadCheckpointProgress());
    };

    syncCheckpointProgress();
    window.addEventListener(CHECKPOINT_PROGRESS_EVENT, syncCheckpointProgress);
    window.addEventListener("storage", syncCheckpointProgress);
    return () => {
      window.removeEventListener(
        CHECKPOINT_PROGRESS_EVENT,
        syncCheckpointProgress,
      );
      window.removeEventListener("storage", syncCheckpointProgress);
    };
  }, []);

  const filteredLessons = useMemo(
    () =>
      powerBILessons.filter(
        (lesson) =>
          (!search ||
            `${lesson.title} ${lesson.description} ${lesson.category}`
              .toLowerCase()
              .includes(search.toLowerCase())) &&
          (category === "All" || lesson.category === category) &&
          (difficulty === "All" || lesson.difficulty === difficulty),
      ),
    [category, difficulty, search],
  );
  const filteredDAXLessons = useMemo(
    () =>
      daxLessons.filter(
        (lesson) =>
          (!daxSearch ||
            `${lesson.title} ${lesson.description} ${lesson.category}`
              .toLowerCase()
              .includes(daxSearch.toLowerCase())) &&
          (daxCategory === "All" ||
            lesson.category === `DAX · ${daxCategory}`) &&
          (daxDifficulty === "All" || lesson.difficulty === daxDifficulty),
      ),
    [daxCategory, daxDifficulty, daxSearch],
  );

  const completedTopicIds = getCompletedPowerBITopicIds(progress);
  const completedTopicIdSet = new Set(completedTopicIds);
  const total = powerBICurriculum.officialCoreLessonIds.length;
  const percentage = calculatePowerBIProgress(completedTopicIds.length, total);
  const finalExamStatus = checkpointProgress
    ? getFinalSkillExamUnlockStatus(
        powerBIAssessment,
        completedTopicIds,
        checkpointProgress,
      )
    : null;
  const masteryResult =
    checkpointProgress?.masteryResults["power-bi-studio"];
  const currentMasteryScore = getCurrentFinalMasteryScore(masteryResult);
  const legacyMasteryScore =
    masteryResult && currentMasteryScore === undefined
      ? masteryResult.officialMasteryScore
      : undefined;

  function toggleFavorite(id: string) {
    const next = togglePowerBIFavorite(id);
    const added = next.favoriteIds.includes(id);
    setProgress(next);
    if (added && !progress.favoriteIds.includes(id)) playNotificationSound();
  }

  return (
    <AppLayout>
      <div className="min-w-0 space-y-9 text-slate-950">
        <header className="rounded-3xl border border-white/70 bg-gradient-to-br from-amber-100 via-pink-100 to-purple-100 p-7 shadow-lg sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-amber-900">
                <BarChart3 size={18} aria-hidden="true" /> Business intelligence
                skills
              </p>
              <h1 className="mt-4 text-4xl font-black text-amber-800 sm:text-5xl">
                📊 Power BI Studio
              </h1>
              <p className="mt-4 text-lg leading-8 text-slate-700">
                Build clean models, meaningful visuals, thoughtful dashboards,
                and a strong DAX foundation.
              </p>
            </div>
            <a
              href="/datasets/power-bi-sales-practice.csv"
              download
              onClick={playClickSound}
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-700 px-5 py-4 font-bold text-white"
            >
              <Download size={19} aria-hidden="true" /> Download Practice Dataset
            </a>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Total lessons", total],
            ["Completed", completedTopicIds.length],
            ["Favorites", progress.favoriteIds.length],
            ["Progress", `${percentage}%`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-3xl border border-amber-100 bg-white p-6 shadow-md"
            >
              <p className="font-semibold text-slate-700">{label}</p>
              <p className="mt-2 text-3xl font-black text-amber-800">{value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-amber-100 bg-white p-6 shadow-md">
          <div className="flex justify-between gap-3 font-bold">
            <span>Your Power BI journey</span>
            <span>{percentage}%</span>
          </div>
          <div
            className="mt-4 h-4 overflow-hidden rounded-full bg-amber-100"
            role="progressbar"
            aria-label="Power BI curriculum progress"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-purple-600 transition-[width]"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </section>

        <nav
          aria-label="Power BI learning mode"
          className="flex flex-wrap gap-2 rounded-3xl border border-[var(--databloom-border)] bg-[var(--databloom-card)] p-3 shadow-md"
        >
          <button
            type="button"
            aria-pressed={learningView === "guided"}
            onClick={() => setLearningView("guided")}
            className={`min-h-11 rounded-2xl border px-5 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--databloom-focus)] ${
              learningView === "guided"
                ? "border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] text-[var(--databloom-text-heading)] shadow-sm"
                : "border-transparent bg-transparent text-[var(--databloom-text-secondary)]"
            }`}
          >
            🧭 Guided Curriculum
          </button>
          <button
            type="button"
            aria-pressed={learningView === "library"}
            onClick={() => setLearningView("library")}
            className={`min-h-11 rounded-2xl border px-5 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--databloom-focus)] ${
              learningView === "library"
                ? "border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] text-[var(--databloom-text-heading)] shadow-sm"
                : "border-transparent bg-transparent text-[var(--databloom-text-secondary)]"
            }`}
          >
            🔎 Reference Library
          </button>
        </nav>

        {learningView === "guided" ? (
          <div className="min-w-0 space-y-8">
            <section className="rounded-3xl border border-[var(--databloom-border)] bg-[var(--databloom-card)] p-5 shadow-md sm:p-6">
              <p className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[var(--databloom-text-accent)]">
                <Sparkles size={17} aria-hidden="true" /> Guided Curriculum
              </p>
              <h2 className="mt-1 text-3xl font-black text-[var(--databloom-text-heading)]">
                Seven modules · {total} topics
              </h2>
              <p className="mt-2 max-w-3xl leading-7 text-[var(--databloom-text-secondary)]">
                Follow the modules in order for a structured Power BI and DAX
                path, or switch to the Reference Library whenever you need
                search, categories, and difficulty filters.
              </p>
            </section>

            {powerBICurriculum.modules.map((module) => {
              const moduleLessons = module.lessonIds
                .map((lessonId) => powerBILessonsById.get(lessonId))
                .filter((lesson): lesson is PowerBILesson => Boolean(lesson));
              const moduleCategories = Array.from(
                new Set(moduleLessons.map((lesson) => lesson.category)),
              );
              const checkpointPlacement =
                powerBICurriculum.checkpointPlacements.find(
                  (placement) =>
                    placement.placementStatus === "placed" &&
                    placement.afterModuleId === module.id,
                );
              const checkpoint = checkpointPlacement
                ? powerBIAssessment.checkpoints.find(
                    (item) => item.id === checkpointPlacement.checkpointId,
                  )
                : undefined;
              const checkpointCompletion = checkpoint
                ? checkpointProgress?.completions[
                    `power-bi-studio:${checkpoint.id}`
                  ]
                : undefined;

              return (
                <div key={module.id} className="min-w-0 space-y-5">
                  <section className="min-w-0 rounded-3xl border border-[var(--databloom-border)] bg-[var(--databloom-card)] p-4 shadow-md sm:p-6">
                    <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-black uppercase tracking-wider text-[var(--databloom-text-accent)]">
                          {module.presentation?.eyebrow}
                        </p>
                        <h2 className="mt-1 break-words text-2xl font-black text-[var(--databloom-text-heading)] sm:text-3xl">
                          {module.title}
                        </h2>
                        <p className="mt-2 max-w-3xl leading-7 text-[var(--databloom-text-secondary)]">
                          {module.presentation?.summary}
                        </p>
                      </div>
                      <span className="w-fit shrink-0 rounded-full border border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] px-3 py-1 text-sm font-black text-[var(--databloom-text-accent)]">
                        {module.lessonIds.length} lessons
                      </span>
                    </div>

                    <div className="mt-4 flex min-w-0 flex-wrap gap-2">
                      {moduleCategories.map((moduleCategory) => (
                        <span
                          key={moduleCategory}
                          className="max-w-full break-words rounded-full border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-3 py-1 text-xs font-bold text-[var(--databloom-text-secondary)]"
                        >
                          {moduleCategory}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6 grid min-w-0 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                      {moduleLessons.map((lesson) => (
                        <div key={lesson.id} className="min-w-0">
                          <PowerBILessonCard
                            lesson={lesson}
                            completed={completedTopicIdSet.has(lesson.id)}
                            favorite={progress.favoriteIds.includes(lesson.id)}
                            onToggleFavorite={toggleFavorite}
                          />
                        </div>
                      ))}
                    </div>
                  </section>

                  {checkpoint && (
                    <PowerBICheckpointMilestone
                      checkpoint={checkpoint}
                      completedTopicIds={completedTopicIds}
                      completion={checkpointCompletion}
                    />
                  )}
                </div>
              );
            })}

            <section className="rounded-3xl border border-[var(--databloom-border)] bg-[var(--databloom-card)] p-5 shadow-md sm:p-6">
              <p className="text-sm font-black uppercase tracking-wider text-[var(--databloom-text-accent)]">
                Final Review
              </p>
              <h2 className="mt-1 text-2xl font-black text-[var(--databloom-text-heading)] sm:text-3xl">
                Review the complete Power BI Studio curriculum
              </h2>
              <p className="mt-2 max-w-3xl leading-7 text-[var(--databloom-text-secondary)]">
                Revisit all {total} Power BI and DAX topics, use the existing
                lesson-level practice, and pass both checkpoints before the
                existing Final Skill Exam.
              </p>
            </section>

            <section className="rounded-3xl border border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] p-5 shadow-md sm:p-6">
              <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-black uppercase tracking-wider text-[var(--databloom-text-accent)]">
                    Official studio mastery
                  </p>
                  <h2 className="mt-1 break-words text-2xl font-black text-[var(--databloom-text-heading)] sm:text-3xl">
                    {powerBIAssessment.finalExam.name}
                  </h2>
                  <p className="mt-2 max-w-3xl leading-7 text-[var(--databloom-text-secondary)]">
                    {currentMasteryScore !== undefined
                      ? `Mastered · ${currentMasteryScore}%`
                      : legacyMasteryScore !== undefined
                        ? `Previous mastery preserved · ${legacyMasteryScore}%. Complete the current 58-topic path to validate current mastery.`
                        : finalExamStatus?.unlocked
                          ? `Ready · Pass at ${powerBIAssessment.finalExam.suggestedPassingScore}%`
                          : finalExamStatus
                            ? `Pass ${finalExamStatus.missingCheckpointIds.length} remaining checkpoints and complete ${finalExamStatus.missingTopicIds.length} remaining lessons.`
                            : "Checking curriculum and checkpoint progress…"}
                  </p>
                </div>

                {finalExamStatus?.unlocked ? (
                  <Link
                    href={`/final-exam/power-bi-studio/${powerBICurriculum.finalSkillExam.assessmentId}`}
                    className="inline-flex min-h-12 w-full shrink-0 items-center justify-center rounded-2xl bg-[var(--databloom-action)] px-6 py-3 text-center font-black text-[var(--databloom-text-on-accent)] transition hover:bg-[var(--databloom-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--databloom-focus)] sm:w-auto"
                  >
                    {currentMasteryScore !== undefined
                      ? "Improve mastery score"
                      : legacyMasteryScore !== undefined
                        ? "Validate current mastery"
                        : "Start Final Skill Exam"}
                  </Link>
                ) : (
                  <span className="inline-flex min-h-12 w-full shrink-0 items-center justify-center rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-card)] px-6 py-3 text-center font-black text-[var(--databloom-text-muted)] sm:w-auto">
                    Final exam locked
                  </span>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="min-w-0 space-y-9">
            <LessonSection
              title="Power BI lessons"
              count={filteredLessons.length}
              search={search}
              setSearch={setSearch}
              category={category}
              setCategory={setCategory}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              categories={powerBICategories}
              difficulties={powerBIDifficulties}
            >
              {filteredLessons.map((lesson) => (
                <div key={lesson.id} className="min-w-0">
                  <PowerBILessonCard
                    lesson={lesson}
                    completed={completedTopicIdSet.has(lesson.id)}
                    favorite={progress.favoriteIds.includes(lesson.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                </div>
              ))}
            </LessonSection>

            <LessonSection
              title="DAX foundation"
              count={filteredDAXLessons.length}
              search={daxSearch}
              setSearch={setDaxSearch}
              category={daxCategory}
              setCategory={setDaxCategory}
              difficulty={daxDifficulty}
              setDifficulty={setDaxDifficulty}
              categories={daxCategories}
              difficulties={powerBIDifficulties}
            >
              {filteredDAXLessons.map((lesson) => (
                <div key={lesson.id} className="min-w-0">
                  <PowerBILessonCard
                    lesson={lesson}
                    completed={completedTopicIdSet.has(lesson.id)}
                    favorite={progress.favoriteIds.includes(lesson.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                </div>
              ))}
            </LessonSection>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function LessonSection({
  title,
  count,
  search,
  setSearch,
  category,
  setCategory,
  difficulty,
  setDifficulty,
  categories,
  difficulties,
  children,
}: {
  title: string;
  count: number;
  search: string;
  setSearch: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  difficulty: string;
  setDifficulty: (value: string) => void;
  categories: string[];
  difficulties: readonly string[];
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0">
      <div>
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-800">
          <Sparkles size={17} aria-hidden="true" /> Learn by doing
        </p>
        <h2 className="mt-1 break-words text-3xl font-black">{title}</h2>
      </div>
      <div className="mt-4 min-w-0">
        <StudioFilterToolbar
          query={search}
          onQueryChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          categories={categories}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          difficulties={difficulties}
          resultCount={count}
          searchPlaceholder={`Search ${title}`}
        />
      </div>
      <div className="mt-7 grid min-w-0 gap-6 md:grid-cols-2 2xl:grid-cols-3">
        {children}
      </div>
      {count === 0 && (
        <p className="mt-6 rounded-2xl bg-amber-50 p-8 text-center font-bold">
          No lessons match those filters.
        </p>
      )}
    </section>
  );
}
