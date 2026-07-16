"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  RotateCcw,
  Table2,
} from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import { useProgress } from "@/context/ProgressContext";
import type { StatisticsLesson } from "@/lib/statisticsLessons";
import {
  completeStatisticsPractice,
  isAcceptedStatisticsAnswer,
  loadStatisticsProgress,
  STATISTICS_PROGRESS_EVENT,
} from "@/lib/statisticsProgress";
import {
  playClickSound,
  playNotificationSound,
  playSuccessSound,
  playXPSound,
} from "@/lib/sounds";
import { registerStudyActivity } from "@/lib/studyActivity";

const columns = [
  "Campaign",
  "Variant",
  "Visitors",
  "Conversions",
  "Revenue",
  "OrderValue",
  "SessionMinutes",
];

const rows = [
  ["Summer Search", "A", "1200", "132", "198000", "1500", "4.8"],
  ["Summer Search", "B", "1180", "153", "235620", "1540", "5.2"],
  ["Welcome Email", "A", "900", "99", "118800", "1200", "3.9"],
  ["Welcome Email", "B", "920", "121", "151250", "1250", "4.4"],
  ["Retargeting", "A", "760", "106", "169600", "1600", "6.1"],
  ["Retargeting", "B", "750", "120", "198000", "1650", "6.5"],
];

type Feedback = {
  tone: "correct" | "incorrect" | "warning";
  message: string;
} | null;

export default function StatisticsPractice({
  lesson,
  nextLesson,
}: {
  lesson: StatisticsLesson;
  nextLesson?: StatisticsLesson;
}) {
  const { addXP } = useProgress();
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [completed, setCompleted] = useState(() =>
    loadStatisticsProgress().completedPracticeIds.includes(lesson.id),
  );
  const reward = Math.max(10, Math.floor(lesson.xpReward / 2));

  useEffect(() => {
    const syncProgress = () =>
      setCompleted(
        loadStatisticsProgress().completedPracticeIds.includes(lesson.id),
      );

    window.addEventListener(STATISTICS_PROGRESS_EVENT, syncProgress);
    window.addEventListener("storage", syncProgress);
    return () => {
      window.removeEventListener(STATISTICS_PROGRESS_EVENT, syncProgress);
      window.removeEventListener("storage", syncProgress);
    };
  }, [lesson.id]);

  function checkAnswer() {
    playClickSound();

    if (!answer.trim()) {
      setFeedback({
        tone: "warning",
        message: "Write a calculation, formula, or conclusion before checking this task.",
      });
      return;
    }

    if (!isAcceptedStatisticsAnswer(answer, lesson.acceptedAnswers)) {
      playNotificationSound();
      setFeedback({
        tone: "incorrect",
        message:
          "Not quite yet. Check the values, operation, rounding, and statistical meaning, then use the hint and try again.",
      });
      return;
    }

    const result = completeStatisticsPractice(lesson.id);
    setCompleted(result.state.completedPracticeIds.includes(lesson.id));
    playSuccessSound();

    if (result.newlyCompleted) {
      addXP(reward);
      registerStudyActivity({ kind: "practice", source: `statistics-practice:${lesson.id}`, minutes: 10, xp: reward });
      playXPSound();
    }

    setFeedback({
      tone: "correct",
      message: result.newlyCompleted
        ? `Correct! You earned ${reward} XP.`
        : "Correct! This practice was already rewarded, so XP was not added again.",
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
          href={`/statistics-studio/${lesson.id}`}
          onClick={playClickSound}
          className="inline-flex items-center gap-2 font-bold text-violet-800 transition hover:text-violet-950"
        >
          <ArrowLeft size={18} aria-hidden="true" /> Back to lesson
        </Link>

        <header className="rounded-3xl border border-white/70 bg-gradient-to-br from-violet-100 via-pink-100 to-sky-100 p-7 shadow-lg sm:p-10">
          <p className="font-bold text-violet-900">
            Statistics Practice · {lesson.difficulty}
          </p>
          <h1 className="mt-2 text-4xl font-black text-slate-950 sm:text-5xl">
            {lesson.icon} {lesson.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">
            Use the campaign preview as business context, then submit one deterministic
            calculation, formula, or conclusion. The checker compares your answer; it
            does not run a statistical engine in the browser.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold">
            <span className="rounded-full bg-white/85 px-4 py-2 text-violet-900">
              +{reward} XP once
            </span>
            {completed ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-4 py-2 text-emerald-900">
                <CheckCircle2 size={16} aria-hidden="true" /> Practice complete
              </span>
            ) : null}
          </div>
        </header>

        <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-lg sm:p-8">
          <h2 className="flex items-center gap-2 text-2xl font-black text-slate-950">
            <Table2 className="text-blue-800" aria-hidden="true" /> Campaign experiment
            preview
          </h2>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <caption className="sr-only">
                Campaign experiment records used as context for the Statistics practice
                task
              </caption>
              <thead className="bg-slate-950 text-white">
                <tr>
                  {columns.map((column) => (
                    <th key={column} scope="col" className="whitespace-nowrap px-4 py-3">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {rows.map((row) => (
                  <tr key={`${row[0]}-${row[1]}`}>
                    {row.map((cell, index) => (
                      <td
                        key={`${row[0]}-${row[1]}-${columns[index]}`}
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

        <section className="rounded-3xl border border-violet-100 bg-white p-6 shadow-lg sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wider text-violet-800">
            Your task
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            {lesson.practiceTask}
          </h2>

          <label className="mt-6 block">
            <span className="mb-2 block font-bold text-slate-800">Your answer</span>
            <textarea
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value);
                setFeedback(null);
              }}
              rows={6}
              spellCheck={false}
              placeholder="Enter the value, formula, or statistical conclusion…"
              className="w-full rounded-2xl border-2 border-slate-300 bg-slate-950 p-5 font-mono text-sm leading-7 text-emerald-200 outline-none placeholder:text-slate-500 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={checkAnswer}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 font-bold text-white transition hover:bg-violet-800"
            >
              <CheckCircle2 size={18} aria-hidden="true" /> Check Answer
            </button>
            <button
              type="button"
              aria-expanded={showHint}
              onClick={() => {
                playClickSound();
                setShowHint((value) => !value);
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
            href={`/statistics-studio/${lesson.id}`}
            onClick={playClickSound}
            className="rounded-xl border border-violet-200 bg-white px-5 py-3 font-bold text-violet-900 shadow-sm"
          >
            Back to {lesson.title}
          </Link>
          {nextLesson ? (
            <Link
              href={`/statistics-studio/${nextLesson.id}`}
              onClick={playClickSound}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800"
            >
              Next: {nextLesson.title} <ArrowRight size={18} aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </div>
    </AppLayout>
  );
}
