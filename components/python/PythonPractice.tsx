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
import type { PythonLesson } from "@/lib/pythonLessons";
import {
  completePythonPractice,
  isAcceptedPythonAnswer,
  loadPythonProgress,
  PYTHON_PROGRESS_EVENT,
} from "@/lib/pythonProgress";
import {
  playClickSound,
  playNotificationSound,
  playSuccessSound,
  playXPSound,
} from "@/lib/sounds";

const columns = [
  "OrderID",
  "CustomerName",
  "Region",
  "Product",
  "Category",
  "Quantity",
  "Sales",
  "Cost",
  "OrderDate",
];

const rows = [
  ["PY-1001", "Aisha Khan", "North", "Analytics Pro", "Software", "2", "2500", "1500", "2026-01-05"],
  ["PY-1002", "Rohan Mehta", "West", "Data Starter", "Course", "3", "675", "240", "2026-01-12"],
  ["PY-1003", "Meera Iyer", "South", "Dashboard Setup", "Service", "1", "980", "520", "2026-02-03"],
  ["PY-1004", "Arjun Das", "East", "Team Insights", "Software", "4", "1440", "760", "2026-02-18"],
  ["PY-1005", "Sana Ali", "North", "Excel Course", "Course", "5", "750", "300", "2026-03-08"],
];

type Feedback = {
  tone: "correct" | "incorrect" | "warning";
  message: string;
} | null;

export default function PythonPractice({
  lesson,
  nextLesson,
}: {
  lesson: PythonLesson;
  nextLesson?: PythonLesson;
}) {
  const { addXP } = useProgress();
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [completed, setCompleted] = useState(() =>
    loadPythonProgress().completedPracticeIds.includes(lesson.id),
  );
  const reward = Math.max(10, Math.floor(lesson.xpReward / 2));

  useEffect(() => {
    const syncProgress = () =>
      setCompleted(
        loadPythonProgress().completedPracticeIds.includes(lesson.id),
      );

    window.addEventListener(PYTHON_PROGRESS_EVENT, syncProgress);
    window.addEventListener("storage", syncProgress);
    return () => {
      window.removeEventListener(PYTHON_PROGRESS_EVENT, syncProgress);
      window.removeEventListener("storage", syncProgress);
    };
  }, [lesson.id]);

  function checkAnswer() {
    playClickSound();

    if (!answer.trim()) {
      setFeedback({
        tone: "warning",
        message: "Write a Python answer before checking this task.",
      });
      return;
    }

    if (!isAcceptedPythonAnswer(answer, lesson.acceptedAnswers)) {
      playNotificationSound();
      setFeedback({
        tone: "incorrect",
        message:
          "Not quite yet. Check the names, brackets, quotes, and method order, then use the hint and try again.",
      });
      return;
    }

    const result = completePythonPractice(lesson.id);
    setCompleted(result.state.completedPracticeIds.includes(lesson.id));
    playSuccessSound();

    if (result.newlyCompleted) {
      addXP(reward);
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
          href={`/python-studio/${lesson.id}`}
          onClick={playClickSound}
          className="inline-flex items-center gap-2 font-bold text-cyan-800 transition hover:text-cyan-950"
        >
          <ArrowLeft size={18} aria-hidden="true" /> Back to lesson
        </Link>

        <header className="rounded-3xl border border-white/70 bg-gradient-to-br from-cyan-100 via-blue-100 to-amber-100 p-7 shadow-lg sm:p-10">
          <p className="font-bold text-cyan-900">
            Python Practice · {lesson.difficulty}
          </p>
          <h1 className="mt-2 text-4xl font-black sm:text-5xl">
            {lesson.icon} {lesson.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">
            Write a small deterministic answer using the sales preview below. The
            checker compares code structure; it does not execute Python in your browser.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold">
            <span className="rounded-full bg-white/85 px-4 py-2 text-cyan-900">
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
          <h2 className="flex items-center gap-2 text-2xl font-black">
            <Table2 className="text-blue-800" aria-hidden="true" /> Sales dataset preview
          </h2>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <caption className="sr-only">
                Sales records used as context for the Python practice task
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
                  <tr key={row[0]}>
                    {row.map((cell, index) => (
                      <td
                        key={`${row[0]}-${columns[index]}`}
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

        <section className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-lg sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wider text-cyan-800">
            Your task
          </p>
          <h2 className="mt-2 text-2xl font-black">{lesson.practiceTask}</h2>

          <label className="mt-6 block">
            <span className="mb-2 block font-bold text-slate-800">Python code</span>
            <textarea
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value);
                setFeedback(null);
              }}
              rows={8}
              spellCheck={false}
              placeholder="# Write your Python answer here"
              className="w-full rounded-2xl border-2 border-slate-300 bg-slate-950 p-5 font-mono text-sm leading-7 text-emerald-200 outline-none placeholder:text-slate-500 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={checkAnswer}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-5 py-3 font-bold text-white transition hover:bg-cyan-800"
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
            href={`/python-studio/${lesson.id}`}
            onClick={playClickSound}
            className="rounded-xl border border-cyan-200 bg-white px-5 py-3 font-bold text-cyan-900 shadow-sm"
          >
            Back to {lesson.title}
          </Link>
          {nextLesson ? (
            <Link
              href={`/python-studio/${nextLesson.id}`}
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
