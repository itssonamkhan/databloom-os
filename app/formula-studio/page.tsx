"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import StudioFilterToolbar from "@/components/studio/StudioFilterToolbar";
import ExcelProToolkit from "@/components/formula/ExcelProToolkit";
import AppLayout from "@/components/layout/AppLayout";
import {
  CHECKPOINT_PROGRESS_EVENT,
  getFinalSkillExamUnlockStatus,
  getStudioAssessmentConfiguration,
  isCheckpointUnlocked,
  loadCheckpointProgress,
  type CheckpointCompletion,
  type CheckpointProgressState,
} from "@/lib/checkpointExams";
import { getFavorites, toggleFavorite } from "@/lib/favorites";
import { formulas, type Formula } from "@/lib/formulas";
import { getLearnedFormulas } from "@/lib/learnedFormulas";
import {
  getStudioCurriculumConfiguration,
  validateStudioCurriculum,
} from "@/lib/studioCurriculum";
import type { StudioCheckpoint } from "@/lib/studioAssessments";

const categories = Array.from(
  new Set(formulas.map((formula) => formula.category)),
);
const difficulties = Array.from(
  new Set(formulas.map((formula) => formula.difficulty)),
);
const formulasById = new Map(
  formulas.map((formula) => [formula.id, formula]),
);
function getFormulaStudioConfigurations() {
  const curriculum = getStudioCurriculumConfiguration("formula-studio");
  const assessment = getStudioAssessmentConfiguration("formula-studio");

  if (!curriculum || !assessment) {
    throw new Error(
      "Formula Studio curriculum or assessment configuration is missing.",
    );
  }

  const validation = validateStudioCurriculum(curriculum);
  if (!validation.isValid) {
    throw new Error("Formula Studio curriculum configuration is invalid.");
  }

  return { curriculum, assessment };
}

const {
  curriculum: formulaCurriculum,
  assessment: formulaAssessment,
} = getFormulaStudioConfigurations();

function FormulaCard({
  formula,
  favorites,
  learnedFormulas,
  onToggleFavorite,
}: {
  formula: Formula;
  favorites: readonly string[];
  learnedFormulas: readonly string[];
  onToggleFavorite: (formulaId: string) => void;
}) {
  return (
    <article className="min-w-0 max-w-full rounded-3xl bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
        <h3 className="min-w-0 break-words text-2xl font-bold text-purple-700">
          {formula.name}
        </h3>
        {learnedFormulas.includes(formula.id) && (
          <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
            ✅ Learned
          </span>
        )}
        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
          {formula.difficulty}
        </span>
      </div>

      <p className="mt-3 inline-block max-w-full break-words rounded-full bg-pink-100 px-3 py-1 text-sm font-semibold text-pink-700">
        {formula.category}
      </p>

      <div className="mt-5 min-w-0 max-w-full overflow-hidden rounded-2xl bg-purple-50 p-4">
        <p className="font-semibold text-purple-700">Syntax</p>
        <p className="mt-2 break-words font-mono text-gray-900">
          {formula.syntax}
        </p>
      </div>

      <div className="mt-5">
        <p className="font-semibold text-gray-900">Purpose</p>
        <p className="mt-2 text-gray-800">{formula.purpose}</p>
      </div>

      <div className="mt-5">
        <p className="font-semibold text-gray-900">Example</p>
        <p className="mt-2 text-gray-800">{formula.example}</p>
      </div>

      <div className="mt-5 rounded-2xl bg-pink-100 p-4">
        <p className="font-semibold text-pink-700">🧠 Memory Trick</p>
        <p className="mt-2 text-gray-900">{formula.memory}</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link
          href={`/formula-studio/${formula.id}`}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-purple-600 px-3 py-2 text-center font-semibold text-white hover:bg-purple-700"
        >
          📖 Learn
        </Link>
        <Link
          href={`/formula-studio/${formula.id}/practice`}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-pink-500 px-3 py-2 text-center font-semibold text-white hover:bg-pink-600"
        >
          📝 Practice
        </Link>
        <button
          type="button"
          onClick={() => onToggleFavorite(formula.id)}
          className="min-h-11 rounded-xl bg-blue-500 px-3 py-2 font-semibold text-white hover:bg-blue-600"
        >
          {favorites.includes(formula.id) ? "💙 Saved" : "⭐ Favorite"}
        </button>
      </div>
    </article>
  );
}

