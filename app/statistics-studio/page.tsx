"use client";

import { useEffect, useMemo, useState } from "react";
import { ChartNoAxesCombined, Download, Sparkles } from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import StatisticsLessonCard from "@/components/statistics/StatisticsLessonCard";
import StudioFilterToolbar from "@/components/studio/StudioFilterToolbar";
import {
  statisticsCategories,
  statisticsDifficulties,
  statisticsLessons,
} from "@/lib/statisticsLessons";
import {
  calculateStatisticsProgress,
  loadStatisticsProgress,
  STATISTICS_PROGRESS_EVENT,
  toggleStatisticsFavorite,
  type StatisticsProgressState,
} from "@/lib/statisticsProgress";
import { playClickSound, playNotificationSound } from "@/lib/sounds";

export default function StatisticsStudioPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [progress, setProgress] = useState<StatisticsProgressState>(() =>
    loadStatisticsProgress(),
  );

  useEffect(() => {
    const syncProgress = () => setProgress(loadStatisticsProgress());
    window.addEventListener(STATISTICS_PROGRESS_EVENT, syncProgress);
    window.addEventListener("storage", syncProgress);

    return () => {
      window.removeEventListener(STATISTICS_PROGRESS_EVENT, syncProgress);
      window.removeEventListener("storage", syncProgress);
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
      <div className="space-y-8 text-slate-950">
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
            <div className="mt-7 grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
              {filteredLessons.map((lesson) => (
                <StatisticsLessonCard
                  key={lesson.id}
                  lesson={lesson}
                  completed={progress.completedLessonIds.includes(lesson.id)}
                  favorite={progress.favoriteLessonIds.includes(lesson.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
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
