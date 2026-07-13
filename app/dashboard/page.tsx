"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Sparkles } from "lucide-react";

import DashboardCard from "@/components/dashboard/DashboardCard";
import AppLayout from "@/components/layout/AppLayout";
import StudioFilterToolbar from "@/components/studio/StudioFilterToolbar";
import { dashboardProjects } from "@/lib/dashboardProjects";
import {
  DASHBOARD_STORAGE_EVENT,
  getCompletedDashboards,
  getFavoriteDashboards,
  toggleFavoriteDashboard,
} from "@/lib/dashboardProgress";
import { formulas } from "@/lib/formulas";
import { getLearnedFormulas } from "@/lib/learnedFormulas";
import { playClickSound } from "@/lib/sounds";
import { sqlLessons } from "@/lib/sqlLessons";
import {
  calculateSQLProgress,
  loadSQLProgress,
  SQL_PROGRESS_EVENT,
} from "@/lib/sqlProgress";
import { powerBILessons } from "@/lib/powerBILessons";
import { daxLessons } from "@/lib/daxFormulas";
import { calculatePowerBIProgress, loadPowerBIProgress, POWER_BI_PROGRESS_EVENT } from "@/lib/powerBIProgress";
import { powerQueryLessons } from "@/lib/powerQueryLessons";
import {
  calculatePowerQueryProgress,
  loadPowerQueryProgress,
  POWER_QUERY_PROGRESS_EVENT,
} from "@/lib/powerQueryProgress";
import { pythonLessons } from "@/lib/pythonLessons";
import { loadPythonProgress, PYTHON_PROGRESS_EVENT } from "@/lib/pythonProgress";
import { statisticsLessons } from "@/lib/statisticsLessons";
import {
  calculateStatisticsProgress,
  loadStatisticsProgress,
  STATISTICS_PROGRESS_EVENT,
} from "@/lib/statisticsProgress";
import { businessAnalyticsLessons } from "@/lib/businessAnalyticsLessons";
import {
  BUSINESS_ANALYTICS_PROGRESS_EVENT,
  calculateBusinessAnalyticsProgress,
  loadBusinessAnalyticsProgress,
} from "@/lib/businessAnalyticsProgress";

