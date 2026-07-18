"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart, Sparkles, WandSparkles } from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import StudioCheckpointCards from "@/components/assessments/StudioCheckpointCards";
import PowerQueryDatasets from "@/components/power-query/PowerQueryDatasets";
import PowerQueryKeyboardShortcuts from "@/components/power-query/PowerQueryKeyboardShortcuts";
import PowerQueryLessonCard from "@/components/power-query/PowerQueryLessonCard";
import PowerQueryRoadmap from "@/components/power-query/PowerQueryRoadmap";
import StudioFilterToolbar from "@/components/studio/StudioFilterToolbar";
import {
  powerQueryCategories,
  powerQueryDifficulties,
  powerQueryLessons,
} from "@/lib/powerQueryLessons";
import {
  calculatePowerQueryProgress,
  loadPowerQueryProgress,
  POWER_QUERY_PROGRESS_EVENT,
  togglePowerQueryFavorite,
  type PowerQueryProgressState,
} from "@/lib/powerQueryProgress";
import { playClickSound, playNotificationSound } from "@/lib/sounds";

export default function PowerQueryStudio() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [progress, setProgress] = useState<PowerQueryProgressState>(() =>
    loadPowerQueryProgress(),
  );

  useEffect(() => {
    const syncProgress = () => setProgress(loadPowerQueryProgress());
    window.addEventListener(POWER_QUERY_PROGRESS_EVENT, syncProgress);
    window.addEventListener("storage", syncProgress);
    return () => {
      window.removeEventListener(POWER_QUERY_PROGRESS_EVENT, syncProgress);
      window.removeEventListener("storage", syncProgress);
    };
  }, []);

  const filteredLessons = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return powerQueryLessons.filter((lesson) => {
      const matchesSearch =
        !query ||
        [
          lesson.title,
          lesson.category,
          lesson.description,
          lesson.difficulty,
          lesson.explanation,
        ].some((value) => value.toLocaleLowerCase().includes(query));

      return (
        matchesSearch &&
        (category === "All" || lesson.category === category) &&
        (difficulty === "All" || lesson.difficulty === difficulty) &&
        (!favoritesOnly || progress.favoriteLessonIds.includes(lesson.id))
      );
    });
  }, [category, difficulty, favoritesOnly, progress.favoriteLessonIds, search]);

  const percentage = calculatePowerQueryProgress(
    progress.completedLessonIds.length,
    powerQueryLessons.length,
  );

  function handleToggleFavorite(id: string) {
    const wasFavorite = progress.favoriteLessonIds.includes(id);
    const next = togglePowerQueryFavorite(id);
    setProgress(next);
    if (!wasFavorite && next.favoriteLessonIds.includes(id)) {
      playNotificationSound();
    }
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
      <div className="space-y-9 text-slate-950">
        <header className="rounded-3xl border border-white/70 bg-gradient-to-br from-teal-100 via-blue-100 to-purple-100 p-7 shadow-lg sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-bold text-teal-900">
                <WandSparkles size={18} aria-hidden="true" /> Repeatable data preparation
              </p>
              <h1 className="mt-4 text-4xl font-black text-teal-800 sm:text-5xl">
                🧹 Power Query Studio
              </h1>
              <p className="mt-4 text-lg leading-8 text-slate-700">
                Learn Power Query from first connection and data cleaning through M functions,
                query folding, production refresh, real business cases, and interviews.
              </p>
            </div>
            <div className="rounded-2xl bg-white/85 px-7 py-5 text-center shadow-sm">
              <p className="text-4xl font-black text-teal-800">{powerQueryLessons.length}</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">Complete lessons</p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Total lessons" value={String(powerQueryLessons.length)} tone="text-teal-800" />
          <SummaryCard label="Completed" value={`${progress.completedLessonIds.length}/${powerQueryLessons.length}`} tone="text-emerald-700" />
          <SummaryCard label="Favorites" value={String(progress.favoriteLessonIds.length)} tone="text-pink-700" />
          <SummaryCard label="Power Query progress" value={`${percentage}%`} tone="text-purple-700" />
        </section>

        <section className="rounded-3xl border border-teal-100 bg-white/85 p-6 shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-teal-700">Your journey</p>
              <h2 className="mt-1 text-2xl font-black">Lesson progress</h2>
            </div>
            <span className="font-black text-teal-800">{percentage}%</span>
          </div>
          <div
            className="mt-4 h-4 overflow-hidden rounded-full bg-teal-100"
            role="progressbar"
            aria-label="Power Query lesson progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-600 via-blue-500 to-purple-500 transition-[width] duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </section>

        <StudioCheckpointCards studioId="power-query-studio" />

        <PowerQueryRoadmap completedLessonIds={progress.completedLessonIds} />
        <PowerQueryDatasets />

        <section aria-labelledby="power-query-lessons-heading">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-teal-700">
            <Sparkles size={17} aria-hidden="true" /> Learn by doing
          </p>
          <h2 id="power-query-lessons-heading" className="mt-1 text-3xl font-black">
            Power Query lesson library
          </h2>

          <div className="mt-4">
            <StudioFilterToolbar
              query={search}
              onQueryChange={setSearch}
              category={category}
              onCategoryChange={setCategory}
              categories={powerQueryCategories}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
              difficulties={powerQueryDifficulties}
              resultCount={filteredLessons.length}
              searchPlaceholder="Search Power Query lessons"
              actions={
                <button
                  type="button"
                  aria-pressed={favoritesOnly}
                  onClick={() => {
                    playClickSound();
                    setFavoritesOnly((current) => !current);
                  }}
                  className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-bold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 ${
                    favoritesOnly
                      ? "border-pink-300 bg-pink-100 text-pink-900"
                      : "border-white/95 bg-white/65 text-slate-800 hover:border-purple-200 hover:bg-white/90"
                  }`}
                >
                  <Heart size={18} fill={favoritesOnly ? "currentColor" : "none"} aria-hidden="true" />
                  Favorites
                </button>
              }
            />
          </div>

          {filteredLessons.length > 0 ? (
            <div className="mt-7 grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
              {filteredLessons.map((lesson) => (
                <PowerQueryLessonCard
                  key={lesson.id}
                  lesson={lesson}
                  completed={progress.completedLessonIds.includes(lesson.id)}
                  favorite={progress.favoriteLessonIds.includes(lesson.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="mt-7 rounded-3xl border border-dashed border-teal-300 bg-teal-50 p-10 text-center">
              <p className="font-bold text-teal-950">No lessons match those filters.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-xl bg-teal-700 px-5 py-3 font-bold text-white transition hover:bg-teal-800"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        <PowerQueryKeyboardShortcuts />
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
    <article className="rounded-3xl border border-teal-100 bg-white p-6 shadow-md">
      <p className="font-semibold text-slate-700">{label}</p>
      <p className={`mt-2 text-3xl font-black ${tone}`}>{value}</p>
    </article>
  );
}
