"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, Heart, Sparkles } from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import { useProgress } from "@/context/ProgressContext";
import { certificationRoadmapStages, type CertificationDefinition } from "@/lib/certificationData";
import {
  addCatalogCertificationToTracker,
  CERTIFICATION_HUB_EVENT,
  getCertificationChecklist,
  getCertificationProgress,
  saveCertificationNote,
  toggleCertificationFavorite,
  toggleCertificationPreparationStep,
} from "@/lib/certificationHub";
import { loadCareerHubState, type CareerHubState } from "@/lib/careerHub";
import { playClickSound, playSuccessSound, playXPSound } from "@/lib/sounds";
import { incrementStats } from "@/lib/stats";
import { registerStudyDay } from "@/lib/streak";

const focusClass = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2";

export default function CertificationDetail({ certification }: { certification: CertificationDefinition }) {
  const { addXP } = useProgress();
  const [state, setState] = useState<CareerHubState | null>(null);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const sync = useCallback(() => {
    const current = loadCareerHubState();
    setState(current);
    setNote(current.certificationNotes[certification.id] ?? "");
  }, [certification.id]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(sync);
    window.addEventListener(CERTIFICATION_HUB_EVENT, sync);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener(CERTIFICATION_HUB_EVENT, sync);
    };
  }, [sync]);

  if (!state) {
    return <AppLayout><div className="grid min-h-[50vh] place-items-center rounded-[2rem] bg-white/70 font-black text-purple-800">Loading preparation guide…</div></AppLayout>;
  }

  const progress = getCertificationProgress(certification.id, certification, state);
  const checklist = getCertificationChecklist(certification);
  const completed = new Set(state.certificationChecklist[certification.id] ?? []);
  const favorite = state.certificationFavoriteIds.includes(certification.id);
  const tracked = state.certifications.find((item) => item.catalogId === certification.id);

  function awardXP(amount: number) {
    if (!amount) return;
    addXP(amount);
    incrementStats(1, 1, amount, 0);
    registerStudyDay();
    playXPSound();
  }

  function addToTracker() {
    playClickSound();
    const result = addCatalogCertificationToTracker(certification);
    if (result.existing) {
      setMessage("Already in your tracker.");
      return;
    }
    if (result.saved) {
      awardXP(result.xpAward);
      playSuccessSound();
      setState(result.state);
      setMessage(result.xpAward ? `Added to tracker · +${result.xpAward} XP earned once.` : "Added to tracker.");
    }
  }

  function toggleStep(stepId: string) {
    playClickSound();
    const result = toggleCertificationPreparationStep(certification.id, stepId);
    setState(result.state);
    if (result.xpAward) {
      awardXP(result.xpAward);
      playSuccessSound();
      setMessage(`Preparation roadmap completed · +${result.xpAward} XP earned once.`);
    }
  }

  function handleFavorite() {
    playClickSound();
    setState(toggleCertificationFavorite(certification.id));
  }

  function handleNote(value: string) {
    setNote(value);
    setState(saveCertificationNote(certification.id, value));
    setMessage("Personal notes saved on this device.");
  }

  return (
    <AppLayout>
      <div className="min-w-0 space-y-7 overflow-x-hidden text-slate-900">
        <Link href="/certification-hub" onClick={playClickSound} className={`inline-flex min-h-11 items-center gap-2 rounded-2xl border border-purple-200 bg-white/80 px-4 font-black text-purple-800 shadow-sm ${focusClass}`}><ArrowLeft size={17} /> Certification Hub</Link>

        <header className="relative overflow-hidden rounded-[2.25rem] border border-white/90 bg-gradient-to-br from-pink-100 via-purple-100 to-sky-100 p-6 shadow-[0_24px_70px_rgba(88,28,135,0.14)] sm:p-9">
          <div aria-hidden="true" className="absolute -right-20 -top-20 size-72 rounded-full bg-white/60 blur-3xl" />
          <div className="relative grid gap-7 xl:grid-cols-[1fr_auto] xl:items-end">
            <div><div className="flex flex-wrap gap-2"><Badge>{certification.provider}</Badge><Badge>{certification.skillArea}</Badge><Badge>{certification.difficulty}</Badge><Badge>{certification.preparationLevel}</Badge></div><h1 className="mt-5 text-4xl font-black tracking-tight text-purple-950 sm:text-5xl">{certification.name}</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">{certification.summary}</p></div>
            <div className="flex flex-col gap-3 sm:flex-row xl:flex-col"><button type="button" onClick={handleFavorite} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-pink-200 bg-pink-50 px-5 font-black text-pink-800 transition hover:bg-pink-100 ${focusClass}`}><Heart size={18} fill={favorite ? "currentColor" : "none"} /> {favorite ? "Favorited" : "Favorite"}</button><button type="button" onClick={addToTracker} disabled={Boolean(tracked)} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-purple-700 px-5 font-black text-white shadow-md transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-slate-300 ${focusClass}`}>{tracked ? "Added to tracker" : "Add to tracker"} <ArrowRight size={17} /></button><a href={certification.officialLink} target="_blank" rel="noreferrer" className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-5 font-black text-sky-800 ${focusClass}`}>Official provider page <ExternalLink size={16} /></a></div>
          </div>
          <p className="relative mt-5 text-sm font-semibold text-amber-900">Verify current exam availability, requirements, policies, and costs with the provider.</p>
        </header>

        <p className="sr-only" aria-live="polite">{message}</p>

        <section className="grid gap-5 lg:grid-cols-3">
          <ContentCard title="Overview" icon="🌸"><p>{certification.summary}</p></ContentCard>
          <ContentCard title="Who it is for" icon="🎯"><p>{certification.whoFor}</p></ContentCard>
          <ContentCard title="Prerequisites" icon="🧱"><BulletList items={certification.prerequisites} /></ContentCard>
        </section>

        <section aria-labelledby="readiness-heading" className="rounded-[2rem] border border-white/90 bg-white/80 p-6 shadow-lg backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-black uppercase tracking-[0.16em] text-purple-700">Honest readiness</p><h2 id="readiness-heading" className="mt-1 text-3xl font-black text-slate-950">{progress.percentage}% prepared</h2><p className="mt-2 text-slate-600">Only the checklist below changes this score.</p></div><p className="rounded-2xl bg-purple-50 px-4 py-3 font-black text-purple-800">{progress.completed} of {progress.total} steps complete</p></div>
          <div className="mt-5 h-4 overflow-hidden rounded-full bg-purple-100" role="progressbar" aria-label={`${certification.name} preparation progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percentage}><div className="h-full rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-sky-500 transition-[width] motion-reduce:transition-none" style={{ width: `${progress.percentage}%` }} /></div>
        </section>

        <section aria-labelledby="skills-heading"><SectionHeading eyebrow="Skills tested" title="Knowledge and workflows to practise" id="skills-heading" /><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{certification.skills.map((skill) => <div key={skill} className="flex items-center gap-3 rounded-2xl border border-white/90 bg-white/75 p-4 font-black text-slate-800 shadow-sm"><CheckCircle2 size={18} className="shrink-0 text-emerald-600" />{skill}</div>)}</div></section>

        <section aria-labelledby="roadmap-heading"><SectionHeading eyebrow="Suggested preparation roadmap" title="Seven reusable stages" id="roadmap-heading" /><div className="mt-5 grid gap-4 lg:grid-cols-2">{certificationRoadmapStages.map((stage, index) => { const id = `roadmap:${stage.id}`; const checked = completed.has(id); return <label key={stage.id} className={`flex cursor-pointer items-start gap-4 rounded-[1.75rem] border p-5 shadow-sm transition ${checked ? "border-emerald-200 bg-emerald-50/85" : "border-purple-100 bg-white/80 hover:border-purple-300"}`}><input type="checkbox" checked={checked} onChange={() => toggleStep(id)} className="mt-1 size-5 accent-emerald-600" /><span><span className="text-xs font-black uppercase tracking-wider text-purple-700">Stage {index + 1}</span><span className={`mt-1 block text-lg font-black ${checked ? "text-emerald-900" : "text-slate-950"}`}>{stage.title}</span><span className="mt-2 block text-sm leading-6 text-slate-600">{stage.guidance}</span>{checked ? <span className="mt-2 block text-xs font-black text-emerald-700">Completed</span> : null}</span></label>; })}</div></section>

        <section className="grid gap-6 lg:grid-cols-2">
          <ContentCard title="Recommended lessons and Studios" icon="📚"><div className="flex flex-wrap gap-3">{certification.studioLinks.map((studio) => <Link key={studio.href} href={studio.href} onClick={playClickSound} className={`inline-flex min-h-11 items-center gap-2 rounded-2xl border border-purple-200 bg-purple-50 px-4 font-black text-purple-800 transition hover:bg-purple-100 ${focusClass}`}>{studio.label}<ArrowRight size={15} /></Link>)}</div></ContentCard>
          <ContentCard title="Portfolio projects to complete first" icon="🗂️"><BulletList items={certification.projects} /></ContentCard>
        </section>

        <section aria-labelledby="practice-heading"><SectionHeading eyebrow="Practice checklist" title="Prove the skill before the credential" id="practice-heading" /><div className="mt-5 grid gap-4 lg:grid-cols-3">{checklist.filter((item) => item.kind === "practice").map((item) => { const checked = completed.has(item.id); return <label key={item.id} className={`flex cursor-pointer items-start gap-3 rounded-[1.75rem] border p-5 shadow-sm ${checked ? "border-emerald-200 bg-emerald-50" : "border-sky-100 bg-white/80"}`}><input type="checkbox" checked={checked} onChange={() => toggleStep(item.id)} className="mt-1 size-5 accent-emerald-600" /><span><span className="font-black text-slate-950">{item.label}</span><span className="mt-2 block text-sm leading-6 text-slate-600">{item.guidance}</span></span></label>; })}</div></section>

        <section aria-labelledby="notes-heading" className="rounded-[2rem] border border-purple-100 bg-gradient-to-br from-white/85 to-purple-50/75 p-6 shadow-lg sm:p-8"><div className="flex items-center gap-3"><Sparkles size={20} className="text-purple-700" /><div><h2 id="notes-heading" className="text-2xl font-black text-purple-900">Personal notes</h2><p className="text-sm text-slate-600">Saved automatically on this device.</p></div></div><label className="mt-5 block"><span className="sr-only">Personal certification notes</span><textarea rows={7} value={note} onChange={(event) => handleNote(event.target.value)} placeholder="Weak areas, official-outline notes, mock-test results, or reminders…" className="w-full rounded-3xl border border-purple-200 bg-white/80 p-4 text-slate-900 outline-none placeholder:text-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-200" /></label></section>
      </div>
    </AppLayout>
  );
}

function Badge({ children }: { children: React.ReactNode }) { return <span className="rounded-full border border-white/90 bg-white/80 px-3 py-1 text-xs font-black text-purple-800 shadow-sm">{children}</span>; }
function SectionHeading({ eyebrow, title, id }: { eyebrow: string; title: string; id: string }) { return <div><p className="text-sm font-black uppercase tracking-[0.16em] text-purple-700">{eyebrow}</p><h2 id={id} className="mt-1 text-3xl font-black text-slate-950">{title}</h2></div>; }
function ContentCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) { return <article className="rounded-[1.75rem] border border-white/90 bg-white/75 p-5 leading-7 text-slate-700 shadow-md backdrop-blur-xl sm:p-6"><span className="text-3xl" aria-hidden="true">{icon}</span><h2 className="mt-3 text-xl font-black text-purple-900">{title}</h2><div className="mt-3">{children}</div></article>; }
function BulletList({ items }: { items: string[] }) { return <ul className="space-y-2">{items.map((item) => <li key={item} className="flex items-start gap-2"><CheckCircle2 size={17} className="mt-1 shrink-0 text-emerald-600" /><span>{item}</span></li>)}</ul>; }
