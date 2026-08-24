import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data Analyst Interview Preparation for Beginners",
  description:
    "A practical beginner guide to preparing for data analyst interviews, covering SQL, Excel, Power BI, projects, behavioral questions, and mock interview practice.",
  alternates: {
    canonical:
      "https://www.databloomos.com/data-analyst-interview-preparation",
  },
};

const preparationTopics = [
  {
    title: "Excel",
    icon: "📊",
    description:
      "Be ready to explain how you would clean a table, use formulas such as IF or XLOOKUP, summarize data with a PivotTable, and check that your result is trustworthy.",
  },
  {
    title: "SQL",
    icon: "🗃️",
    description:
      "Practice writing readable SELECT queries with filters, joins, aggregations, GROUP BY, and window functions. Explain what each step does and how you would validate the output.",
  },
  {
    title: "Power BI and data visualization",
    icon: "📈",
    description:
      "Show that you can choose a chart for the question, build a useful measure, keep a report easy to scan, and describe the decision a dashboard should support.",
  },
  {
    title: "Statistics",
    icon: "🔎",
    description:
      "Understand averages, spread, sampling, correlation, and basic experiment reasoning well enough to explain uncertainty instead of presenting every number as a fact.",
  },
  {
    title: "Data cleaning and analysis",
    icon: "🧹",
    description:
      "Talk through missing values, duplicates, inconsistent categories, date problems, and validation checks. Interviewers want to hear how you protect the analysis from silent data errors.",
  },
  {
    title: "Projects and portfolio",
    icon: "🧰",
    description:
      "Choose one or two projects you can explain deeply: the question, the data, your method, the result, and what you would improve next. A clear explanation matters more than a long tool list.",
  },
  {
    title: "Behavioral and HR questions",
    icon: "💬",
    description:
      "Prepare short stories about solving a problem, handling ambiguity, communicating an insight, receiving feedback, and working with a stakeholder. Use a specific situation and outcome.",
  },
];

const preparationSteps = [
  ["Review fundamentals", "Refresh the Excel, SQL, visualization, and statistics concepts you expect to use."],
  ["Practice questions", "Solve small SQL and Excel interview questions, then explain your reasoning aloud."],
  ["Work through realistic data scenarios", "Use a messy table or business prompt and describe your cleaning, analysis, and validation choices."],
  ["Practice explaining your projects", "Tell the story without reading from your portfolio, and prepare for follow-up questions about trade-offs."],
  ["Practice timed mock interviews", "Set a time limit, answer in complete thoughts, and note which topics need another review."],
] as const;

const commonMistakes = [
  "Memorizing syntax without understanding what business question the query or formula answers.",
  "Showing a polished chart while skipping data quality checks and assumptions.",
  "Describing a project only by listing tools instead of explaining decisions and measurable findings.",
  "Giving a long answer before clarifying the grain, definitions, or success metric.",
  "Waiting until the interview to practice speaking through a solution under time pressure.",
];

const checklist = [
  "Explain one Excel analysis from raw data to a checked result.",
  "Write a SQL query using a join and an aggregation, then describe how you would test it.",
  "Interpret a dashboard and identify the decision its audience should make.",
  "Describe a data-cleaning choice and its effect on the analysis.",
  "Tell one project story using problem, data, method, insight, and recommendation.",
  "Prepare three concise behavioral stories and complete one timed mock interview.",
];

