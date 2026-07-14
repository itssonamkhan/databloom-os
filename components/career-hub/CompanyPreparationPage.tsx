"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Heart, Save, Sparkles, Zap } from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import { useProgress } from "@/context/ProgressContext";
import {
  CAREER_HUB_EVENT,
  loadCareerHubState,
  saveCompanyNote,
  toggleCareerCompletion,
  toggleFavoriteCompany,
  type CareerHubState,
} from "@/lib/careerHub";
import { applicationChecklist, type Company } from "@/lib/careerHubData";
import { playClickSound, playSuccessSound, playXPSound } from "@/lib/sounds";
import { incrementStats } from "@/lib/stats";
import { registerStudyDay } from "@/lib/streak";

const emptyState: CareerHubState = { version: 1, completedIds: [], rewardedIds: [], applications: [], certifications: [], favoriteCompanyIds: [], companyNotes: {}, lastSection: "home" };

export default function CompanyPreparationPage({ company }: { company: Company }) {
  const { addXP } = useProgress();
  const [state, setState] = useState<CareerHubState>(emptyState);
  const [note, setNote] = useState("");
  const [noteStatus, setNoteStatus] = useState("");

  useEffect(() => {
    const sync = () => {
      const saved = loadCareerHubState();
      setState(saved);
      setNote(saved.companyNotes[company.slug] ?? "");
    };
    const frame = window.requestAnimationFrame(sync);
    window.addEventListener(CAREER_HUB_EVENT, sync);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener(CAREER_HUB_EVENT, sync); };
  }, [company.slug]);

  function toggleCheck(index: number) {
    playClickSound();
    const result = toggleCareerCompletion(`company:${company.slug}:${index + 1}`);
    setState(result.state);
    if (result.xpAward) {
      addXP(result.xpAward);
      incrementStats(1, 1, result.xpAward, 0);
      registerStudyDay();
      playXPSound();
    }
  }

  const favorite = state.favoriteCompanyIds.includes(company.slug);
  return <AppLayout><div className="space-y-7 text-slate-950">
    <Link href="/career-hub" onClick={playClickSound} className="inline-flex items-center gap-2 font-black text-purple-800"><ArrowLeft size={18} /> Back to Career Hub</Link>
    <header className="rounded-[2rem] border border-white bg-gradient-to-br from-purple-100 via-pink-100 to-sky-100 p-7 shadow-lg sm:p-10"><div className="flex items-start justify-between gap-5"><div><p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-black text-purple-800"><Sparkles size={16} /> Company preparation guide</p><h1 className="mt-5 text-4xl font-black sm:text-5xl">🏢 {company.name}</h1><p className="mt-2 font-bold text-purple-700">{company.type}</p><p className="mt-4 max-w-4xl text-lg leading-8 text-slate-700">{company.overview}</p></div><button type="button" onClick={() => { playClickSound(); setState(toggleFavoriteCompany(company.slug)); }} aria-pressed={favorite} aria-label={favorite ? `Remove ${company.name} from favorites` : `Save ${company.name} to favorites`} className={`grid size-12 shrink-0 place-items-center rounded-2xl border ${favorite ? "border-pink-300 bg-pink-100 text-pink-700" : "border-white bg-white/80 text-slate-500"}`}><Heart size={21} fill={favorite ? "currentColor" : "none"} /></button></div></header>

    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <InfoPanel title="Common analytics roles" items={company.roles} />
      <InfoPanel title="Skills typically expected" items={company.skills} />
      <InfoPanel title="Suggested DataBloom path" items={company.learningPath} />
      <InfoPanel title="Portfolio ideas" items={company.portfolioIdeas} />
      <InfoPanel title="Interview preparation" items={company.interviewTopics} />
      <article className="rounded-3xl border border-purple-100 bg-white p-6 shadow-md"><h2 className="text-2xl font-black">Practice tools</h2><div className="mt-5 space-y-3"><Link href="/interview-hub" onClick={playClickSound} className="flex items-center justify-between rounded-2xl bg-purple-50 p-4 font-black text-purple-800">Interview Hub <ExternalLink size={17} /></Link><Link href="/practice-lab" onClick={playClickSound} className="flex items-center justify-between rounded-2xl bg-fuchsia-50 p-4 font-black text-fuchsia-800">Practice Lab <ExternalLink size={17} /></Link></div></article>
    </div>

    <section className="rounded-[2rem] border border-emerald-100 bg-white/85 p-6 shadow-lg sm:p-8"><h2 className="text-3xl font-black">Application checklist</h2><p className="mt-2 text-slate-700">Complete stable preparation steps. Each awards 10 XP once.</p><div className="mt-6 grid gap-3 md:grid-cols-2">{applicationChecklist.map((label, index) => { const id = `company:${company.slug}:${index + 1}`; const checked = state.completedIds.includes(id); return <label key={id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${checked ? "border-emerald-200 bg-emerald-50" : "border-slate-200"}`}><input type="checkbox" checked={checked} onChange={() => toggleCheck(index)} className="mt-1 size-4 accent-emerald-600" /><span><span className={checked ? "text-slate-500 line-through" : "font-semibold"}>{label}</span><span className="mt-1 flex items-center gap-1 text-xs font-black text-amber-700"><Zap size={13} /> +10 XP once</span></span></label>; })}</div></section>

    <section className="rounded-[2rem] border border-pink-100 bg-white/85 p-6 shadow-lg"><label><span className="text-2xl font-black">Personal preparation notes</span><textarea rows={6} value={note} onChange={(event) => { setNote(event.target.value); setNoteStatus(""); }} placeholder={`Save research questions and preparation notes for ${company.name}…`} className="mt-4 w-full rounded-2xl border border-slate-300 p-4" /></label><button type="button" onClick={() => { saveCompanyNote(company.slug, note); playSuccessSound(); setNoteStatus("Note saved on this device."); }} className="mt-3 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-purple-700 px-5 font-black text-white"><Save size={18} /> Save note</button><p className="mt-2 min-h-5 text-sm font-bold text-emerald-700" aria-live="polite">{noteStatus}</p></section>
  </div></AppLayout>;
}

function InfoPanel({ title, items }: { title: string; items: string[] }) { return <article className="rounded-3xl border border-purple-100 bg-white p-6 shadow-md"><h2 className="text-2xl font-black">{title}</h2><ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">{items.map((item) => <li key={item} className="leading-6">{item}</li>)}</ul></article>; }
