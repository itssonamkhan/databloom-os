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
  type DatasetDomain,
  type DatasetLearningPath,
  type DatasetTool,
} from "@/lib/datasetLibrary";
import {
  calculateDatasetLibraryProgress,
  DATASET_LIBRARY_PROGRESS_EVENT,
  loadDatasetLibraryProgress,
  toggleDatasetLibraryFavorite,
  type DatasetLibraryProgressState,
} from "@/lib/datasetLibraryProgress";
import { playClickSound, playNotificationSound } from "@/lib/sounds";

const datasetToolOptions = Array.from(
  new Set(datasetLibrary.flatMap((dataset) => dataset.tools ?? [])),
);
const datasetDomainOptions = Array.from(
  new Set(datasetLibrary.flatMap((dataset) => dataset.domains ?? [])),
);
const datasetLearningPathOptions = Array.from(
  new Set(datasetLibrary.flatMap((dataset) => dataset.learningPaths ?? [])),
);

export default function DatasetLibraryStudio() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedTools, setSelectedTools] = useState<DatasetTool[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<DatasetDomain[]>([]);
  const [selectedLearningPaths, setSelectedLearningPaths] = useState<
    DatasetLearningPath[]
  >([]);
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
        (selectedTools.length === 0 ||
          selectedTools.some((tool) => dataset.tools?.includes(tool))) &&
        (selectedDomains.length === 0 ||
          selectedDomains.some((domain) => dataset.domains?.includes(domain))) &&
        (selectedLearningPaths.length === 0 ||
          selectedLearningPaths.some((path) =>
            dataset.learningPaths?.includes(path),
          )) &&
        (!favoritesOnly || progress.favoriteLessonIds.includes(dataset.id))
      );
    });
  }, [
    category,
    difficulty,
    favoritesOnly,
    progress.favoriteLessonIds,
    query,
    selectedDomains,
    selectedLearningPaths,
    selectedTools,
  ]);

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
    setSelectedTools([]);
    setSelectedDomains([]);
    setSelectedLearningPaths([]);
  }

  const hasActiveFilters =
    query.trim().length > 0 ||
    category !== "All" ||
    difficulty !== "All" ||
    favoritesOnly ||
    selectedTools.length > 0 ||
    selectedDomains.length > 0 ||
    selectedLearningPaths.length > 0;

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
            <div className="mt-3 rounded-[26px] border border-white/90 bg-gradient-to-br from-pink-100/80 via-violet-100/75 to-sky-100/80 p-4 text-slate-950 shadow-[0_16px_36px_-22px_rgba(88,28,135,0.45)] ring-1 ring-purple-200/60 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-purple-700">
                    Metadata tracks
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    Choose one or more values within a track.
                  </p>
                </div>
                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="min-h-11 rounded-2xl border border-white/95 bg-white/70 px-4 text-sm font-bold text-purple-900 shadow-sm transition hover:border-purple-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>
              <div className="mt-4 grid min-w-0 gap-4 md:grid-cols-3">
                <MetadataFilter
                  label="Tool"
                  options={datasetToolOptions}
                  selected={selectedTools}
                  onToggle={(value) =>
                    setSelectedTools((current) => toggleValue(current, value))
                  }
                />
                <MetadataFilter
                  label="Business domain"
                  options={datasetDomainOptions}
                  selected={selectedDomains}
                  onToggle={(value) =>
                    setSelectedDomains((current) => toggleValue(current, value))
                  }
                />
                <MetadataFilter
                  label="Learning path"
                  options={datasetLearningPathOptions}
                  selected={selectedLearningPaths}
                  onToggle={(value) =>
                    setSelectedLearningPaths((current) => toggleValue(current, value))
                  }
                />
              </div>
            </div>
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

function toggleValue<T>(values: readonly T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((current) => current !== value)
    : [...values, value];
}

function MetadataFilter<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: readonly T[];
  selected: readonly T[];
  onToggle: (value: T) => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-xs font-bold text-slate-800">{label}</legend>
      <div className="mt-2 flex min-w-0 flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(option)}
              className={`min-h-11 max-w-full rounded-full border px-3 py-2 text-left text-xs font-bold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 ${
                isSelected
                  ? "border-purple-300 bg-purple-100 text-purple-950"
                  : "border-white/95 bg-white/70 text-slate-800 hover:border-purple-200 hover:bg-white/90"
              }`}
            >
              <span className="break-words">{option}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
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
