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
import type { SQLLesson } from "@/lib/sqlLessons";
import {
  completeSQLPractice,
  isAcceptedSQLAnswer,
  loadSQLProgress,
  SQL_PROGRESS_EVENT,
} from "@/lib/sqlProgress";
import {
  playClickSound,
  playNotificationSound,
  playSuccessSound,
  playXPSound,
} from "@/lib/sounds";

const previewRows = [
  ["SO-1001", "Aisha Khan", "North", "Analytics Pro", "Software", "2", "1250", "2026-01-05"],
  ["SO-1002", "Rohan Mehta", "West", "Data Starter", "Course", "3", "675", "2026-01-12"],
  ["SO-1003", "Meera Iyer", "South", "Dashboard Setup", "Service", "1", "980", "2026-02-03"],
  ["SO-1004", "Arjun Das", "East", "Team Insights", "Software", "4", "1440", "2026-02-18"],
  ["SO-1005", "Sana Ali", "North", "Excel Course", "Course", "5", "750", "2026-03-08"],
];

const columns = ["OrderID", "CustomerName", "Region", "Product", "Category", "Quantity", "Sales", "OrderDate"];

type Feedback = { tone: "correct" | "incorrect" | "warning"; message: string } | null;

export default function SQLPractice({
  lesson,
  nextLesson,
}: {
  lesson: SQLLesson;
  nextLesson?: SQLLesson;
}) {
  const { addXP } = useProgress();
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [completed, setCompleted] = useState(() =>
    loadSQLProgress().completedPracticeIds.includes(lesson.id),
  );
  const practiceReward = Math.max(10, Math.floor(lesson.xpReward / 2));

  useEffect(() => {
    const sync = () =>
      setCompleted(loadSQLProgress().completedPracticeIds.includes(lesson.id));
    window.addEventListener(SQL_PROGRESS_EVENT, sync);
    return () => window.removeEventListener(SQL_PROGRESS_EVENT, sync);
  }, [lesson.id]);

  function checkAnswer() {
    playClickSound();
    if (!answer.trim()) {
      setFeedback({ tone: "warning", message: "Write a SQL query before checking your answer." });
      return;
    }
    if (!isAcceptedSQLAnswer(answer, lesson.acceptedAnswers)) {
      playNotificationSound();
      setFeedback({ tone: "incorrect", message: "Not quite. Check the clause order, names, punctuation, and hint, then try again." });
      return;
    }

    const result = completeSQLPractice(lesson.id);
    setCompleted(result.state.completedPracticeIds.includes(lesson.id));
    playSuccessSound();
    if (result.newlyCompleted) {
      addXP(practiceReward);
      playXPSound();
    }
    setFeedback({
      tone: "correct",
      message: result.newlyCompleted
        ? `Correct! You earned ${practiceReward} XP.`
        : "Correct! This practice was already rewarded, so XP was not added again.",
    });
  }

  function reset() {
    playClickSound();
    setAnswer("");
    setShowHint(false);
    setFeedback(null);
  }

  return (
    <AppLayout>
      <div className="space-y-7 text-gray-950">
        <Link href={`/sql-studio/${lesson.id}`} onClick={playClickSound} className="inline-flex items-center gap-2 font-bold text-purple-700 hover:text-purple-900">
          <ArrowLeft size={18} aria-hidden="true" /> Back to lesson
        </Link>

        <header className="rounded-3xl border border-white/70 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-7 shadow-lg sm:p-10">
          <p className="font-bold text-purple-700">SQL Practice · {lesson.difficulty}</p>
          <h1 className="mt-2 text-4xl font-black text-gray-950 sm:text-5xl">{lesson.icon} {lesson.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-700">Use the preview table to write one deterministic query. This checks query structure; it does not run against a database yet.</p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold">
            <span className="rounded-full bg-white/80 px-4 py-2 text-purple-800">+{practiceReward} XP once</span>
            {completed && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-4 py-2 text-emerald-800"><CheckCircle2 size={16} /> Practice complete</span>}
          </div>
        </header>

        <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-lg sm:p-8">
          <div className="flex items-center gap-2 text-blue-800"><Table2 size={21} /><h2 className="text-2xl font-bold">sales table preview</h2></div>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-gray-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-900 text-white"><tr>{columns.map((column) => <th key={column} className="whitespace-nowrap px-4 py-3">{column}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-200">{previewRows.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={`${row[0]}-${columns[index]}`} className="whitespace-nowrap px-4 py-3 text-gray-700">{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border border-purple-100 bg-white p-6 shadow-lg sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wider text-purple-700">Your task</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-950">{lesson.practiceTask}</h2>
          <label className="mt-6 block">
            <span className="mb-2 block font-bold text-gray-800">SQL query</span>
            <textarea value={answer} onChange={(event) => { setAnswer(event.target.value); setFeedback(null); }} rows={8} spellCheck={false} placeholder="SELECT ..." className="w-full rounded-2xl border-2 border-slate-300 bg-slate-950 p-5 font-mono text-sm leading-7 text-emerald-200 outline-none placeholder:text-slate-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-100" />
          </label>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={checkAnswer} className="inline-flex items-center gap-2 rounded-xl bg-purple-700 px-5 py-3 font-bold text-white hover:bg-purple-800"><CheckCircle2 size={18} /> Check Answer</button>
            <button type="button" onClick={() => { playClickSound(); setShowHint((value) => !value); }} aria-expanded={showHint} className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-5 py-3 font-bold text-amber-900 hover:bg-amber-100"><Lightbulb size={18} /> {showHint ? "Hide Hint" : "Hint"}</button>
            <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 font-bold text-gray-700 hover:bg-gray-100"><RotateCcw size={18} /> Reset</button>
          </div>

          {showHint && <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 leading-7 text-amber-950"><strong>Hint:</strong> {lesson.hint}</div>}
          {feedback && <div role="status" aria-live="polite" className={`mt-4 rounded-2xl border p-4 font-bold leading-7 ${feedback.tone === "correct" ? "border-emerald-300 bg-emerald-50 text-emerald-950" : feedback.tone === "incorrect" ? "border-rose-300 bg-rose-50 text-rose-950" : "border-amber-300 bg-amber-50 text-amber-950"}`}>{feedback.message}</div>}
        </section>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href={`/sql-studio/${lesson.id}`} onClick={playClickSound} className="rounded-xl border border-purple-200 bg-white px-5 py-3 font-bold text-purple-800 shadow-sm">Back to {lesson.title}</Link>
          {nextLesson && <Link href={`/sql-studio/${nextLesson.id}`} onClick={playClickSound} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800">Next: {nextLesson.title}<ArrowRight size={18} /></Link>}
        </div>
      </div>
    </AppLayout>
  );
}
