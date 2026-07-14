import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, ChartNoAxesCombined, Code2, Database, FlaskConical, RefreshCcw, Sigma, Sparkles } from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import { practiceProjects } from "@/lib/dashboardPractice";
import { sqlLessons } from "@/lib/sqlLessons";
import { powerBILessons } from "@/lib/powerBILessons";
import { daxLessons } from "@/lib/daxFormulas";
import { pythonLessons } from "@/lib/pythonLessons";
import { statisticsLessons } from "@/lib/statisticsLessons";
import { powerQueryLessons } from "@/lib/powerQueryLessons";
import { businessAnalyticsLessons } from "@/lib/businessAnalyticsLessons";
import { datasetLibrary } from "@/lib/datasetLibrary";

export default function PracticePage() {
  return (
    <AppLayout>
      <div className="space-y-8 text-slate-900">
        <header className="rounded-3xl border border-purple-200 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-7 shadow-lg sm:p-10">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-bold text-purple-900 shadow-sm">
              <FlaskConical aria-hidden="true" size={17} />
              Hands-on dashboard skills
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              🧪 Practice Lab
            </h1>
            <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-slate-700 sm:text-lg">
              Work through realistic business data, check your analysis
              instantly, and earn XP as you complete each task.
            </p>
          </div>
        </header>

        <section aria-labelledby="practice-projects-heading">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-purple-800">
                Pick a dataset
              </p>
              <h2
                id="practice-projects-heading"
                className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl"
              >
                Analyst practice projects
              </h2>
            </div>
            <p className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">
              <Sparkles aria-hidden="true" size={17} className="text-purple-700" />
              10 learning paths · 42 datasets + dashboard tasks + Studio practice
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {practiceProjects.map((project) => {
              const totalXP = project.tasks.reduce(
                (total, task) => total + task.xpReward,
                0,
              );

              return (
                <Link
                  key={project.id}
                  href={project.practiceRoute}
                  className={`group flex min-h-72 flex-col rounded-3xl border-2 p-7 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-700 ${project.cardClassName}`}
                >
                  <span
                    aria-hidden="true"
                    className="text-4xl transition group-hover:scale-110"
                  >
                    {project.icon}
                  </span>
                  <h3 className="mt-5 text-2xl font-black text-slate-950">
                    {project.title}
                  </h3>
                  <p className="mt-3 flex-1 font-medium leading-6 text-slate-700">
                    {project.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
                    <span className="rounded-full bg-white/90 px-3 py-1.5 text-slate-800 shadow-sm">
                      Exactly 3 tasks
                    </span>
                    <span className="rounded-full bg-amber-100 px-3 py-1.5 text-amber-950 shadow-sm">
                      {totalXP} XP
                    </span>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-2 font-black text-purple-800">
                    Start practice
                    <ArrowRight
                      aria-hidden="true"
                      size={19}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              );
            })}

            <Link
              href="/sql-studio"
              className="group flex min-h-72 flex-col rounded-3xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-blue-50 p-7 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-700"
            >
              <Database aria-hidden="true" className="text-purple-800 transition group-hover:scale-110" size={42} />
              <h3 className="mt-5 text-2xl font-black text-slate-950">SQL Practice</h3>
              <p className="mt-3 flex-1 font-medium leading-6 text-slate-700">
                Practice deterministic SQL queries from SELECT through window functions.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
                <span className="rounded-full bg-white/90 px-3 py-1.5 text-slate-800 shadow-sm">{sqlLessons.length} lessons</span>
                <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-950 shadow-sm">One-time XP</span>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 font-black text-purple-800">Open SQL Studio <ArrowRight aria-hidden="true" size={19} className="transition-transform group-hover:translate-x-1" /></span>
            </Link>

            <Link href="/power-bi-studio" className="group flex min-h-72 flex-col rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-white to-purple-50 p-7 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <ChartNoAxesCombined aria-hidden="true" className="text-amber-800 transition group-hover:scale-110" size={42}/>
              <h3 className="mt-5 text-2xl font-black text-slate-950">Power BI Practice</h3>
              <p className="mt-3 flex-1 font-medium leading-6 text-slate-700">Solve realistic concept and DAX exercises using a sales dataset preview.</p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold"><span className="rounded-full bg-white px-3 py-1.5">{powerBILessons.length} Power BI lessons</span><span className="rounded-full bg-amber-100 px-3 py-1.5">{daxLessons.length} DAX lessons</span></div>
              <span className="mt-6 inline-flex items-center gap-2 font-black text-amber-800">Open Power BI Studio <ArrowRight size={19}/></span>
            </Link>

            <Link
              href="/power-query-studio"
              className="group flex min-h-72 flex-col rounded-3xl border-2 border-teal-200 bg-gradient-to-br from-teal-50 via-white to-purple-50 p-7 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
            >
              <RefreshCcw
                aria-hidden="true"
                className="text-teal-800 transition group-hover:scale-110"
                size={42}
              />
              <h3 className="mt-5 text-2xl font-black text-slate-950">
                Power Query Practice
              </h3>
              <p className="mt-3 flex-1 font-medium leading-6 text-slate-700">
                Clean realistic files, choose repeatable transformations, use hints,
                and earn protected one-time XP.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
                <span className="rounded-full bg-white/90 px-3 py-1.5 text-slate-800 shadow-sm">
                  {powerQueryLessons.length} lessons
                </span>
                <span className="rounded-full bg-teal-100 px-3 py-1.5 text-teal-950 shadow-sm">
                  5 dataset scenarios
                </span>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 font-black text-teal-800">
                Open Power Query Studio
                <ArrowRight
                  aria-hidden="true"
                  size={19}
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </Link>

            <Link
              href="/python-studio"
              className="group flex min-h-72 flex-col rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-7 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
            >
              <Code2
                aria-hidden="true"
                className="text-emerald-800 transition group-hover:scale-110"
                size={42}
              />
              <h3 className="mt-5 text-2xl font-black text-slate-950">
                Python Practice
              </h3>
              <p className="mt-3 flex-1 font-medium leading-6 text-slate-700">
                Practice Python, NumPy, Pandas, and visualization with realistic
                analyst exercises and deterministic answer checks.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
                <span className="rounded-full bg-white/90 px-3 py-1.5 text-slate-800 shadow-sm">
                  {pythonLessons.length} lessons
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-950 shadow-sm">
                  One-time XP
                </span>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 font-black text-emerald-800">
                Open Python Studio
                <ArrowRight
                  aria-hidden="true"
                  size={19}
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </Link>

            <Link
              href="/business-analytics-studio"
              className="group flex min-h-72 flex-col rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-7 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-700"
            >
              <BriefcaseBusiness
                aria-hidden="true"
                className="text-indigo-800 transition group-hover:scale-110"
                size={42}
              />
              <h3 className="mt-5 text-2xl font-black text-slate-950">
                Business Analytics Practice
              </h3>
              <p className="mt-3 flex-1 font-medium leading-6 text-slate-700">
                Solve deterministic, data-backed business cases with hints,
                instant feedback, and protected one-time XP.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
                <span className="rounded-full bg-white/90 px-3 py-1.5 text-slate-800 shadow-sm">
                  {businessAnalyticsLessons.length} lessons
                </span>
                <span className="rounded-full bg-indigo-100 px-3 py-1.5 text-indigo-950 shadow-sm">
                  6 case datasets
                </span>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 font-black text-indigo-800">
                Open Business Analytics Studio
                <ArrowRight
                  aria-hidden="true"
                  size={19}
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </Link>

            <Link
              href="/statistics-studio"
              className="group flex min-h-72 flex-col rounded-3xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 via-white to-purple-50 p-7 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-700"
            >
              <Sigma
                aria-hidden="true"
                className="text-rose-800 transition group-hover:scale-110"
                size={42}
              />
              <h3 className="mt-5 text-2xl font-black text-slate-950">
                Statistics Practice
              </h3>
              <p className="mt-3 flex-1 font-medium leading-6 text-slate-700">
                Practice descriptive statistics, probability, inference,
                regression, sampling, and experiments with deterministic checks.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
                <span className="rounded-full bg-white/90 px-3 py-1.5 text-slate-800 shadow-sm">
                  {statisticsLessons.length} lessons
                </span>
                <span className="rounded-full bg-rose-100 px-3 py-1.5 text-rose-950 shadow-sm">
                  One-time XP
                </span>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 font-black text-rose-800">
                Open Statistics Studio
                <ArrowRight
                  aria-hidden="true"
                  size={19}
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </Link>

            <Link
              href="/dataset-library"
              className="group flex min-h-72 flex-col rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 via-white to-sky-50 p-7 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700"
            >
              <Database
                aria-hidden="true"
                className="text-violet-800 transition group-hover:scale-110"
                size={42}
              />
              <h3 className="mt-5 text-2xl font-black text-slate-950">
                Dataset Library
              </h3>
              <p className="mt-3 flex-1 font-medium leading-6 text-slate-700">
                Preview, filter, sort, and download realistic CSV datasets for
                every major DataBloom learning path.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
                <span className="rounded-full bg-white/90 px-3 py-1.5 text-slate-800 shadow-sm">
                  {datasetLibrary.length} datasets
                </span>
                <span className="rounded-full bg-violet-100 px-3 py-1.5 text-violet-950 shadow-sm">
                  Downloadable CSV
                </span>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 font-black text-violet-800">
                Open Dataset Library
                <ArrowRight
                  aria-hidden="true"
                  size={19}
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </Link>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
