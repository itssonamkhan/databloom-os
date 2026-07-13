"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Code2,
  Heart,
  Lightbulb,
  MessageSquareText,
  NotebookPen,
  TriangleAlert,
} from "lucide-react";

import CompletionModal from "@/components/dashboard/CompletionModal";
import AppLayout from "@/components/layout/AppLayout";
import { useProgress } from "@/context/ProgressContext";
import { getSQLLesson, type SQLLesson } from "@/lib/sqlLessons";
import {
  completeSQLLesson,
  getSQLNote,
  loadSQLProgress,
  saveSQLNote,
  SQL_PROGRESS_EVENT,
  toggleSQLFavorite,
} from "@/lib/sqlProgress";
import {
  playClickSound,
  playNotificationSound,
  playXPSound,
} from "@/lib/sounds";

export default function SQLLessonDetail({ lesson }: { lesson: SQLLesson }) {
  const router = useRouter();
  const { addXP } = useProgress();
  const initial = loadSQLProgress();
  const [completed, setCompleted] = useState(() =>
    initial.completedLessonIds.includes(lesson.id),
  );
  const [favorite, setFavorite] = useState(() =>
    initial.favoriteLessonIds.includes(lesson.id),
  );
  const [notes, setNotes] = useState(() => getSQLNote(lesson.id));
  const [notesSaved, setNotesSaved] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    const sync = () => {
      const state = loadSQLProgress();
      setCompleted(state.completedLessonIds.includes(lesson.id));
      setFavorite(state.favoriteLessonIds.includes(lesson.id));
    };
    window.addEventListener(SQL_PROGRESS_EVENT, sync);
    return () => window.removeEventListener(SQL_PROGRESS_EVENT, sync);
  }, [lesson.id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setNotesSaved(saveSQLNote(lesson.id, notes));
    }, 450);
    return () => window.clearTimeout(timer);
  }, [lesson.id, notes]);

  function handleFavorite() {
    playClickSound();
    const state = toggleSQLFavorite(lesson.id);
    const isFavorite = state.favoriteLessonIds.includes(lesson.id);
    setFavorite(isFavorite);
    if (isFavorite) playNotificationSound();
  }

  function markLearned() {
    const result = completeSQLLesson(lesson.id);
    setCompleted(result.state.completedLessonIds.includes(lesson.id));
    if (!result.newlyCompleted) return;
    addXP(lesson.xpReward);
    playXPSound();
    setShowCompletion(true);
  }

  return (
    <AppLayout>
      <div className="space-y-7 text-gray-950">
        <Link href="/sql-studio" onClick={playClickSound} className="inline-flex items-center gap-2 font-bold text-purple-700 hover:text-purple-900">
          <ArrowLeft size={18} aria-hidden="true" /> Back to SQL Studio
        </Link>

        <header className="rounded-3xl border border-white/70 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-7 shadow-lg sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <span className="text-5xl" aria-hidden="true">{lesson.icon}</span>
              <h1 className="mt-4 text-4xl font-black text-purple-800 sm:text-5xl">{lesson.title}</h1>
              <p className="mt-4 text-lg leading-8 text-gray-700">{lesson.description}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
                <span className="rounded-full bg-white/80 px-4 py-2 text-purple-800">{lesson.category}</span>
                <span className="rounded-full bg-white/80 px-4 py-2 text-pink-800">{lesson.difficulty}</span>
                <span className="rounded-full bg-white/80 px-4 py-2 text-emerald-800">+{lesson.xpReward} XP</span>
                {completed && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-4 py-2 text-emerald-800"><CheckCircle2 size={16} /> Learned</span>}
              </div>
            </div>
            <button type="button" onClick={handleFavorite} aria-pressed={favorite} className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 font-bold ${favorite ? "border-pink-300 bg-pink-100 text-pink-800" : "border-purple-200 bg-white text-gray-800"}`}>
              <Heart size={19} fill={favorite ? "currentColor" : "none"} /> {favorite ? "Favorited" : "Favorite"}
            </button>
          </div>
        </header>

        <InfoSection title="Simple explanation" icon={<Lightbulb size={22} />} tone="purple">
          <p className="leading-8 text-gray-700">{lesson.explanation}</p>
        </InfoSection>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-slate-950 p-6 shadow-lg sm:p-8">
            <h2 className="flex items-center gap-2 text-xl font-bold text-white"><Code2 size={21} /> Syntax</h2>
            <pre className="mt-5 overflow-x-auto rounded-2xl bg-slate-900 p-5 text-sm leading-7 text-emerald-200"><code>{lesson.syntax}</code></pre>
          </article>
          <article className="rounded-3xl border border-blue-100 bg-white p-6 shadow-lg sm:p-8">
            <h2 className="text-xl font-bold text-blue-800">Practical example</h2>
            <pre className="mt-5 overflow-x-auto rounded-2xl bg-blue-50 p-5 text-sm leading-7 text-blue-950"><code>{lesson.example}</code></pre>
          </article>
        </section>

        <InfoSection title="Memory trick" icon={<Lightbulb size={22} />} tone="amber">
          <p className="font-semibold leading-8 text-gray-800">{lesson.memoryTrick}</p>
        </InfoSection>

        <section className="grid gap-6 lg:grid-cols-2">
          <ListSection title="When to use it" items={lesson.whenToUse} className="border-emerald-100 bg-emerald-50/70" />
          <ListSection title="Common mistakes" items={lesson.commonMistakes} className="border-rose-100 bg-rose-50/70" icon={<TriangleAlert size={21} />} />
        </section>

        <InfoSection title="Interview questions" icon={<MessageSquareText size={22} />} tone="blue">
          <ul className="space-y-3 text-gray-800">{lesson.interviewQuestions.map((question) => <li key={question} className="rounded-2xl bg-blue-50 p-4">• {question}</li>)}</ul>
        </InfoSection>

        <section className="rounded-3xl border border-amber-100 bg-white p-6 shadow-lg sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-800"><NotebookPen size={19} /> Personal notes</p>
              <h2 className="mt-1 text-2xl font-bold text-gray-950">Remember it your way</h2>
            </div>
            <p className="text-sm font-semibold text-gray-600" aria-live="polite">{notesSaved ? "Saved locally" : "Saving…"}</p>
          </div>
          <textarea value={notes} onChange={(event) => { setNotes(event.target.value); setNotesSaved(false); }} rows={6} placeholder="Write examples, questions, or a memory trick…" className="mt-5 w-full rounded-2xl border border-amber-200 bg-amber-50/50 p-4 leading-7 text-gray-950 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200" />
        </section>

        {lesson.relatedLessons.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-950">Related lessons</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {lesson.relatedLessons.map((id) => {
                const related = getSQLLesson(id);
                return related ? <Link key={id} href={`/sql-studio/${id}`} onClick={playClickSound} className="rounded-xl border border-purple-200 bg-white px-4 py-3 font-bold text-purple-800 shadow-sm hover:bg-purple-50">{related.icon} {related.title}</Link> : null;
              })}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-4 rounded-3xl border border-purple-100 bg-white p-6 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-950">Ready to apply it?</h2>
            <p className="mt-2 text-gray-700">Practice the query, then mark the lesson learned for {lesson.xpReward} XP.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/sql-studio/${lesson.id}/practice`} onClick={playClickSound} className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800">Practice</Link>
            <button type="button" onClick={markLearned} disabled={completed} className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-100 disabled:text-emerald-800">{completed ? "Learned" : `Mark Learned · +${lesson.xpReward} XP`}</button>
          </div>
        </section>
      </div>

      <CompletionModal isOpen={showCompletion} projectTitle={`${lesson.title} SQL lesson`} xpEarned={lesson.xpReward} onClose={() => setShowCompletion(false)} onContinue={() => { setShowCompletion(false); router.push(`/sql-studio/${lesson.id}/practice`); }} />
    </AppLayout>
  );
}

function InfoSection({ title, icon, tone, children }: { title: string; icon: React.ReactNode; tone: "purple" | "amber" | "blue"; children: React.ReactNode }) {
  const colors = tone === "purple" ? "border-purple-100 bg-purple-50/60 text-purple-800" : tone === "amber" ? "border-amber-100 bg-amber-50/60 text-amber-800" : "border-blue-100 bg-white text-blue-800";
  return <section className={`rounded-3xl border p-6 shadow-md sm:p-8 ${colors}`}><h2 className="flex items-center gap-2 text-2xl font-bold">{icon}{title}</h2><div className="mt-4">{children}</div></section>;
}

function ListSection({ title, items, className, icon }: { title: string; items: string[]; className: string; icon?: React.ReactNode }) {
  return <article className={`rounded-3xl border p-6 shadow-md sm:p-8 ${className}`}><h2 className="flex items-center gap-2 text-2xl font-bold text-gray-950">{icon}{title}</h2><ul className="mt-5 space-y-3 text-gray-800">{items.map((item) => <li key={item} className="rounded-2xl bg-white/80 p-4">• {item}</li>)}</ul></article>;
}
