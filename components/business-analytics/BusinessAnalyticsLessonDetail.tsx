"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Calculator, CheckCircle2, Heart, Lightbulb, NotebookPen, TriangleAlert } from "lucide-react";

import CompletionModal from "@/components/dashboard/CompletionModal";
import AppLayout from "@/components/layout/AppLayout";
import { useProgress } from "@/context/ProgressContext";
import { getBusinessAnalyticsLesson, getNextBusinessAnalyticsLesson, type BusinessAnalyticsLesson } from "@/lib/businessAnalyticsLessons";
import { BUSINESS_ANALYTICS_PROGRESS_EVENT, completeBusinessAnalyticsLesson, getBusinessAnalyticsNote, loadBusinessAnalyticsProgress, saveBusinessAnalyticsNote, toggleBusinessAnalyticsFavorite } from "@/lib/businessAnalyticsProgress";
import { playClickSound, playNotificationSound, playXPSound } from "@/lib/sounds";

type NotesStatus = "saved" | "saving" | "error";

export default function BusinessAnalyticsLessonDetail({ lesson }: { lesson: BusinessAnalyticsLesson }) {
  const router = useRouter();
  const { addXP } = useProgress();
  const initialProgress = loadBusinessAnalyticsProgress();
  const nextLesson = getNextBusinessAnalyticsLesson(lesson.id);
  const [completed, setCompleted] = useState(() => initialProgress.completedLessonIds.includes(lesson.id));
  const [favorite, setFavorite] = useState(() => initialProgress.favoriteLessonIds.includes(lesson.id));
  const [notes, setNotes] = useState(() => getBusinessAnalyticsNote(lesson.id));
  const [notesStatus, setNotesStatus] = useState<NotesStatus>("saved");
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    const syncProgress = () => {
      const state = loadBusinessAnalyticsProgress();
      setCompleted(state.completedLessonIds.includes(lesson.id));
      setFavorite(state.favoriteLessonIds.includes(lesson.id));
    };
    window.addEventListener(BUSINESS_ANALYTICS_PROGRESS_EVENT, syncProgress);
    window.addEventListener("storage", syncProgress);
    return () => {
      window.removeEventListener(BUSINESS_ANALYTICS_PROGRESS_EVENT, syncProgress);
      window.removeEventListener("storage", syncProgress);
    };
  }, [lesson.id]);

  useEffect(() => {
    if (notesStatus !== "saving") return;
    const timer = window.setTimeout(() => {
      setNotesStatus(saveBusinessAnalyticsNote(lesson.id, notes) ? "saved" : "error");
    }, 450);
    return () => window.clearTimeout(timer);
  }, [lesson.id, notes, notesStatus]);

  function handleFavorite() {
    playClickSound();
    const next = toggleBusinessAnalyticsFavorite(lesson.id);
    const nextFavorite = next.favoriteLessonIds.includes(lesson.id);
    setFavorite(nextFavorite);
    if (nextFavorite) playNotificationSound();
  }

  function markLearned() {
    playClickSound();
    const result = completeBusinessAnalyticsLesson(lesson.id);
    setCompleted(result.state.completedLessonIds.includes(lesson.id));
    if (!result.newlyCompleted) return;
    addXP(lesson.xpReward);
    playXPSound();
    setShowCompletion(true);
  }

  return (
    <AppLayout>
      <div className="space-y-7 text-slate-950">
        <Link href="/business-analytics-studio" onClick={playClickSound} className="inline-flex items-center gap-2 font-bold text-indigo-800 transition hover:text-indigo-950"><ArrowLeft size={18} aria-hidden="true" /> Back to Business Analytics Studio</Link>
        <header className="rounded-3xl border border-white/70 bg-gradient-to-br from-indigo-100 via-pink-100 to-amber-100 p-7 shadow-lg sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <span className="text-5xl" aria-hidden="true">{lesson.icon}</span>
              <h1 className="mt-4 text-4xl font-black sm:text-5xl">{lesson.title}</h1>
              <p className="mt-4 text-lg leading-8 text-slate-700">{lesson.description}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
                <Badge tone="indigo">{lesson.category}</Badge><Badge tone="amber">{lesson.difficulty}</Badge><Badge tone="green">+{lesson.xpReward} XP</Badge>
                {completed ? <Badge tone="green"><CheckCircle2 className="mr-1 inline" size={16} aria-hidden="true" /> Learned</Badge> : null}
              </div>
            </div>
            <button type="button" onClick={handleFavorite} aria-pressed={favorite} className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 font-bold transition ${favorite ? "border-pink-300 bg-pink-100 text-pink-800" : "border-indigo-200 bg-white text-slate-800 hover:bg-indigo-50"}`}><Heart size={19} fill={favorite ? "currentColor" : "none"} aria-hidden="true" />{favorite ? "Favorited" : "Favorite"}</button>
          </div>
        </header>

        <InfoSection title="Simple explanation" icon={<Lightbulb size={22} />} tone="indigo"><p className="leading-8 text-slate-700">{lesson.explanation}</p></InfoSection>
        <InfoSection title="Why it matters" icon={<span aria-hidden="true">💡</span>} tone="amber"><p className="font-semibold leading-8 text-slate-800">{lesson.whyItMatters}</p></InfoSection>
        <section className="grid gap-6 lg:grid-cols-2"><ListSection title="When to use it" items={lesson.whenToUse} /><ListSection title="Common mistakes" items={lesson.commonMistakes} warning /></section>
        <InfoSection title="Step-by-step framework" icon={<span aria-hidden="true">🪜</span>} tone="indigo">
          <ol className="space-y-3">{lesson.steps.map((step, index) => <li key={step} className="rounded-2xl bg-indigo-50 p-4 leading-7 text-slate-800"><strong className="text-indigo-800">{index + 1}.</strong> {step}</li>)}</ol>
        </InfoSection>
        <InfoSection title="Business example" icon={<span aria-hidden="true">🏢</span>} tone="amber"><p className="leading-8 text-slate-800">{lesson.businessExample}</p></InfoSection>
        {lesson.formula ? <InfoSection title="Formula or calculation" icon={<Calculator size={22} />} tone="indigo"><pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-5 font-mono text-sm leading-7 text-emerald-200"><code>{lesson.formula}</code></pre></InfoSection> : null}
        <InfoSection title="Interview tip" icon={<span aria-hidden="true">🎤</span>} tone="amber"><p className="font-semibold leading-8 text-slate-800">{lesson.interviewTip}</p></InfoSection>

        <section className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-lg sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-indigo-700"><NotebookPen size={19} aria-hidden="true" /> Personal notes</p><h2 className="mt-1 text-2xl font-black">Remember it your way</h2></div><p className="text-sm font-semibold text-slate-600" aria-live="polite">{notesStatus === "saved" ? "Saved locally" : notesStatus === "saving" ? "Saving…" : "Couldn’t save locally"}</p></div>
          <textarea value={notes} onChange={(event) => { setNotes(event.target.value); setNotesStatus("saving"); }} rows={6} placeholder="Write your metric definition, business assumption, or interview note…" className="mt-5 w-full rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 leading-7 outline-none placeholder:text-slate-500 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200" />
        </section>

        {lesson.relatedLessonIds.length > 0 ? <section><h2 className="text-2xl font-black">Related lessons</h2><div className="mt-4 flex flex-wrap gap-3">{lesson.relatedLessonIds.map((id) => { const related = getBusinessAnalyticsLesson(id); return related ? <Link key={id} href={`/business-analytics-studio/${id}`} onClick={playClickSound} className="rounded-xl border border-indigo-200 bg-white px-4 py-3 font-bold text-indigo-900 shadow-sm transition hover:bg-indigo-50">{related.icon} {related.title}</Link> : null; })}</div></section> : null}

        <section className="flex flex-col gap-4 rounded-3xl border border-indigo-100 bg-white p-6 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div><h2 className="text-2xl font-black">Ready to apply it?</h2><p className="mt-2 text-slate-700">Solve the business case, then mark this lesson learned for {lesson.xpReward} XP.</p></div>
          <div className="flex flex-wrap gap-3"><Link href={`/business-analytics-studio/${lesson.id}/practice`} onClick={playClickSound} className="rounded-xl bg-amber-600 px-5 py-3 font-bold text-white transition hover:bg-amber-700">Practice</Link><button type="button" onClick={markLearned} disabled={completed} className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-100 disabled:text-emerald-800">{completed ? "Learned" : `Mark Learned · +${lesson.xpReward} XP`}</button></div>
        </section>
        {nextLesson ? <div className="flex justify-end"><Link href={`/business-analytics-studio/${nextLesson.id}`} onClick={playClickSound} className="inline-flex items-center gap-2 rounded-xl bg-indigo-700 px-5 py-3 font-bold text-white transition hover:bg-indigo-800">Next: {nextLesson.title} <ArrowRight size={18} aria-hidden="true" /></Link></div> : null}
      </div>
      <CompletionModal isOpen={showCompletion} projectTitle={`${lesson.title} Business Analytics lesson`} xpEarned={lesson.xpReward} celebrationLabel="Business Analytics lesson learned" description={<>You learned <span className="font-bold text-slate-950">{lesson.title}</span>. Your decision skills are blooming.</>} continueLabel="Open practice" onClose={() => setShowCompletion(false)} onContinue={() => { setShowCompletion(false); router.push(`/business-analytics-studio/${lesson.id}/practice`); }} />
    </AppLayout>
  );
}

function Badge({ tone, children }: { tone: "indigo" | "amber" | "green"; children: React.ReactNode }) {
  const colors = tone === "indigo" ? "text-indigo-900" : tone === "amber" ? "text-amber-900" : "text-emerald-800";
  return <span className={`rounded-full bg-white/85 px-4 py-2 ${colors}`}>{children}</span>;
}

function InfoSection({ title, icon, tone, children }: { title: string; icon: React.ReactNode; tone: "indigo" | "amber"; children: React.ReactNode }) {
  return <section className={`rounded-3xl border p-6 shadow-md sm:p-8 ${tone === "indigo" ? "border-indigo-100 bg-white" : "border-amber-100 bg-amber-50/60"}`}><h2 className={`flex items-center gap-2 text-2xl font-black ${tone === "indigo" ? "text-indigo-900" : "text-amber-900"}`}>{icon} {title}</h2><div className="mt-4">{children}</div></section>;
}

function ListSection({ title, items, warning = false }: { title: string; items: string[]; warning?: boolean }) {
  return <section className={`rounded-3xl border p-6 shadow-md sm:p-8 ${warning ? "border-rose-100 bg-rose-50/60" : "border-emerald-100 bg-emerald-50/60"}`}><h2 className="flex items-center gap-2 text-2xl font-black">{warning ? <TriangleAlert size={22} className="text-rose-600" aria-hidden="true" /> : <CheckCircle2 size={22} className="text-emerald-600" aria-hidden="true" />}{title}</h2><ul className="mt-4 space-y-3">{items.map((item) => <li key={item} className="rounded-2xl bg-white/80 p-4 leading-7 text-slate-800">• {item}</li>)}</ul></section>;
}
