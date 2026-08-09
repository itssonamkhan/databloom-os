"use client";

import { useEffect, useMemo, useState } from "react";
import { ChartNoAxesCombined, Download, Sparkles } from "lucide-react";
import Link from "next/link";

import AppLayout from "@/components/layout/AppLayout";
import StatisticsLessonCard from "@/components/statistics/StatisticsLessonCard";
import StudioFilterToolbar from "@/components/studio/StudioFilterToolbar";
import {
  CHECKPOINT_PROGRESS_EVENT,
  getFinalSkillExamUnlockStatus,
  getStudioAssessmentConfiguration,
  isCheckpointUnlocked,
  loadCheckpointProgress,
  type CheckpointCompletion,
  type CheckpointProgressState,
} from "@/lib/checkpointExams";
import {
  statisticsCategories,
  statisticsDifficulties,
  statisticsLessons,
  type StatisticsLesson,
} from "@/lib/statisticsLessons";
import {
  calculateStatisticsProgress,
  loadStatisticsProgress,
  STATISTICS_PROGRESS_EVENT,
  toggleStatisticsFavorite,
  type StatisticsProgressState,
} from "@/lib/statisticsProgress";
import { playClickSound, playNotificationSound } from "@/lib/sounds";
import {
  getStudioCurriculumConfiguration,
  validateStudioCurriculum,
} from "@/lib/studioCurriculum";
import type { StudioCheckpoint } from "@/lib/studioAssessments";

const statisticsLessonsById = new Map(
  statisticsLessons.map((lesson) => [lesson.id, lesson]),
);

function getStatisticsStudioConfigurations() {
  const curriculum = getStudioCurriculumConfiguration("statistics-studio");
  const assessment = getStudioAssessmentConfiguration("statistics-studio");

  if (!curriculum || !assessment) {
    throw new Error(
      "Statistics Studio curriculum or assessment configuration is missing.",
    );
  }

  const validation = validateStudioCurriculum(curriculum);
  if (!validation.isValid) {
    throw new Error("Statistics Studio curriculum configuration is invalid.");
  }

  return { curriculum, assessment };
}

const {
  curriculum: statisticsCurriculum,
  assessment: statisticsAssessment,
} = getStatisticsStudioConfigurations();

function StatisticsCheckpointMilestone({
  checkpoint,
  completedLessonIds,
  completion,
}: {
  checkpoint: StudioCheckpoint;
  completedLessonIds: readonly string[];
  completion?: CheckpointCompletion;
}) {
  const unlocked = isCheckpointUnlocked(checkpoint, completedLessonIds);
  const completed = new Set(completedLessonIds);
  const remaining = checkpoint.unlockRequirement.requiredTopicIds.filter(
    (lessonId) => !completed.has(lessonId),
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
            href={`/checkpoint/statistics-studio/${checkpoint.id}`}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--databloom-action)] px-5 py-3 text-center font-black text-[var(--databloom-text-on-accent)] transition hover:bg-[var(--databloom-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--databloom-focus)]"
          >
            {completion ? "Review checkpoint" : "Start checkpoint"}
          </Link>
        ) : (
          <span className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-card)] px-5 py-3 font-black text-[var(--databloom-text-muted)]">
            Locked
          </span>
        )}
      </div>
    </aside>
  );
}

