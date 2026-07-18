"use client";

import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Heart, Sparkles } from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import StudioCheckpointCards from "@/components/assessments/StudioCheckpointCards";
import BusinessAnalyticsDatasets from "@/components/business-analytics/BusinessAnalyticsDatasets";
import BusinessAnalyticsLessonCard from "@/components/business-analytics/BusinessAnalyticsLessonCard";
import BusinessAnalyticsRoadmap from "@/components/business-analytics/BusinessAnalyticsRoadmap";
import BusinessFrameworkReference from "@/components/business-analytics/BusinessFrameworkReference";
import StudioFilterToolbar from "@/components/studio/StudioFilterToolbar";
import {
  businessAnalyticsCategories,
  businessAnalyticsDifficulties,
  businessAnalyticsLessons,
} from "@/lib/businessAnalyticsLessons";
import {
  BUSINESS_ANALYTICS_PROGRESS_EVENT,
  calculateBusinessAnalyticsProgress,
  loadBusinessAnalyticsProgress,
  toggleBusinessAnalyticsFavorite,
  type BusinessAnalyticsProgressState,
} from "@/lib/businessAnalyticsProgress";
import { playClickSound, playNotificationSound } from "@/lib/sounds";

export default function BusinessAnalyticsStudio() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [progress, setProgress] = useState<BusinessAnalyticsProgressState>(() =>
    loadBusinessAnalyticsProgress(),
  );

  useEffect(() => {
    const syncProgress = () => setProgress(loadBusinessAnalyticsProgress());
    window.addEventListener(BUSINESS_ANALYTICS_PROGRESS_EVENT, syncProgress);
    window.addEventListener("storage", syncProgress);
    return () => {
      window.removeEventListener(BUSINESS_ANALYTICS_PROGRESS_EVENT, syncProgress);
      window.removeEventListener("storage", syncProgress);
    };
  }, []);

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
        (!favoritesOnly || progress.favoriteLessonIds.includes(lesson.id))
      );
    });
  }, [category, difficulty, favoritesOnly, progress.favoriteLessonIds, search]);

  const percentage = calculateBusinessAnalyticsProgress(
    progress.completedLessonIds.length,
    businessAnalyticsLessons.length,
  );

  function handleToggleFavorite(id: string) {
    const wasFavorite = progress.favoriteLessonIds.includes(id);
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
      <div className="space-y-9 text-slate-950">
        <header className="rounded-3xl border border-white/70 bg-gradient-to-br from-indigo-100 via-pink-100 to-amber-100 p-7 shadow-lg sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-bold text-indigo-900"><BriefcaseBusiness size={18} aria-hidden="true" /> Decision-ready analytics</p>
              <h1 className="mt-4 text-4xl font-black text-indigo-800 sm:text-5xl">📊 Business Analytics Studio</h1>
              <p className="mt-4 text-lg leading-8 text-slate-700">Learn to frame business problems, design useful metrics, analyze growth and operations, decide under uncertainty, and communicate actions.</p>
            </div>
            <div className="rounded-2xl bg-white/85 px-7 py-5 text-center shadow-sm">
              <p className="text-4xl font-black text-indigo-800">{businessAnalyticsLessons.length}</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">Complete lessons</p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Total lessons" value={String(businessAnalyticsLessons.length)} tone="text-indigo-800" />
          <SummaryCard label="Completed" value={`${progress.completedLessonIds.length}/${businessAnalyticsLessons.length}`} tone="text-emerald-700" />
          <SummaryCard label="Favorites" value={String(progress.favoriteLessonIds.length)} tone="text-pink-700" />
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

        <StudioCheckpointCards studioId="business-analytics-studio" />

        <BusinessAnalyticsRoadmap completedLessonIds={progress.completedLessonIds} />
        <BusinessAnalyticsDatasets />
        <BusinessFrameworkReference />

        <section aria-labelledby="business-analytics-lessons-heading">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-indigo-700"><Sparkles size={17} aria-hidden="true" /> Learn by deciding</p>
          <h2 id="business-analytics-lessons-heading" className="mt-1 text-3xl font-black">Business Analytics lesson library</h2>
          <div className="mt-4">
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
            <div className="mt-7 grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
              {filteredLessons.map((lesson) => (
                <BusinessAnalyticsLessonCard key={lesson.id} lesson={lesson} completed={progress.completedLessonIds.includes(lesson.id)} favorite={progress.favoriteLessonIds.includes(lesson.id)} onToggleFavorite={handleToggleFavorite} />
              ))}
            </div>
          ) : (
            <div className="mt-7 rounded-3xl border border-dashed border-indigo-300 bg-indigo-50 p-10 text-center">
              <p className="font-bold text-indigo-950">No lessons match those filters.</p>
              <button type="button" onClick={clearFilters} className="mt-4 rounded-xl bg-indigo-700 px-5 py-3 font-bold text-white transition hover:bg-indigo-800">Clear filters</button>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: string }) {
  return <article className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-md"><p className="font-semibold text-slate-700">{label}</p><p className={`mt-2 text-3xl font-black ${tone}`}>{value}</p></article>;
}