export default function DataAnalystInterviewPreparationPage() {
  return (
    <main
      data-databloom-page
      className="min-h-screen px-4 py-8 text-slate-900 sm:px-6 sm:py-12 lg:px-8"
    >
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-purple-200 bg-white/70 px-4 py-2 text-sm font-black text-purple-800 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700"
          >
            🌸 DataBloom OS
          </Link>
          <span className="rounded-full border border-white/80 bg-white/60 px-4 py-2 text-sm font-bold text-slate-600 backdrop-blur-xl">
            Beginner interview guide
          </span>
        </header>

        <section className="databloom-phase3-gradient-surface mt-8 rounded-[2rem] border border-white/90 p-6 shadow-[0_24px_70px_rgba(126,34,206,0.14)] backdrop-blur-xl sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-600">
            Start with a clear plan
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
            Data Analyst Interview Preparation for Beginners
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700 sm:text-xl">
            A first data analyst interview can cover tools, reasoning, communication,
            and how you approach an unfamiliar problem. You do not need to know
            every feature of every platform; you need to show a careful process and
            explain why your choices make sense.
          </p>
        </section>

        <section className="mt-8">
          <div className="mb-5 max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-600">
              The essential preparation
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              What to prepare for your first interview
            </h2>
            <p className="mt-3 leading-7 text-slate-700">
              Build enough depth to demonstrate each skill in a small, realistic
              example. Interviewers are usually listening for clear assumptions,
              careful checks, and useful communication.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {preparationTopics.map((topic) => (
              <article
                key={topic.title}
                className="databloom-phase3-surface rounded-3xl border border-white/90 p-5 shadow-sm backdrop-blur-xl"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl" aria-hidden="true">
                    {topic.icon}
                  </span>
                  <div>
                    <h3 className="text-xl font-black text-purple-800">
                      {topic.title}
                    </h3>
                    <p className="mt-2 leading-7 text-slate-700">
                      {topic.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 databloom-phase3-surface rounded-[2rem] border border-white/90 p-6 shadow-sm backdrop-blur-xl sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-600">
            A practical sequence
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            Prepare in five focused steps
          </h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {preparationSteps.map(([title, description], index) => (
              <li
                key={title}
                className="rounded-2xl border border-purple-100 bg-white/60 p-4"
              >
                <span className="grid size-9 place-items-center rounded-full bg-purple-600 text-sm font-black text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-black text-purple-800">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {description}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-2">
          <article className="databloom-phase3-surface rounded-[2rem] border border-white/90 p-6 shadow-sm backdrop-blur-xl sm:p-8">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">
              Common beginner mistakes
            </h2>
            <ul className="mt-5 space-y-3 text-slate-700">
              {commonMistakes.map((mistake) => (
                <li key={mistake} className="flex gap-3 leading-7">
                  <span className="mt-1 text-purple-600" aria-hidden="true">
                    ✦
                  </span>
                  <span>{mistake}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="databloom-phase3-surface rounded-[2rem] border border-white/90 p-6 shadow-sm backdrop-blur-xl sm:p-8">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">
              How to explain a data analyst project
            </h2>
            <p className="mt-3 leading-7 text-slate-700">
              Keep your story easy to follow and make your contribution clear.
              A simple structure helps you answer follow-up questions without
              losing the business context.
            </p>
            <ol className="mt-5 grid gap-3 sm:grid-cols-2">
              {["Problem", "Data", "Cleaning", "Analysis", "Insights", "Business recommendation"].map(
                (step, index) => (
                  <li
                    key={step}
                    className="rounded-2xl border border-purple-100 bg-white/60 px-4 py-3 font-bold text-purple-800"
                  >
                    <span className="mr-2 text-purple-500">{index + 1}.</span>
                    {step}
                  </li>
                ),
              )}
            </ol>
          </article>
        </section>

        <section className="mt-8 databloom-phase3-surface rounded-[2rem] border border-white/90 p-6 shadow-sm backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-600">
                Before interview day
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                Beginner preparation checklist
              </h2>
            </div>
            <ul className="grid max-w-3xl gap-3 sm:grid-cols-2">
              {checklist.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
                  <span className="text-purple-600" aria-hidden="true">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-8 databloom-phase3-gradient-surface rounded-[2rem] border border-white/90 p-6 text-center shadow-[0_20px_55px_rgba(126,34,206,0.12)] backdrop-blur-xl sm:p-10">
          <p className="text-4xl" aria-hidden="true">🌱</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
            Ready to practice out loud?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-700">
            DataBloom&apos;s Interview Hub lets you practice interview questions,
            prepare project answers, and try mock interviews when you are ready
            to rehearse the full conversation.
          </p>
          <Link
            href="/interview-hub"
            className="databloom-brand-cta mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-700"
          >
            Practice in Interview Hub →
          </Link>
        </section>

        <footer className="pb-4 pt-8 text-center text-sm text-slate-600">
          A practical starting point for learning, practicing, and explaining your work.
        </footer>
      </div>
    </main>
  );
}
