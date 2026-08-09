"use client";

import { useEffect, useMemo, useState } from "react";
import { Braces, Download, Sparkles } from "lucide-react";
import Link from "next/link";

import AppLayout from "@/components/layout/AppLayout";
import PythonLessonCard from "@/components/python/PythonLessonCard";
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
  pythonCategories,
  pythonDifficulties,
  pythonLessons,
  type PythonLesson,
} from "@/lib/pythonLessons";
import {
  calculatePythonProgress,
  loadPythonProgress,
  PYTHON_PROGRESS_EVENT,
  togglePythonFavorite,
  type PythonProgressState,
} from "@/lib/pythonProgress";
import { playClickSound, playNotificationSound } from "@/lib/sounds";
import {
  getStudioCurriculumConfiguration,
  validateStudioCurriculum,
} from "@/lib/studioCurriculum";
import type { StudioCheckpoint } from "@/lib/studioAssessments";

const pythonLessonsById = new Map(
  pythonLessons.map((lesson) => [lesson.id, lesson]),
);

function getPythonStudioConfigurations() {
  const curriculum = getStudioCurriculumConfiguration("python-studio");
  const assessment = getStudioAssessmentConfiguration("python-studio");

  if (!curriculum || !assessment) {
    throw new Error(
      "Python Studio curriculum or assessment configuration is missing.",
    );
  }

  const validation = validateStudioCurriculum(curriculum);
  if (!validation.isValid) {
    throw new Error("Python Studio curriculum configuration is invalid.");
  }

  return { curriculum, assessment };
}

const {
  curriculum: pythonCurriculum,
  assessment: pythonAssessment,
} = getPythonStudioConfigurations();

