"use client";

import { useEffect, useMemo, useState } from "react";
import { Braces, Download, Sparkles } from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import PythonLessonCard from "@/components/python/PythonLessonCard";
import StudioFilterToolbar from "@/components/studio/StudioFilterToolbar";
import {
  pythonCategories,
  pythonDifficulties,
  pythonLessons,
} from "@/lib/pythonLessons";
import {
  calculatePythonProgress,
  loadPythonProgress,
  PYTHON_PROGRESS_EVENT,
  togglePythonFavorite,
  type PythonProgressState,
} from "@/lib/pythonProgress";
import { playClickSound, playNotificationSound } from "@/lib/sounds";

export default function PythonStudioPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [progress, setProgress] = useState<PythonProgressState>(() =>
    loadPythonProgress(),
  );

  useEffect(() => {
    const syncProgress = () => setProgress(loadPythonProgress());
    window.addEventListener(PYTHON_PROGRESS_EVENT, syncProgress);
    window.addEventListener("storage", syncProgress);
    return () => {
      window.removeEventListener(PYTHON_PROGRESS_EVENT, syncProgress);
      window.removeEventListener("storage", syncProgress);
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
      <div className="space-y-8 text-slate-950">
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

        <section aria-labelledby="python-lessons-heading">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-cyan-800">
              <Sparkles size={17} aria-hidden="true" /> Learn by doing
            </p>
            <h2 id="python-lessons-heading" className="mt-1 text-3xl font-black text-slate-950">
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
            <div className="mt-7 grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
              {filteredLessons.map((lesson) => (
                <PythonLessonCard
                  key={lesson.id}
                  lesson={lesson}
                  completed={progress.completedLessonIds.includes(lesson.id)}
                  favorite={progress.favoriteLessonIds.includes(lesson.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="mt-7 rounded-3xl border border-dashed border-cyan-300 bg-cyan-50 p-10 text-center">
              <p className="font-bold text-cyan-950">No lessons match those filters.</p>
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
