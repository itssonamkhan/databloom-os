"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Heart, Sparkles } from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import BusinessAnalyticsDatasets from "@/components/business-analytics/BusinessAnalyticsDatasets";
import BusinessAnalyticsLessonCard from "@/components/business-analytics/BusinessAnalyticsLessonCard";
import BusinessAnalyticsRoadmap from "@/components/business-analytics/BusinessAnalyticsRoadmap";
import BusinessFrameworkReference from "@/components/business-analytics/BusinessFrameworkReference";
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
import {
  businessAnalyticsCategories,
  businessAnalyticsDifficulties,
  businessAnalyticsLessons,
  type BusinessAnalyticsLesson,
} from "@/lib/businessAnalyticsLessons";
import {
  BUSINESS_ANALYTICS_PROGRESS_EVENT,
  calculateBusinessAnalyticsProgress,
  getCompletedBusinessAnalyticsLessonIds,
  getFavoriteBusinessAnalyticsLessonIds,
  loadBusinessAnalyticsProgress,
  toggleBusinessAnalyticsFavorite,
  type BusinessAnalyticsProgressState,
} from "@/lib/businessAnalyticsProgress";
import { playClickSound, playNotificationSound } from "@/lib/sounds";
import {
  getStudioCurriculumConfiguration,
  validateStudioCurriculum,
} from "@/lib/studioCurriculum";
import type { StudioCheckpoint } from "@/lib/studioAssessments";

const businessAnalyticsLessonsById = new Map(
  businessAnalyticsLessons.map((lesson) => [lesson.id, lesson]),
);

function getBusinessAnalyticsStudioConfigurations() {
  const curriculum = getStudioCurriculumConfiguration(
    "business-analytics-studio",
  );
  const assessment = getStudioAssessmentConfiguration(
    "business-analytics-studio",
  );

  if (!curriculum || !assessment) {
    throw new Error(
      "Business Analytics Studio curriculum or assessment configuration is missing.",
    );
  }

  const validation = validateStudioCurriculum(curriculum);
  if (!validation.isValid) {
    throw new Error(
      "Business Analytics Studio curriculum configuration is invalid.",
    );
  }

  return { curriculum, assessment };
}

const {
  curriculum: businessAnalyticsCurriculum,
  assessment: businessAnalyticsAssessment,
} = getBusinessAnalyticsStudioConfigurations();