function PythonCheckpointMilestone({
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
            href={`/checkpoint/python-studio/${checkpoint.id}`}
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

export default function PythonStudioPage() {
  const [learningView, setLearningView] = useState<"guided" | "library">(
    "guided",
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [progress, setProgress] = useState<PythonProgressState>(() =>
    loadPythonProgress(),
  );
  const [checkpointProgress, setCheckpointProgress] =
    useState<CheckpointProgressState | null>(null);

  useEffect(() => {
    const syncProgress = () => setProgress(loadPythonProgress());
    window.addEventListener(PYTHON_PROGRESS_EVENT, syncProgress);
    window.addEventListener("storage", syncProgress);
    return () => {
      window.removeEventListener(PYTHON_PROGRESS_EVENT, syncProgress);
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

    return pythonLessons.filter((lesson) => {
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

  const percentage = calculatePythonProgress(
    progress.completedLessonIds.length,
    pythonLessons.length,
  );
  const finalExamStatus = checkpointProgress
    ? getFinalSkillExamUnlockStatus(
        pythonAssessment,
        progress.completedLessonIds,
        checkpointProgress,
      )
    : null;
  const masteryResult = checkpointProgress?.masteryResults["python-studio"];

  function handleToggleFavorite(id: string) {
    const wasFavorite = progress.favoriteLessonIds.includes(id);
    const next = togglePythonFavorite(id);
    setProgress(next);
    if (!wasFavorite && next.favoriteLessonIds.includes(id)) {
      playNotificationSound();
    }
  }

  return (
    <AppLayout>
      <div className="min-w-0 space-y-8 text-slate-950">
        <header className="rounded-3xl border border-white/70 bg-gradient-to-br from-cyan-100 via-blue-100 to-amber-100 p-7 shadow-lg sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-bold text-cyan-900">
                <Braces size={17} aria-hidden="true" /> Python for data analysis
              </p>
              <h1 className="mt-4 text-4xl font-black text-slate-950 sm:text-5xl">
                🐍 Python Studio
              </h1>
              <p className="mt-4 text-lg leading-8 text-slate-700">
                Grow from Python fundamentals to practical NumPy, Pandas,
                visualization, and end-to-end analyst workflows—one small lesson
                at a time.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl bg-white/85 px-6 py-4 text-center shadow-sm">
                <p className="text-3xl font-black text-cyan-800">
                  {pythonLessons.length}
                </p>
                <p className="text-sm font-semibold text-slate-700">Total lessons</p>
              </div>
              <a
                href="/datasets/python-sales-analysis.csv"
                download
                onClick={playClickSound}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-5 py-4 font-bold text-white shadow-sm transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
              >
                <Download size={19} aria-hidden="true" /> Download Practice Dataset
              </a>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Total lessons" value={String(pythonLessons.length)} tone="text-cyan-800" />
          <SummaryCard label="Completed" value={`${progress.completedLessonIds.length}/${pythonLessons.length}`} tone="text-emerald-700" />
          <SummaryCard label="Favorites" value={String(progress.favoriteLessonIds.length)} tone="text-pink-700" />
          <SummaryCard label="Python progress" value={`${percentage}%`} tone="text-blue-700" />
        </section>

        <section className="rounded-3xl border border-cyan-100 bg-white/85 p-6 shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-cyan-800">
                Your journey
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">
                Lesson progress
              </h2>
            </div>
            <span className="font-black text-cyan-900">{percentage}%</span>
          </div>
          <div
            className="mt-4 h-4 overflow-hidden rounded-full bg-cyan-100"
            role="progressbar"
            aria-label="Python lesson progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 transition-[width] duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </section>

        <nav
          aria-label="Python learning mode"
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
                Nine modules · {pythonCurriculum.officialCoreLessonIds.length} lessons
              </h2>
              <p className="mt-2 max-w-3xl leading-7 text-[var(--databloom-text-secondary)]">
                Follow the modules in order for a structured Python path, or
                switch to the Reference Library whenever you need search,
                categories, and difficulty filters.
              </p>
            </section>

            {pythonCurriculum.modules.map((module) => {
              const moduleLessons = module.lessonIds
                .map((lessonId) => pythonLessonsById.get(lessonId))
                .filter((lesson): lesson is PythonLesson => Boolean(lesson));
              const moduleCategories = Array.from(
                new Set(moduleLessons.map((lesson) => lesson.category)),
              );
              const checkpointPlacement =
                pythonCurriculum.checkpointPlacements.find(
                  (placement) =>
                    placement.placementStatus === "placed" &&
                    placement.afterModuleId === module.id,
                );
              const checkpoint = checkpointPlacement
                ? pythonAssessment.checkpoints.find(
                    (item) => item.id === checkpointPlacement.checkpointId,
                  )
                : undefined;
              const checkpointCompletion = checkpoint
                ? checkpointProgress?.completions[
                    `python-studio:${checkpoint.id}`
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
                          <PythonLessonCard
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
                    <PythonCheckpointMilestone
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
                Review the complete Python Studio curriculum
              </h2>
              <p className="mt-2 max-w-3xl leading-7 text-[var(--databloom-text-secondary)]">
                Revisit all {pythonCurriculum.officialCoreLessonIds.length} core
                lessons, use the existing lesson-level practice, and pass all
                three checkpoints before the existing Final Skill Exam.
              </p>
            </section>

            <section className="rounded-3xl border border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] p-5 shadow-md sm:p-6">
              <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-black uppercase tracking-wider text-[var(--databloom-text-accent)]">
                    Official studio mastery
                  </p>
                  <h2 className="mt-1 break-words text-2xl font-black text-[var(--databloom-text-heading)] sm:text-3xl">
                    {pythonAssessment.finalExam.name}
                  </h2>
                  <p className="mt-2 max-w-3xl leading-7 text-[var(--databloom-text-secondary)]">
                    {masteryResult
                      ? `Mastered · ${masteryResult.officialMasteryScore}%`
                      : finalExamStatus?.unlocked
                        ? `Ready · Pass at ${pythonAssessment.finalExam.suggestedPassingScore}%`
                        : finalExamStatus
                          ? `Pass ${finalExamStatus.missingCheckpointIds.length} remaining checkpoints and complete ${finalExamStatus.missingTopicIds.length} remaining lessons.`
                          : "Checking curriculum and checkpoint progress…"}
                  </p>
                </div>

                {finalExamStatus?.unlocked ? (
                  <Link
                    href={`/final-exam/python-studio/${pythonCurriculum.finalSkillExam.assessmentId}`}
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
          <section aria-labelledby="python-lessons-heading">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-cyan-800">
                <Sparkles size={17} aria-hidden="true" /> Learn by doing
              </p>
              <h2
                id="python-lessons-heading"
                className="mt-1 text-3xl font-black text-slate-950"
              >
                Python lessons
              </h2>
            </div>

            <div className="mt-4">
              <StudioFilterToolbar
                query={search}
                onQueryChange={setSearch}
                category={category}
                onCategoryChange={setCategory}
                categories={pythonCategories}
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
                difficulties={pythonDifficulties}
                resultCount={filteredLessons.length}
                searchPlaceholder="Search Python lessons"
              />
            </div>

            {filteredLessons.length > 0 ? (
              <div className="mt-7 grid min-w-0 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                {filteredLessons.map((lesson) => (
                  <div key={lesson.id} className="min-w-0">
                    <PythonLessonCard
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
              <div className="mt-7 rounded-3xl border border-dashed border-cyan-300 bg-cyan-50 p-10 text-center">
                <p className="font-bold text-cyan-950">
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
                  className="mt-4 rounded-xl bg-cyan-700 px-5 py-3 font-bold text-white transition hover:bg-cyan-800"
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
    <article className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-md">
      <p className="font-semibold text-slate-700">{label}</p>
      <p className={`mt-2 text-3xl font-black ${tone}`}>{value}</p>
    </article>
  );
}
