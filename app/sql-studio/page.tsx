"use client";

import { useEffect, useMemo, useState } from "react";
import { Database, Download, Sparkles } from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import StudioCheckpointCards from "@/components/assessments/StudioCheckpointCards";
import SQLLessonCard from "@/components/sql/SQLLessonCard";
import StudioFilterToolbar from "@/components/studio/StudioFilterToolbar";
import {
  sqlCategories,
  sqlDifficulties,
  sqlLessons,
} from "@/lib/sqlLessons";
import {
  calculateSQLProgress,
  loadSQLProgress,
  SQL_PROGRESS_EVENT,
  toggleSQLFavorite,
  type SQLProgressState,
} from "@/lib/sqlProgress";
import { playClickSound, playNotificationSound } from "@/lib/sounds";

export default function SQLStudioPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [progress, setProgress] = useState<SQLProgressState>(() =>
    loadSQLProgress(),
  );

  useEffect(() => {
    const syncProgress = () => setProgress(loadSQLProgress());
    window.addEventListener(SQL_PROGRESS_EVENT, syncProgress);
    window.addEventListener("storage", syncProgress);
    return () => {
      window.removeEventListener(SQL_PROGRESS_EVENT, syncProgress);
      window.removeEventListener("storage", syncProgress);
    };
  }, []);

  const filteredLessons = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sqlLessons.filter((lesson) => {
      const matchesSearch =
        !query ||
        [lesson.title, lesson.category, lesson.description, lesson.difficulty].some(
          (value) => value.toLowerCase().includes(query),
        );
      return (
        matchesSearch &&
        (category === "All" || lesson.category === category) &&
        (difficulty === "All" || lesson.difficulty === difficulty)
      );
    });
  }, [category, difficulty, search]);

  const percentage = calculateSQLProgress(
    progress.completedLessonIds.length,
    sqlLessons.length,
  );

  function toggleFavorite(id: string) {
    const next = toggleSQLFavorite(id);
    const added = next.favoriteLessonIds.includes(id);
    setProgress(next);
    if (added) playNotificationSound();
  }

  return (
    <AppLayout>
      <div className="space-y-8 text-gray-950">
        <header className="rounded-3xl border border-white/70 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-7 shadow-lg sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-purple-800">
                <Database size={17} aria-hidden="true" /> Analyst query skills
              </p>
              <h1 className="mt-4 text-4xl font-black text-purple-800 sm:text-5xl">
                🗄️ SQL Studio
              </h1>
              <p className="mt-4 text-lg leading-8 text-gray-700">
                Learn SQL one practical query at a time, from your first SELECT to
                analyst-ready window functions and optimization basics.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl bg-white/85 px-6 py-4 text-center shadow-sm">
                <p className="text-3xl font-black text-purple-800">{sqlLessons.length}</p>
                <p className="text-sm font-semibold text-gray-700">Total lessons</p>
              </div>
              <a
                href="/datasets/sql-sales-practice.csv"
                download
                onClick={playClickSound}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-5 py-4 font-bold text-white shadow-sm transition hover:bg-blue-800"
              >
                <Download size={19} aria-hidden="true" /> Download dataset
              </a>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="Learned" value={`${progress.completedLessonIds.length}/${sqlLessons.length}`} color="text-emerald-700" />
          <SummaryCard label="Favorites" value={String(progress.favoriteLessonIds.length)} color="text-pink-700" />
          <SummaryCard label="SQL progress" value={`${percentage}%`} color="text-purple-700" />
        </section>

        <section className="rounded-3xl border border-purple-100 bg-white/80 p-6 shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-purple-700">Your journey</p>
              <h2 className="mt-1 text-2xl font-bold text-gray-950">Lesson progress</h2>
            </div>
            <span className="font-black text-purple-800">{percentage}%</span>
          </div>
          <div className="mt-4 h-4 overflow-hidden rounded-full bg-purple-100" role="progressbar" aria-label="SQL lesson progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}>
            <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 transition-[width] duration-500" style={{ width: `${percentage}%` }} />
          </div>
        </section>

        <StudioCheckpointCards studioId="sql-studio" />

        <section aria-labelledby="sql-lessons-heading">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-purple-700">
              <Sparkles size={17} aria-hidden="true" /> Learn in small steps
            </p>
            <h2 id="sql-lessons-heading" className="mt-1 text-3xl font-black text-gray-950">SQL lessons</h2>
          </div>

          <div className="mt-4">
            <StudioFilterToolbar
              query={search}
              onQueryChange={setSearch}
              category={category}
              onCategoryChange={setCategory}
              categories={sqlCategories}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
              difficulties={sqlDifficulties}
              resultCount={filteredLessons.length}
              searchPlaceholder="Search SQL lessons"
            />
          </div>

          {filteredLessons.length ? (
            <div className="mt-7 grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
              {filteredLessons.map((lesson) => (
                <SQLLessonCard key={lesson.id} lesson={lesson} completed={progress.completedLessonIds.includes(lesson.id)} favorite={progress.favoriteLessonIds.includes(lesson.id)} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          ) : (
            <div className="mt-7 rounded-3xl border border-dashed border-purple-300 bg-purple-50 p-10 text-center">
              <p className="font-bold text-purple-900">No lessons match those filters.</p>
              <button type="button" onClick={() => { setSearch(""); setCategory("All"); setDifficulty("All"); }} className="mt-4 rounded-xl bg-purple-700 px-5 py-3 font-bold text-white">Clear filters</button>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-md">
      <p className="font-semibold text-gray-700">{label}</p>
      <p className={`mt-2 text-3xl font-black ${color}`}>{value}</p>
    </div>
  );
}