const categories = Array.from(
  new Set(dashboardProjects.map((project) => project.category)),
);
const difficulties = Array.from(
  new Set(dashboardProjects.map((project) => project.difficulty)),
);

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [completedIds, setCompletedIds] = useState<string[]>(() =>
    getCompletedDashboards(),
  );
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() =>
    getFavoriteDashboards(),
  );
  const [excelLearnedCount] = useState(() => {
    const learnedIds = new Set(getLearnedFormulas());
    return formulas.filter((formula) => learnedIds.has(formula.id)).length;
  });
  const [sqlCompletedCount, setSQLCompletedCount] = useState(() => {
    const completed = new Set(loadSQLProgress().completedLessonIds);
    return sqlLessons.filter((lesson) => completed.has(lesson.id)).length;
  });
  const [powerBICompletedCount, setPowerBICompletedCount] = useState(() => {
    const state = loadPowerBIProgress();
    return state.completedLessonIds.length + state.completedDAXIds.length;
  });
  const [powerQueryCompletedCount, setPowerQueryCompletedCount] = useState(
    () => loadPowerQueryProgress().completedLessonIds.length,
  );
  const [pythonCompletedCount, setPythonCompletedCount] = useState(() => {
    const completed = new Set(loadPythonProgress().completedLessonIds);
    return pythonLessons.filter((lesson) => completed.has(lesson.id)).length;
  });
  const [statisticsCompletedCount, setStatisticsCompletedCount] = useState(() => {
    const completed = new Set(loadStatisticsProgress().completedLessonIds);
    return statisticsLessons.filter((lesson) => completed.has(lesson.id)).length;
  });
  const [businessAnalyticsCompletedCount, setBusinessAnalyticsCompletedCount] =
    useState(() => loadBusinessAnalyticsProgress().completedLessonIds.length);
  const excelProgress =
    formulas.length === 0
      ? 0
      : Math.min(100, Math.round((excelLearnedCount / formulas.length) * 100));
  const sqlProgress = calculateSQLProgress(sqlCompletedCount, sqlLessons.length);
  const powerBITotal = powerBILessons.length + daxLessons.length;
  const powerBIProgress = calculatePowerBIProgress(powerBICompletedCount, powerBITotal);
  const powerQueryProgress = calculatePowerQueryProgress(
    powerQueryCompletedCount,
    powerQueryLessons.length,
  );
  const pythonProgress =
    pythonLessons.length === 0
      ? 0
      : Math.min(
          100,
          Math.round((pythonCompletedCount / pythonLessons.length) * 100),
        );
  const statisticsProgress = calculateStatisticsProgress(
    statisticsCompletedCount,
    statisticsLessons.length,
  );
  const businessAnalyticsProgress = calculateBusinessAnalyticsProgress(
    businessAnalyticsCompletedCount,
    businessAnalyticsLessons.length,
  );

  useEffect(() => {
    const syncBusinessAnalytics = () => {
      setBusinessAnalyticsCompletedCount(
        loadBusinessAnalyticsProgress().completedLessonIds.length,
      );
    };
    window.addEventListener(
      BUSINESS_ANALYTICS_PROGRESS_EVENT,
      syncBusinessAnalytics,
    );
    return () =>
      window.removeEventListener(
        BUSINESS_ANALYTICS_PROGRESS_EVENT,
        syncBusinessAnalytics,
      );
  }, []);

  useEffect(() => {
    const syncDashboardState = () => {
      setCompletedIds(getCompletedDashboards());
      setFavoriteIds(getFavoriteDashboards());
    };

    window.addEventListener(DASHBOARD_STORAGE_EVENT, syncDashboardState);
    return () => {
      window.removeEventListener(DASHBOARD_STORAGE_EVENT, syncDashboardState);
    };
  }, []);

  useEffect(() => {
    const syncStatisticsProgress = () => {
      const completed = new Set(loadStatisticsProgress().completedLessonIds);
      setStatisticsCompletedCount(
        statisticsLessons.filter((lesson) => completed.has(lesson.id)).length,
      );
    };
    window.addEventListener(STATISTICS_PROGRESS_EVENT, syncStatisticsProgress);
    return () =>
      window.removeEventListener(
        STATISTICS_PROGRESS_EVENT,
        syncStatisticsProgress,
      );
  }, []);

  useEffect(() => {
    const syncPowerBI = () => {
      const state = loadPowerBIProgress();
      setPowerBICompletedCount(state.completedLessonIds.length + state.completedDAXIds.length);
    };
    window.addEventListener(POWER_BI_PROGRESS_EVENT, syncPowerBI);
    return () => window.removeEventListener(POWER_BI_PROGRESS_EVENT, syncPowerBI);
  }, []);

  useEffect(() => {
    const syncPowerQuery = () => {
      setPowerQueryCompletedCount(
        loadPowerQueryProgress().completedLessonIds.length,
      );
    };
    window.addEventListener(POWER_QUERY_PROGRESS_EVENT, syncPowerQuery);
    return () =>
      window.removeEventListener(POWER_QUERY_PROGRESS_EVENT, syncPowerQuery);
  }, []);

  useEffect(() => {
    const syncSQLProgress = () => {
      const completed = new Set(loadSQLProgress().completedLessonIds);
      setSQLCompletedCount(
        sqlLessons.filter((lesson) => completed.has(lesson.id)).length,
      );
    };
    window.addEventListener(SQL_PROGRESS_EVENT, syncSQLProgress);
    return () => window.removeEventListener(SQL_PROGRESS_EVENT, syncSQLProgress);
  }, []);

  useEffect(() => {
    const syncPythonProgress = () => {
      const completed = new Set(loadPythonProgress().completedLessonIds);
      setPythonCompletedCount(
        pythonLessons.filter((lesson) => completed.has(lesson.id)).length,
      );
    };
    window.addEventListener(PYTHON_PROGRESS_EVENT, syncPythonProgress);
    return () =>
      window.removeEventListener(PYTHON_PROGRESS_EVENT, syncPythonProgress);
  }, []);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return dashboardProjects.filter((project) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [project.title, project.category, ...project.tools].some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        );
      const matchesCategory = category === "All" || project.category === category;
      const matchesDifficulty =
        difficulty === "All" || project.difficulty === difficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [category, difficulty, search]);

  function handleToggleFavorite(id: string) {
    setFavoriteIds(toggleFavoriteDashboard(id));
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <header className="rounded-3xl border border-white/70 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-7 shadow-lg sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-purple-800">
                <Sparkles size={17} aria-hidden="true" />
                Build practical analyst projects
              </div>
              <h1 className="mt-4 text-4xl font-bold text-purple-800 sm:text-5xl">
                📊 Dashboard Studio
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-gray-700">
                Turn small business datasets into useful dashboards while growing your
                Excel and Power BI skills.
              </p>
            </div>

            <div className="rounded-2xl bg-white/80 px-6 py-4 text-center shadow-sm">
              <p className="text-3xl font-bold text-purple-800">
                {dashboardProjects.length}
              </p>
              <p className="text-sm font-semibold text-gray-700">Projects available</p>
            </div>
          </div>
        </header>

        <section aria-labelledby="skills-heading">
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="text-purple-700" size={22} aria-hidden="true" />
            <h2 id="skills-heading" className="text-2xl font-bold text-gray-900">
              Skill progress
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
            <SkillProgress title="📗 Excel" progress={excelProgress} />
            <SkillProgress title="🗄 SQL" progress={sqlProgress} />
            <SkillProgress title="📈 Power BI" progress={powerBIProgress} />
            <SkillProgress title="🧹 Power Query" progress={powerQueryProgress} />
            <SkillProgress title="🐍 Python" progress={pythonProgress} />
            <SkillProgress title="📐 Statistics" progress={statisticsProgress} />
            <SkillProgress
              title="💼 Business Analytics"
              progress={businessAnalyticsProgress}
            />
          </div>
          <p className="mt-3 text-sm text-gray-700">
            Excel progress is based on {excelLearnedCount} of the {formulas.length}
            {" "}Formula Studio lessons. SQL progress is based on {sqlCompletedCount} of the {sqlLessons.length} SQL Studio lessons. Power BI progress is based on {powerBICompletedCount} of {powerBITotal} Power BI and DAX lessons. Power Query progress is based on {powerQueryCompletedCount} of {powerQueryLessons.length} Power Query lessons. Python progress is based on {pythonCompletedCount} of {pythonLessons.length} Python Studio lessons. Statistics progress is based on {statisticsCompletedCount} of {statisticsLessons.length} Statistics Studio lessons. Business Analytics progress is based on {businessAnalyticsCompletedCount} of {businessAnalyticsLessons.length} Business Analytics lessons.
          </p>
        </section>

        <section
          aria-labelledby="projects-heading"
          className="rounded-3xl border border-purple-100 bg-white/70 p-5 shadow-sm sm:p-7"
        >
          <div>
            <h2 id="projects-heading" className="text-3xl font-bold text-gray-900">
              Dashboard projects
            </h2>
          </div>

          <div className="mt-4">
            <StudioFilterToolbar
              query={search}
              onQueryChange={setSearch}
              category={category}
              onCategoryChange={setCategory}
              categories={categories}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
              difficulties={difficulties}
              resultCount={filteredProjects.length}
              searchPlaceholder="Search projects or tools"
            />
          </div>

          {filteredProjects.length > 0 ? (
            <div className="mt-7 grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
              {filteredProjects.map((project) => (
                <DashboardCard
                  key={project.id}
                  project={project}
                  completed={completedIds.includes(project.id)}
                  favorite={favoriteIds.includes(project.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="mt-7 rounded-2xl border border-dashed border-purple-300 bg-purple-50 p-10 text-center">
              <p className="text-lg font-bold text-purple-900">No projects match those filters.</p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                  setDifficulty("All");
                }}
                className="mt-4 rounded-xl bg-purple-700 px-5 py-3 font-bold text-white transition hover:bg-purple-800"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg sm:p-8">
          <h2 className="text-2xl font-bold text-purple-800">🚀 Quick actions</h2>
          <div className="mt-5 flex flex-wrap gap-4">
            <Link
              href="/formula-studio"
              onClick={playClickSound}
              className="rounded-xl bg-purple-700 px-5 py-3 font-bold text-white transition hover:bg-purple-800"
            >
              📚 Learn formulas
            </Link>
            <Link
              href="/planner"
              onClick={playClickSound}
              className="rounded-xl bg-pink-600 px-5 py-3 font-bold text-white transition hover:bg-pink-700"
            >
              🗓 Open planner
            </Link>
            <Link
              href="/sql-studio"
              onClick={playClickSound}
              className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800"
            >
              🗄 SQL Studio
            </Link>
            <Link
              href="/analytics"
              onClick={playClickSound}
              className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800"
            >
              📈 Analytics Studio
            </Link>
            <Link href="/power-bi-studio" onClick={playClickSound} className="rounded-xl bg-amber-700 px-5 py-3 font-bold text-white transition hover:bg-amber-800">📊 Power BI Studio</Link>
            <Link href="/power-query-studio" onClick={playClickSound} className="rounded-xl bg-teal-700 px-5 py-3 font-bold text-white transition hover:bg-teal-800">🧹 Power Query Studio</Link>
            <Link href="/business-analytics-studio" onClick={playClickSound} className="rounded-xl bg-indigo-700 px-5 py-3 font-bold text-white transition hover:bg-indigo-800">💼 Business Analytics Studio</Link>
            <Link
              href="/python-studio"
              onClick={playClickSound}
              className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800"
            >
              🐍 Python Studio
            </Link>
            <Link
              href="/statistics-studio"
              onClick={playClickSound}
              className="rounded-xl bg-rose-700 px-5 py-3 font-bold text-white transition hover:bg-rose-800"
            >
              📐 Statistics Studio
            </Link>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

function SkillProgress({ title, progress }: { title: string; progress: number }) {
  return (
    <article className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-md">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold text-gray-900">{title}</h3>
        <span className="text-xl font-bold text-purple-800">{progress}%</span>
      </div>
      <div
        className="mt-4 h-3 overflow-hidden rounded-full bg-purple-100"
        role="progressbar"
        aria-label={`${title} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 transition-[width] duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </article>
  );
}
