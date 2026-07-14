"use client";

import { useEffect, useMemo, useState } from "react";
import { Database, Heart, Sparkles } from "lucide-react";

import DatasetCard from "@/components/dataset-library/DatasetCard";
import AppLayout from "@/components/layout/AppLayout";
import StudioFilterToolbar from "@/components/studio/StudioFilterToolbar";
import {
  datasetCategories,
  datasetDifficulties,
  datasetLibrary,
} from "@/lib/datasetLibrary";
import {
  calculateDatasetLibraryProgress,
  DATASET_LIBRARY_PROGRESS_EVENT,
  loadDatasetLibraryProgress,
  toggleDatasetLibraryFavorite,
  type DatasetLibraryProgressState,
} from "@/lib/datasetLibraryProgress";
import { playClickSound, playNotificationSound } from "@/lib/sounds";

export default function DatasetLibraryStudio() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [progress, setProgress] = useState<DatasetLibraryProgressState>(() =>
    loadDatasetLibraryProgress(),
  );

  useEffect(() => {
    const syncProgress = () => setProgress(loadDatasetLibraryProgress());
    window.addEventListener(DATASET_LIBRARY_PROGRESS_EVENT, syncProgress);
    window.addEventListener("storage", syncProgress);
    return () => {
      window.removeEventListener(DATASET_LIBRARY_PROGRESS_EVENT, syncProgress);
      window.removeEventListener("storage", syncProgress);
    };
  }, []);

  const filteredDatasets = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return datasetLibrary.filter((dataset) => {
      const matchesSearch =
        !normalizedQuery ||
        [
          dataset.name,
          dataset.description,
          dataset.category,
          dataset.difficulty,
          dataset.recommendedStudio.name,
          ...dataset.skillsPracticed,
        ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
      return (
        matchesSearch &&
        (category === "All" || dataset.category === category) &&
        (difficulty === "All" || dataset.difficulty === difficulty) &&
        (!favoritesOnly || progress.favoriteLessonIds.includes(dataset.id))
      );
    });
  }, [category, difficulty, favoritesOnly, progress.favoriteLessonIds, query]);

  const percentage = calculateDatasetLibraryProgress(
    progress.completedLessonIds.length,
    datasetLibrary.length,
  );

  function handleToggleFavorite(id: string) {
    playClickSound();
    const wasFavorite = progress.favoriteLessonIds.includes(id);
    const next = toggleDatasetLibraryFavorite(id);
    setProgress(next);
    if (!wasFavorite && next.favoriteLessonIds.includes(id)) {
      playNotificationSound();
    }
  }

  function clearFilters() {
    playClickSound();
    setQuery("");
    setCategory("All");
    setDifficulty("All");
    setFavoritesOnly(false);
  }

  return (
    <AppLayout>
      <div className="space-y-8 text-slate-950">
        <header className="rounded-3xl border border-white/70 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-7 shadow-lg sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-bold text-purple-900">
                <Database size={18} aria-hidden="true" /> Practice-ready data
              </p>
              <h1 className="mt-4 text-4xl font-black text-purple-800 sm:text-5xl">
                🗂️ Dataset Library
              </h1>
              <p className="mt-4 text-lg leading-8 text-slate-700">
                Explore realistic CSV datasets for spreadsheets, querying,
                dashboards, statistics, Python, and business decision practice.
              </p>
            </div>
            <div className="rounded-2xl bg-white/85 px-7 py-5 text-center shadow-sm">
              <p className="text-4xl font-black text-purple-800">
                {datasetLibrary.length}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                Downloadable datasets
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Datasets" value={String(datasetLibrary.length)} />
          <SummaryCard
            label="Categories"
            value={String(datasetCategories.length)}
          />
          <SummaryCard
            label="Completed"
            value={`${progress.completedLessonIds.length}/${datasetLibrary.length}`}
          />
          <SummaryCard label="Progress" value={`${percentage}%`} />
        </section>

        <section className="rounded-3xl border border-purple-100 bg-white/85 p-6 shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-purple-700">
                Your data practice
              </p>
              <h2 className="mt-1 text-2xl font-black">Dataset progress</h2>
            </div>
            <span className="font-black text-purple-800">{percentage}%</span>
          </div>
          <div
            className="mt-4 h-4 overflow-hidden rounded-full bg-purple-100"
            role="progressbar"
            aria-label="Dataset Library completion progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 transition-[width] duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </section>

        <section aria-labelledby="dataset-library-heading">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-purple-700">
            <Sparkles size={17} aria-hidden="true" /> Choose a business problem
          </p>
          <h2 id="dataset-library-heading" className="mt-1 text-3xl font-black">
            Dataset collection
          </h2>
          <div className="mt-4">
            <StudioFilterToolbar
              query={query}
              onQueryChange={setQuery}
              category={category}
              onCategoryChange={setCategory}
              categories={datasetCategories}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
              difficulties={datasetDifficulties}
              resultCount={filteredDatasets.length}
              searchPlaceholder="Search datasets or skills"
              heading="Find your next dataset"
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
                  <Heart
                    size={18}
                    fill={favoritesOnly ? "currentColor" : "none"}
                    aria-hidden="true"
                  />
                  Favorites
                </button>
              }
            />
          </div>

          {filteredDatasets.length > 0 ? (
            <div className="mt-7 grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
              {filteredDatasets.map((dataset) => (
                <DatasetCard
                  key={dataset.id}
                  dataset={dataset}
                  completed={progress.completedLessonIds.includes(dataset.id)}
                  favorite={progress.favoriteLessonIds.includes(dataset.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="mt-7 rounded-3xl border border-dashed border-purple-300 bg-purple-50 p-10 text-center">
              <p className="font-bold text-purple-950">
                No datasets match those filters.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-xl bg-purple-700 px-5 py-3 font-bold text-white transition hover:bg-purple-800"
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

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-3xl border border-purple-100 bg-white p-6 shadow-md">
      <p className="font-semibold text-slate-700">{label}</p>
      <p className="mt-2 text-3xl font-black text-purple-800">{value}</p>
    </article>
  );
}