export default function StatisticsStudioPage() {
  const [learningView, setLearningView] = useState<"guided" | "library">(
    "guided",
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [progress, setProgress] = useState<StatisticsProgressState>(() =>
    loadStatisticsProgress(),
  );
  const [checkpointProgress, setCheckpointProgress] =
    useState<CheckpointProgressState | null>(null);

  useEffect(() => {
    const syncProgress = () => setProgress(loadStatisticsProgress());
    window.addEventListener(STATISTICS_PROGRESS_EVENT, syncProgress);
    window.addEventListener("storage", syncProgress);

    return () => {
      window.removeEventListener(STATISTICS_PROGRESS_EVENT, syncProgress);
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

  const filteredLessons = useMemo(() => {
    const query = search.trim().toLowerCase();

    return statisticsLessons.filter((lesson) => {
      const matchesSearch =
        !query ||
        [
          lesson.title,
          lesson.category,
          lesson.description,
          lesson.difficulty,
        ].some((value) => value.toLowerCase().includes(query));

      return (
        matchesSearch &&
        (category === "All" || lesson.category === category) &&
        (difficulty === "All" || lesson.difficulty === difficulty)
      );
    });
  }, [category, difficulty, search]);

  const percentage = calculateStatisticsProgress(
    progress.completedLessonIds.length,
    statisticsLessons.length,
  );
  const finalExamStatus = checkpointProgress
    ? getFinalSkillExamUnlockStatus(
        statisticsAssessment,
        progress.completedLessonIds,
        checkpointProgress,
      )
    : null;
  const masteryResult =
    checkpointProgress?.masteryResults["statistics-studio"];

  function handleToggleFavorite(id: string) {
    const wasFavorite = progress.favoriteLessonIds.includes(id);
    const next = toggleStatisticsFavorite(id);
    setProgress(next);

    if (!wasFavorite && next.favoriteLessonIds.includes(id)) {
      playNotificationSound();
    }
  }

  return (
    <AppLayout>
      <div className="min-w-0 space-y-8 text-slate-950">
        <header className="rounded-3xl border border-white/70 bg-gradient-to-br from-violet-100 via-pink-100 to-sky-100 p-7 shadow-lg sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-bold text-violet-900">
                <ChartNoAxesCombined size={17} aria-hidden="true" /> Data-informed
                decisions
              </p>
              <h1 className="mt-4 text-4xl font-black text-violet-800 sm:text-5xl">
                📈 Statistics Studio
              </h1>
              <p className="mt-4 text-lg leading-8 text-slate-700">
                Build statistical intuition from descriptive measures and
                probability through experiments, regression, business analysis,
                and analyst interviews.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl bg-white/85 px-6 py-4 text-center shadow-sm">
                <p className="text-3xl font-black text-violet-800">
                  {statisticsLessons.length}
                </p>
                <p className="text-sm font-semibold text-slate-700">
                  Total lessons
                </p>
              </div>
              <DatasetDownload
                href="/datasets/statistics-sales-practice.csv"
                label="Sales dataset"
                className="bg-violet-700 hover:bg-violet-800 focus-visible:ring-violet-700"
              />
              <DatasetDownload
                href="/datasets/statistics-ab-test-practice.csv"
                label="A/B test dataset"
                className="bg-pink-700 hover:bg-pink-800 focus-visible:ring-pink-700"
              />
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Total lessons"
            value={String(statisticsLessons.length)}
            tone="text-violet-800"
          />
          <SummaryCard
            label="Completed"
            value={`${progress.completedLessonIds.length}/${statisticsLessons.length}`}
            tone="text-emerald-700"
          />
          <SummaryCard
            label="Favorites"
            value={String(progress.favoriteLessonIds.length)}
            tone="text-pink-700"
          />
          <SummaryCard
            label="Statistics progress"
            value={`${percentage}%`}
            tone="text-indigo-700"
          />
        </section>

        <section className="rounded-3xl border border-violet-100 bg-white/85 p-6 shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-violet-700">
                Your journey
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">
                Lesson progress
              </h2>
            </div>
            <span className="font-black text-violet-800">{percentage}%</span>
          </div>
          <div
            className="mt-4 h-4 overflow-hidden rounded-full bg-violet-100"
            role="progressbar"
            aria-label="Statistics lesson progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 via-pink-500 to-sky-500 transition-[width] duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </section>

        <nav
          aria-label="Statistics learning mode"
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
                Nine modules · {statisticsCurriculum.officialCoreLessonIds.length} lessons
              </h2>
              <p className="mt-2 max-w-3xl leading-7 text-[var(--databloom-text-secondary)]">
                Follow the modules in prerequisite order for a structured
                Statistics path, or switch to the Reference Library whenever
                you need search, categories, and difficulty filters.
              </p>
            </section>

            {statisticsCurriculum.modules.map((module) => {
              const moduleLessons = module.lessonIds
                .map((lessonId) => statisticsLessonsById.get(lessonId))
                .filter(
                  (lesson): lesson is StatisticsLesson => Boolean(lesson),
                );
              const moduleCategories = Array.from(
                new Set(moduleLessons.map((lesson) => lesson.category)),
              );
              const checkpointPlacement =
                statisticsCurriculum.checkpointPlacements.find(
                  (placement) =>
                    placement.placementStatus === "placed" &&
                    placement.afterModuleId === module.id,
                );
              const checkpoint = checkpointPlacement
                ? statisticsAssessment.checkpoints.find(
                    (item) => item.id === checkpointPlacement.checkpointId,
                  )
                : undefined;
              const checkpointCompletion = checkpoint
                ? checkpointProgress?.completions[
                    `statistics-studio:${checkpoint.id}`
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
                          <StatisticsLessonCard
                            lesson={lesson}
                            completed={progress.completedLessonIds.includes(
                              lesson.id,
                            )}
                            favorite={progress.favoriteLessonIds.includes(
                              lesson.id,
                            )}
                            onToggleFavorite={handleToggleFavorite}
                          />
                        </div>
                      ))}
                    </div>
                  </section>

                  {checkpoint && (
                    <StatisticsCheckpointMilestone
                      checkpoint={checkpoint}
                      completedLessonIds={progress.completedLessonIds}
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
                Review the complete Statistics Studio curriculum
              </h2>
              <p className="mt-2 max-w-3xl leading-7 text-[var(--databloom-text-secondary)]">
                Revisit all {statisticsCurriculum.officialCoreLessonIds.length}{" "}
                core lessons, use the existing lesson-level practice, and pass
                all three checkpoints before the existing Final Skill Exam.
              </p>
            </section>

            <section className="rounded-3xl border border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] p-5 shadow-md sm:p-6">
              <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-black uppercase tracking-wider text-[var(--databloom-text-accent)]">
                    Official studio mastery
                  </p>
                  <h2 className="mt-1 break-words text-2xl font-black text-[var(--databloom-text-heading)] sm:text-3xl">
                    {statisticsAssessment.finalExam.name}
                  </h2>
                  <p className="mt-2 max-w-3xl leading-7 text-[var(--databloom-text-secondary)]">
                    {masteryResult
                      ? `Mastered · ${masteryResult.officialMasteryScore}%`
                      : finalExamStatus?.unlocked
                        ? `Ready · Pass at ${statisticsAssessment.finalExam.suggestedPassingScore}%`
                        : finalExamStatus
                          ? `Pass ${finalExamStatus.missingCheckpointIds.length} remaining checkpoints and complete ${finalExamStatus.missingTopicIds.length} remaining lessons.`
                          : "Checking curriculum and checkpoint progress…"}
                  </p>
                </div>

                {finalExamStatus?.unlocked ? (
                  <Link
                    href={`/final-exam/statistics-studio/${statisticsCurriculum.finalSkillExam.assessmentId}`}
                    className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--databloom-action)] px-6 py-3 text-center font-black text-[var(--databloom-text-on-accent)] transition hover:bg-[var(--databloom-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--databloom-focus)]"
                  >
                    {masteryResult
                      ? "Improve mastery score"
                      : "Start Final Skill Exam"}
                  </Link>
                ) : (
                  <span className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-card)] px-6 py-3 text-center font-black text-[var(--databloom-text-muted)]">
                    Final exam locked
                  </span>
                )}
              </div>
            </section>
          </div>
        ) : (
          <section aria-labelledby="statistics-lessons-heading">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-violet-700">
                <Sparkles size={17} aria-hidden="true" /> Learn by doing
              </p>
              <h2
                id="statistics-lessons-heading"
                className="mt-1 text-3xl font-black text-slate-950"
              >
                Statistics lessons
              </h2>
            </div>

            <div className="mt-4">
              <StudioFilterToolbar
                query={search}
                onQueryChange={setSearch}
                category={category}
                onCategoryChange={setCategory}
                categories={statisticsCategories}
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
                difficulties={statisticsDifficulties}
                resultCount={filteredLessons.length}
                searchPlaceholder="Search Statistics lessons"
              />
            </div>

            {filteredLessons.length > 0 ? (
              <div className="mt-7 grid min-w-0 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                {filteredLessons.map((lesson) => (
                  <div key={lesson.id} className="min-w-0">
                    <StatisticsLessonCard
                      lesson={lesson}
                      completed={progress.completedLessonIds.includes(
                        lesson.id,
                      )}
                      favorite={progress.favoriteLessonIds.includes(lesson.id)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-7 rounded-3xl border border-dashed border-violet-300 bg-violet-50 p-10 text-center">
                <p className="font-bold text-violet-950">
                  No lessons match those filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setSearch("");
                    setCategory("All");
                    setDifficulty("All");
                  }}
                  className="mt-4 rounded-xl bg-violet-700 px-5 py-3 font-bold text-white transition hover:bg-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-700 focus-visible:ring-offset-2"
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </AppLayout>
  );
}

function DatasetDownload({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className: string;
}) {
  return (
    <a
      href={href}
      download
      onClick={playClickSound}
      className={`inline-flex items-center gap-2 rounded-2xl px-5 py-4 font-bold text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${className}`}
    >
      <Download size={19} aria-hidden="true" /> {label}
    </a>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <article className="rounded-3xl border border-violet-100 bg-white p-6 shadow-md">
      <p className="font-semibold text-slate-700">{label}</p>
      <p className={`mt-2 text-3xl font-black ${tone}`}>{value}</p>
    </article>
  );
}
