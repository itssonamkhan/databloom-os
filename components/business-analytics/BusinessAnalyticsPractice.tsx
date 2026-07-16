"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  Lightbulb,
  RotateCcw,
  Table2,
} from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import { useProgress } from "@/context/ProgressContext";
import { getBusinessAnalyticsDataset } from "@/lib/businessAnalyticsDatasets";
import type { BusinessAnalyticsLesson } from "@/lib/businessAnalyticsLessons";
import {
  BUSINESS_ANALYTICS_PROGRESS_EVENT,
  completeBusinessAnalyticsPractice,
  isAcceptedBusinessAnalyticsAnswer,
  loadBusinessAnalyticsProgress,
} from "@/lib/businessAnalyticsProgress";
import {
  playClickSound,
  playNotificationSound,
  playSuccessSound,
  playXPSound,
} from "@/lib/sounds";
import { registerStudyActivity } from "@/lib/studyActivity";

type Feedback = {
  tone: "correct" | "incorrect" | "warning";
  message: string;
} | null;

export default function BusinessAnalyticsPractice({
  lesson,
  nextLesson,
}: {
  lesson: BusinessAnalyticsLesson;
  nextLesson?: BusinessAnalyticsLesson;
}) {
  const { addXP } = useProgress();
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [completed, setCompleted] = useState(() =>
    loadBusinessAnalyticsProgress().completedPracticeIds.includes(lesson.id),
  );
  const reward = Math.max(10, Math.floor(lesson.xpReward / 2));
  const dataset = getBusinessAnalyticsDataset(lesson.category, lesson.id);

  useEffect(() => {
    const syncProgress = () =>
      setCompleted(
        loadBusinessAnalyticsProgress().completedPracticeIds.includes(lesson.id),
      );
    window.addEventListener(BUSINESS_ANALYTICS_PROGRESS_EVENT, syncProgress);
    window.addEventListener("storage", syncProgress);
    return () => {
      window.removeEventListener(BUSINESS_ANALYTICS_PROGRESS_EVENT, syncProgress);
      window.removeEventListener("storage", syncProgress);
    };
  }, [lesson.id]);

  function checkAnswer() {
    playClickSound();
    if (!answer) {
      setFeedback({
        tone: "warning",
        message: "Choose an answer before checking this business case.",
      });
      return;
    }

    if (!isAcceptedBusinessAnalyticsAnswer(answer, lesson.correctAnswer)) {
      playNotificationSound();
      setFeedback({
        tone: "incorrect",
        message:
          "Not quite yet. Revisit the decision goal, inspect the evidence, and use the hint before trying again.",
      });
      return;
    }

    const result = completeBusinessAnalyticsPractice(lesson.id);
    setCompleted(result.state.completedPracticeIds.includes(lesson.id));
    playSuccessSound();
    if (result.newlyCompleted) {
      addXP(reward);
      registerStudyActivity({ kind: "practice", source: `business-analytics-practice:${lesson.id}`, minutes: 10, xp: reward });
      playXPSound();
    }
    setFeedback({
      tone: "correct",
      message: result.newlyCompleted
        ? `Correct! You earned ${reward} XP.`
        : "Correct! This case was already rewarded, so XP was not added again.",
    });
  }

  function resetPractice() {
    playClickSound();
    setAnswer("");
    setShowHint(false);
    setFeedback(null);
  }

  return (
    <AppLayout>
      <div className="space-y-7 text-slate-950">
        <Link
          href={`/business-analytics-studio/${lesson.id}`}
          onClick={playClickSound}
          className="inline-flex items-center gap-2 font-bold text-indigo-800 transition hover:text-indigo-950"
        >
          <ArrowLeft size={18} aria-hidden="true" /> Back to lesson
        </Link>

        <header className="rounded-3xl border border-white/70 bg-gradient-to-br from-indigo-100 via-pink-100 to-amber-100 p-7 shadow-lg sm:p-10">
          <p className="font-bold text-indigo-900">
            Business Analytics Practice · {lesson.difficulty}
          </p>
          <h1 className="mt-2 text-4xl font-black sm:text-5xl">
            {lesson.icon} {lesson.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">
            Use the {dataset.title.toLocaleLowerCase()} sample to frame a clear
            recommendation and select the strongest analytical response.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold">
            <span className="rounded-full bg-white/85 px-4 py-2 text-indigo-900">
              +{reward} XP once
            </span>
            {completed ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-4 py-2 text-emerald-900">
                <CheckCircle2 size={16} aria-hidden="true" /> Practice complete
              </span>
            ) : null}
          </div>
        </header>

        <section className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-lg sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <h2 className="flex items-center gap-2 text-2xl font-black">
                <Table2 className="text-indigo-800" aria-hidden="true" />
                {dataset.title}
              </h2>
              <p className="mt-2 leading-7 text-slate-700">
                {dataset.description}
              </p>
              <p className="mt-3 rounded-2xl bg-indigo-50 p-4 font-semibold leading-7 text-indigo-950">
                <strong>Dataset task:</strong> {dataset.task}
              </p>
              <p className="mt-3 rounded-2xl bg-amber-50 p-4 font-semibold leading-7 text-amber-950">
                <strong>Case prompt:</strong> {lesson.casePrompt}
              </p>
            </div>
            <a
              href={dataset.downloadPath}
              download
              onClick={playClickSound}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 font-bold text-indigo-900 transition hover:bg-indigo-100"
            >
              <Download size={18} aria-hidden="true" /> Download CSV
            </a>
          </div>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <caption className="sr-only">{dataset.description}</caption>
              <thead className="bg-slate-950 text-white">
                <tr>
                  {dataset.columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="whitespace-nowrap px-4 py-3"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {dataset.rows.map((row, rowIndex) => (
                  <tr key={`${dataset.id}-${rowIndex}`}>
                    {row.map((cell, columnIndex) => (
                      <td
                        key={`${dataset.id}-${rowIndex}-${dataset.columns[columnIndex]}`}
                        className="whitespace-nowrap px-4 py-3 text-slate-700"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border border-pink-100 bg-white p-6 shadow-lg sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wider text-pink-700">
            Your decision
          </p>
          <h2 className="mt-2 text-2xl font-black">
            {lesson.practiceQuestion}
          </h2>

          <fieldset className="mt-6 space-y-3">
            <legend className="sr-only">Answer choices</legend>
            {lesson.practiceOptions.map((option) => (
              <label
                key={option}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                  answer === option
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-indigo-100 bg-white hover:bg-indigo-50/50"
                }`}
              >
                <input
                  type="radio"
                  name="business-analytics-answer"
                  value={option}
                  checked={answer === option}
                  onChange={(event) => {
                    setAnswer(event.target.value);
                    setFeedback(null);
                  }}
                  className="mt-1"
                />
                <span className="font-semibold leading-7 text-slate-800">
                  {option}
                </span>
              </label>
            ))}
          </fieldset>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={checkAnswer}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-700 px-5 py-3 font-bold text-white transition hover:bg-indigo-800"
            >
              <CheckCircle2 size={18} aria-hidden="true" /> Check Answer
            </button>
            <button
              type="button"
              aria-expanded={showHint}
              onClick={() => {
                playClickSound();
                setShowHint((current) => !current);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-5 py-3 font-bold text-amber-900 transition hover:bg-amber-100"
            >
              <Lightbulb size={18} aria-hidden="true" />
              {showHint ? "Hide Hint" : "Hint"}
            </button>
            <button
              type="button"
              onClick={resetPractice}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100"
            >
              <RotateCcw size={18} aria-hidden="true" /> Reset
            </button>
          </div>

          {showHint ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 leading-7 text-amber-950">
              <strong>Hint:</strong> {lesson.hint}
            </div>
          ) : null}

          {feedback ? (
            <div
              role="status"
              aria-live="polite"
              className={`mt-4 rounded-2xl border p-4 font-bold leading-7 ${
                feedback.tone === "correct"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                  : feedback.tone === "incorrect"
                    ? "border-rose-300 bg-rose-50 text-rose-950"
                    : "border-amber-300 bg-amber-50 text-amber-950"
              }`}
            >
              {feedback.message}
            </div>
          ) : null}
        </section>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/business-analytics-studio/${lesson.id}`}
            onClick={playClickSound}
            className="rounded-xl border border-indigo-200 bg-white px-5 py-3 font-bold text-indigo-900 shadow-sm"
          >
            Back to {lesson.title}
          </Link>
          {nextLesson ? (
            <Link
              href={`/business-analytics-studio/${nextLesson.id}`}
              onClick={playClickSound}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-700 px-5 py-3 font-bold text-white transition hover:bg-indigo-800"
            >
              Next: {nextLesson.title}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </div>
    </AppLayout>
  );
}