function FormulaCheckpointMilestone({
  checkpoint,
  learnedFormulas,
  completion,
}: {
  checkpoint: StudioCheckpoint;
  learnedFormulas: readonly string[];
  completion?: CheckpointCompletion;
}) {
  const unlocked = isCheckpointUnlocked(checkpoint, learnedFormulas);
  const completed = new Set(learnedFormulas);
  const remaining = checkpoint.unlockRequirement.requiredTopicIds.filter(
    (formulaId) => !completed.has(formulaId),
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
                : `Complete ${remaining} more ${remaining === 1 ? "formula" : "formulas"} to unlock.`}
          </p>
        </div>

        {unlocked ? (
          <Link
            href={`/checkpoint/formula-studio/${checkpoint.id}`}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--databloom-action)] px-5 py-3 font-black text-[var(--databloom-text-on-accent)] transition hover:bg-[var(--databloom-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--databloom-focus)]"
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

export default function FormulaStudio() {
  const [view, setView] = useState<"formulas" | "toolkit">("formulas");
  const [formulaView, setFormulaView] = useState<"guided" | "library">(
    "guided",
  );
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [learnedFormulas, setLearnedFormulas] = useState<string[]>([]);
  const [checkpointProgress, setCheckpointProgress] =
    useState<CheckpointProgressState | null>(null);

  useEffect(() => {
    setFavorites(getFavorites());
    setLearnedFormulas(getLearnedFormulas());
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

  const filteredFormulas = useMemo(() => {
    return formulas.filter((formula) => {
      const matchesSearch =
        formula.name.toLowerCase().includes(search.toLowerCase()) ||
        formula.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || formula.category === selectedCategory;
      const matchesDifficulty =
        selectedDifficulty === "All" ||
        formula.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [search, selectedCategory, selectedDifficulty]);

  const finalExamStatus = checkpointProgress
    ? getFinalSkillExamUnlockStatus(
        formulaAssessment,
        learnedFormulas,
        checkpointProgress,
      )
    : null;
  const masteryResult =
    checkpointProgress?.masteryResults["formula-studio"];

  const handleToggleFavorite = (formulaId: string) => {
    const updated = toggleFavorite(formulaId);
    setFavorites(updated);
  };

  return (
    <AppLayout>
      <div className="min-w-0 space-y-8">
        <div className="rounded-3xl bg-gradient-to-br from-purple-100 to-pink-100 p-8 shadow-lg">
          <h1 className="text-5xl font-bold text-purple-700">
            📚 Excel Formula Library
          </h1>
          <p className="mt-3 text-xl text-gray-800">
            Learn Excel formulas in a simple and memorable way 🌸
          </p>
          <p className="mt-3 font-semibold text-gray-800">
            Total formulas : {formulas.length}
          </p>
        </div>

        <nav
          aria-label="Formula Studio sections"
          className="flex flex-wrap gap-2 rounded-3xl border border-[var(--databloom-border)] bg-[var(--databloom-card)] p-3 shadow-md"
        >
          <button
            type="button"
            aria-pressed={view === "formulas"}
            onClick={() => setView("formulas")}
            className={`min-h-11 rounded-2xl border px-5 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--databloom-focus)] ${
              view === "formulas"
                ? "border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] text-[var(--databloom-text-heading)] shadow-sm"
                : "border-transparent bg-transparent text-[var(--databloom-text-secondary)]"
            }`}
          >
            📚 Formula Library
          </button>
          <button
            type="button"
            aria-pressed={view === "toolkit"}
            onClick={() => setView("toolkit")}
            className={`min-h-11 rounded-2xl border px-5 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--databloom-focus)] ${
              view === "toolkit"
                ? "border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] text-[var(--databloom-text-heading)] shadow-sm"
                : "border-transparent bg-transparent text-[var(--databloom-text-secondary)]"
            }`}
          >
            🧰 Excel Pro Toolkit
          </button>
        </nav>

        {view === "formulas" ? (
          <>
            <nav
              aria-label="Formula learning mode"
              className="flex flex-wrap gap-2 rounded-3xl border border-[var(--databloom-border)] bg-[var(--databloom-card)] p-3 shadow-md"
            >
              <button
                type="button"
                aria-pressed={formulaView === "guided"}
                onClick={() => setFormulaView("guided")}
                className={`min-h-11 rounded-2xl border px-5 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--databloom-focus)] ${
                  formulaView === "guided"
                    ? "border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] text-[var(--databloom-text-heading)] shadow-sm"
                    : "border-transparent bg-transparent text-[var(--databloom-text-secondary)]"
                }`}
              >
                🧭 Guided Curriculum
              </button>
              <button
                type="button"
                aria-pressed={formulaView === "library"}
                onClick={() => setFormulaView("library")}
                className={`min-h-11 rounded-2xl border px-5 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--databloom-focus)] ${
                  formulaView === "library"
                    ? "border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] text-[var(--databloom-text-heading)] shadow-sm"
                    : "border-transparent bg-transparent text-[var(--databloom-text-secondary)]"
                }`}
              >
                🔎 Reference Library
              </button>
            </nav>

            {formulaView === "guided" ? (
              <div className="min-w-0 space-y-8">
                <section className="rounded-3xl border border-[var(--databloom-border)] bg-[var(--databloom-card)] p-5 shadow-md sm:p-6">
                  <p className="text-sm font-black uppercase tracking-wider text-[var(--databloom-text-accent)]">
                    Guided Curriculum
                  </p>
                  <h2 className="mt-1 text-3xl font-black text-[var(--databloom-text-heading)]">
                    Six modules · {formulaCurriculum.officialCoreLessonIds.length} formulas
                  </h2>
                  <p className="mt-2 max-w-3xl leading-7 text-[var(--databloom-text-secondary)]">
                    Follow the modules in order for a structured path, or switch
                    to the Reference Library whenever you need search and
                    category filters. Excel Pro Toolkit remains a separate,
                    optional reference track.
                  </p>
                </section>

                {formulaCurriculum.modules.map((module) => {
                  const moduleFormulas = module.lessonIds
                    .map((formulaId) => formulasById.get(formulaId))
                    .filter((formula): formula is Formula => Boolean(formula));
                  const moduleCategories = Array.from(
                    new Set(moduleFormulas.map((formula) => formula.category)),
                  );
                  const checkpointPlacement =
                    formulaCurriculum.checkpointPlacements.find(
                      (placement) =>
                        placement.placementStatus === "placed" &&
                        placement.afterModuleId === module.id,
                    );
                  const checkpoint = checkpointPlacement
                    ? formulaAssessment.checkpoints.find(
                        (item) =>
                          item.id === checkpointPlacement.checkpointId,
                      )
                    : undefined;
                  const checkpointCompletion = checkpoint
                    ? checkpointProgress?.completions[
                        `formula-studio:${checkpoint.id}`
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
                            {module.lessonIds.length} formulas
                          </span>
                        </div>

                        <div className="mt-4 flex min-w-0 flex-wrap gap-2">
                          {moduleCategories.map((category) => (
                            <span
                              key={category}
                              className="max-w-full break-words rounded-full border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-3 py-1 text-xs font-bold text-[var(--databloom-text-secondary)]"
                            >
                              {category}
                            </span>
                          ))}
                        </div>

                        <div className="mt-6 grid min-w-0 gap-6 md:grid-cols-2 xl:grid-cols-3">
                          {moduleFormulas.map((formula) => (
                            <FormulaCard
                              key={formula.id}
                              formula={formula}
                              favorites={favorites}
                              learnedFormulas={learnedFormulas}
                              onToggleFavorite={handleToggleFavorite}
                            />
                          ))}
                        </div>
                      </section>

                      {checkpoint && (
                        <FormulaCheckpointMilestone
                          checkpoint={checkpoint}
                          learnedFormulas={learnedFormulas}
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
                    Review the complete Formula Studio curriculum
                  </h2>
                  <p className="mt-2 max-w-3xl leading-7 text-[var(--databloom-text-secondary)]">
                    Revisit all {formulaCurriculum.officialCoreLessonIds.length}
                    {" "}core formulas, use the existing formula-level practice,
                    and pass all three checkpoints before the existing Final
                    Skill Exam.
                  </p>
                </section>

                <section className="rounded-3xl border border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] p-5 shadow-md sm:p-6">
                  <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-black uppercase tracking-wider text-[var(--databloom-text-accent)]">
                        Official studio mastery
                      </p>
                      <h2 className="mt-1 break-words text-2xl font-black text-[var(--databloom-text-heading)] sm:text-3xl">
                        {formulaAssessment.finalExam.name}
                      </h2>
                      <p className="mt-2 max-w-3xl leading-7 text-[var(--databloom-text-secondary)]">
                        {masteryResult
                          ? `Mastered · ${masteryResult.officialMasteryScore}%`
                          : finalExamStatus?.unlocked
                            ? `Ready · Pass at ${formulaAssessment.finalExam.suggestedPassingScore}%`
                            : finalExamStatus
                              ? `Pass ${finalExamStatus.missingCheckpointIds.length} remaining checkpoints and complete ${finalExamStatus.missingTopicIds.length} remaining formulas.`
                              : "Checking curriculum and checkpoint progress…"}
                      </p>
                    </div>

                    {finalExamStatus?.unlocked ? (
                      <Link
                        href={`/final-exam/formula-studio/${formulaCurriculum.finalSkillExam.assessmentId}`}
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
              <div className="min-w-0 space-y-8">
                <StudioFilterToolbar
                  query={search}
                  onQueryChange={setSearch}
                  category={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  categories={categories}
                  difficulty={selectedDifficulty}
                  onDifficultyChange={setSelectedDifficulty}
                  difficulties={difficulties}
                  resultCount={filteredFormulas.length}
                  searchPlaceholder="Search formulas or categories"
                />

                <div className="grid min-w-0 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredFormulas.map((formula) => (
                    <FormulaCard
                      key={formula.id}
                      formula={formula}
                      favorites={favorites}
                      learnedFormulas={learnedFormulas}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <ExcelProToolkit />
        )}
      </div>
    </AppLayout>
  );
}