function BusinessAnalyticsCheckpointMilestone({
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
            href={`/checkpoint/business-analytics-studio/${checkpoint.id}`}
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

export default function BusinessAnalyticsStudio() {
  const [learningView, setLearningView] = useState<"guided" | "library">(
    "guided",
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [progress, setProgress] = useState<BusinessAnalyticsProgressState>(() =>
    loadBusinessAnalyticsProgress(),
  );
  const [checkpointProgress, setCheckpointProgress] =
    useState<CheckpointProgressState | null>(null);

  useEffect(() => {
    const syncProgress = () => setProgress(loadBusinessAnalyticsProgress());
    window.addEventListener(BUSINESS_ANALYTICS_PROGRESS_EVENT, syncProgress);
    window.addEventListener("storage", syncProgress);
    return () => {
      window.removeEventListener(BUSINESS_ANALYTICS_PROGRESS_EVENT, syncProgress);
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

  const completedLessonIds = useMemo(
    () => getCompletedBusinessAnalyticsLessonIds(progress),
    [progress],
  );
  const favoriteLessonIds = useMemo(
    () => getFavoriteBusinessAnalyticsLessonIds(progress),
    [progress],
  );
  const completedLessonIdSet = useMemo(
    () => new Set(completedLessonIds),
    [completedLessonIds],
  );

  const filteredLessons = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return businessAnalyticsLessons.filter((lesson) => {
      const matchesSearch =
        !query ||
        [lesson.title, lesson.category, lesson.description, lesson.difficulty, lesson.explanation].some((value) =>
          value.toLocaleLowerCase().includes(query),
        );
      return (
        matchesSearch &&
        (category === "All" || lesson.category === category) &&
        (difficulty === "All" || lesson.difficulty === difficulty) &&
        (!favoritesOnly || favoriteLessonIds.includes(lesson.id))
      );
    });
  }, [category, difficulty, favoriteLessonIds, favoritesOnly, search]);

  const total = businessAnalyticsCurriculum.officialCoreLessonIds.length;
  const percentage = calculateBusinessAnalyticsProgress(
    completedLessonIds.length,
    total,
  );
  const finalExamStatus = checkpointProgress
    ? getFinalSkillExamUnlockStatus(
        businessAnalyticsAssessment,
        completedLessonIds,
        checkpointProgress,
      )
    : null;
  const masteryScore = getCurrentFinalMasteryScore(
    checkpointProgress?.masteryResults["business-analytics-studio"],
  );

  function handleToggleFavorite(id: string) {
    const wasFavorite = favoriteLessonIds.includes(id);
    const next = toggleBusinessAnalyticsFavorite(id);
    setProgress(next);
    if (!wasFavorite && next.favoriteLessonIds.includes(id)) playNotificationSound();
  }

  function clearFilters() {
    playClickSound();
    setSearch("");
    setCategory("All");
    setDifficulty("All");
    setFavoritesOnly(false);
  }

  return (
    <AppLayout>
      <div className="min-w-0 space-y-9 text-slate-950">
        <header className="rounded-3xl border border-white/70 bg-gradient-to-br from-indigo-100 via-pink-100 to-amber-100 p-7 shadow-lg sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-bold text-indigo-900"><BriefcaseBusiness size={18} aria-hidden="true" /> Decision-ready analytics</p>
              <h1 className="mt-4 text-4xl font-black text-indigo-800 sm:text-5xl">📊 Business Analytics Studio</h1>
              <p className="mt-4 text-lg leading-8 text-slate-700">Learn to frame business problems, design useful metrics, analyze growth and operations, decide under uncertainty, and communicate actions.</p>
            </div>
            <div className="rounded-2xl bg-white/85 px-7 py-5 text-center shadow-sm">
              <p className="text-4xl font-black text-indigo-800">{total}</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">Complete lessons</p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Total lessons" value={String(total)} tone="text-indigo-800" />
          <SummaryCard label="Completed" value={`${completedLessonIds.length}/${total}`} tone="text-emerald-700" />
          <SummaryCard label="Favorites" value={String(favoriteLessonIds.length)} tone="text-pink-700" />
          <SummaryCard label="Business progress" value={`${percentage}%`} tone="text-amber-700" />
        </section>

        <section className="rounded-3xl border border-indigo-100 bg-white/85 p-6 shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div><p className="text-sm font-bold uppercase tracking-wider text-indigo-700">Your journey</p><h2 className="mt-1 text-2xl font-black">Lesson progress</h2></div>
            <span className="font-black text-indigo-800">{percentage}%</span>
          </div>
          <div className="mt-4 h-4 overflow-hidden rounded-full bg-indigo-100" role="progressbar" aria-label="Business Analytics lesson progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}>
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-purple-500 to-amber-500 transition-[width] duration-500" style={{ width: `${percentage}%` }} />
          </div>
        </section>

        <nav
          aria-label="Business Analytics learning mode"
          className="flex flex-wrap gap-2 rounded-3xl border border-[var(--databloom-border)] bg-[var(--databloom-card)] p-3 shadow-md"
        >
          <button
            type="button"
            aria-pressed={learningView === "guided"}
            onClick={() => {
              playClickSound();
              setLearningView("guided");
            }}
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
            onClick={() => {
              playClickSound();
              setLearningView("library");
            }}
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
              <h2 className="mt-1 break-words text-3xl font-black text-[var(--databloom-text-heading)]">
                Eight modules · {total} lessons
              </h2>
              <p className="mt-2 max-w-3xl leading-7 text-[var(--databloom-text-secondary)]">
                Follow every module in order for the complete official Business
                Analytics path, or switch to the Reference Library for search,
                categories, difficulty filters, and favorites.
              </p>
            </section>

            {businessAnalyticsCurriculum.modules.map((module) => {
              const moduleLessons = module.lessonIds
                .map((lessonId) => businessAnalyticsLessonsById.get(lessonId))
                .filter(
                  (lesson): lesson is BusinessAnalyticsLesson =>
                    Boolean(lesson),
                );
              const moduleCategories = Array.from(
                new Set(moduleLessons.map((lesson) => lesson.category)),
              );
              const checkpointPlacement =
                businessAnalyticsCurriculum.checkpointPlacements.find(
                  (placement) =>
                    placement.placementStatus === "placed" &&
                    placement.afterModuleId === module.id,
                );
              const checkpoint = checkpointPlacement
                ? businessAnalyticsAssessment.checkpoints.find(
                    (item) => item.id === checkpointPlacement.checkpointId,
                  )
                : undefined;
              const checkpointCompletion = checkpoint
                ? checkpointProgress?.completions[
                    `business-analytics-studio:${checkpoint.id}`
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
                          <BusinessAnalyticsLessonCard
                            lesson={lesson}
                            completed={completedLessonIdSet.has(lesson.id)}
                            favorite={favoriteLessonIds.includes(lesson.id)}
                            onToggleFavorite={handleToggleFavorite}
                          />
                        </div>
                      ))}
                    </div>
                  </section>

                  {checkpoint && (
                    <BusinessAnalyticsCheckpointMilestone
                      checkpoint={checkpoint}
                      completedLessonIds={completedLessonIds}
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
              <h2 className="mt-1 break-words text-2xl font-black text-[var(--databloom-text-heading)] sm:text-3xl">
                Review the complete Business Analytics Studio curriculum
              </h2>
              <p className="mt-2 max-w-3xl leading-7 text-[var(--databloom-text-secondary)]">
                Revisit all {total} lessons, use the existing lesson-level
                practice, and pass all three checkpoints before the existing
                Final Skill Exam.
              </p>
            </section>

            <section className="rounded-3xl border border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] p-5 shadow-md sm:p-6">
              <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-black uppercase tracking-wider text-[var(--databloom-text-accent)]">
                    Official studio mastery
                  </p>
                  <h2 className="mt-1 break-words text-2xl font-black text-[var(--databloom-text-heading)] sm:text-3xl">
                    {businessAnalyticsAssessment.finalExam.name}
                  </h2>
                  <p className="mt-2 max-w-3xl leading-7 text-[var(--databloom-text-secondary)]">
                    {masteryScore !== undefined
                      ? `Mastered · ${masteryScore}%`
                      : finalExamStatus?.unlocked
                        ? `Ready · Pass at ${businessAnalyticsAssessment.finalExam.suggestedPassingScore}%`
                        : finalExamStatus
                          ? `Pass ${finalExamStatus.missingCheckpointIds.length} remaining checkpoints and complete ${finalExamStatus.missingTopicIds.length} remaining lessons.`
                          : "Checking curriculum and checkpoint progress…"}
                  </p>
                </div>

                {finalExamStatus?.unlocked ? (
                  <Link
                    href={`/final-exam/business-analytics-studio/${businessAnalyticsCurriculum.finalSkillExam.assessmentId}`}
                    className="inline-flex min-h-12 w-full shrink-0 items-center justify-center rounded-2xl bg-[var(--databloom-action)] px-6 py-3 text-center font-black text-[var(--databloom-text-on-accent)] transition hover:bg-[var(--databloom-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--databloom-focus)] sm:w-auto"
                  >
                    {masteryScore !== undefined
                      ? "Improve mastery score"
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
          <section
            className="min-w-0"
            aria-labelledby="business-analytics-lessons-heading"
          >
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-indigo-700"><Sparkles size={17} aria-hidden="true" /> Learn by deciding</p>
            <h2 id="business-analytics-lessons-heading" className="mt-1 break-words text-3xl font-black">Business Analytics lesson library</h2>
            <div className="mt-4 min-w-0">
              <StudioFilterToolbar
                query={search}
                onQueryChange={setSearch}
                category={category}
                onCategoryChange={setCategory}
                categories={businessAnalyticsCategories}
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
                difficulties={businessAnalyticsDifficulties}
                resultCount={filteredLessons.length}
                searchPlaceholder="Search Business Analytics lessons"
                actions={
                  <button type="button" aria-pressed={favoritesOnly} onClick={() => { playClickSound(); setFavoritesOnly((current) => !current); }} className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-bold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 ${favoritesOnly ? "border-pink-300 bg-pink-100 text-pink-900" : "border-white/95 bg-white/65 text-slate-800 hover:border-purple-200 hover:bg-white/90"}`}>
                    <Heart size={18} fill={favoritesOnly ? "currentColor" : "none"} aria-hidden="true" /> Favorites
                  </button>
                }
              />
            </div>
            {filteredLessons.length > 0 ? (
              <div className="mt-7 grid min-w-0 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                {filteredLessons.map((lesson) => (
                  <div key={lesson.id} className="min-w-0">
                    <BusinessAnalyticsLessonCard lesson={lesson} completed={completedLessonIdSet.has(lesson.id)} favorite={favoriteLessonIds.includes(lesson.id)} onToggleFavorite={handleToggleFavorite} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-7 rounded-3xl border border-dashed border-indigo-300 bg-indigo-50 p-10 text-center">
                <p className="font-bold text-indigo-950">No lessons match those filters.</p>
                <button type="button" onClick={clearFilters} className="mt-4 rounded-xl bg-indigo-700 px-5 py-3 font-bold text-white transition hover:bg-indigo-800">Clear filters</button>
              </div>
            )}
          </section>
        )}

        <BusinessAnalyticsRoadmap completedLessonIds={completedLessonIds} />
        <BusinessAnalyticsDatasets />
        <BusinessFrameworkReference />
      </div>
    </AppLayout>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: string }) {
  return <article className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-md"><p className="font-semibold text-slate-700">{label}</p><p className={`mt-2 text-3xl font-black ${tone}`}>{value}</p></article>;
}
