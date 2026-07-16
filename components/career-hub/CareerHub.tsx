"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Edit3,
  ExternalLink,
  Heart,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import { useProgress } from "@/context/ProgressContext";
import {
  CAREER_HUB_EVENT,
  certificationStatuses,
  deleteApplication,
  deleteCertification,
  getCareerSummary,
  getRecommendedCareerAction,
  internshipStatuses,
  jobStatuses,
  loadCareerHubState,
  saveApplication,
  saveCertification,
  setCareerSection,
  toggleCareerCompletion,
  type ApplicationInput,
  type ApplicationKind,
  type ApplicationRecord,
  type CareerHubState,
  type CertificationInput,
  type CertificationRecord,
} from "@/lib/careerHub";
import {
  careerChecklistCategories,
  careerChecklistItems,
  careerGuides,
  careerRoadmaps,
  careerSectionMeta,
  careerSections,
  companies,
  type CareerSection,
  type Guide,
} from "@/lib/careerHubData";
import { playClickSound, playSuccessSound, playXPSound } from "@/lib/sounds";
import { incrementStats } from "@/lib/stats";
import { registerStudyDay } from "@/lib/streak";
import { loadUserPreferences, type UserPreferences } from "@/lib/userPreferences";

function emptyState(): CareerHubState {
  return { version: 1, completedIds: [], rewardedIds: [], applications: [], certifications: [], certificationFavoriteIds: [], certificationNotes: {}, certificationChecklist: {}, certificationRewardedMilestones: [], favoriteCompanyIds: [], companyNotes: {}, lastSection: "home" };
}

export default function CareerHub() {
  const { addXP } = useProgress();
  const [state, setState] = useState<CareerHubState>(emptyState);
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadUserPreferences());
  const [section, setSection] = useState<CareerSection>("home");
  const [roadmapId, setRoadmapId] = useState(careerRoadmaps[0].id);
  const [companyQuery, setCompanyQuery] = useState("");

  function sync() {
    setState(loadCareerHubState());
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setState(loadCareerHubState());
      setPreferences(loadUserPreferences());
    });
    window.addEventListener(CAREER_HUB_EVENT, sync);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener(CAREER_HUB_EVENT, sync);
    };
  }, []);

  function navigate(next: CareerSection) {
    playClickSound();
    setSection(next);
    if (next !== "home") setState(setCareerSection(next));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleCompletion(id: string) {
    playClickSound();
    const result = toggleCareerCompletion(id);
    setState(result.state);
    if (result.xpAward) {
      addXP(result.xpAward);
      incrementStats(1, 1, result.xpAward, 0);
      registerStudyDay();
      playXPSound();
    }
  }

  function awardCertificationXP(amount: number) {
    if (!amount) return;
    addXP(amount);
    incrementStats(1, 1, amount, 0);
    registerStudyDay();
    playXPSound();
  }

  const summary = getCareerSummary(state);
  const recommended = getRecommendedCareerAction(state);
  const roadmap = careerRoadmaps.find((item) => item.id === roadmapId) ?? careerRoadmaps[0];
  const filteredCompanies = companies.filter((company) => `${company.name} ${company.type}`.toLowerCase().includes(companyQuery.trim().toLowerCase()));

  return (
    <AppLayout>
      <div className="space-y-7 text-slate-950">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-gradient-to-br from-purple-100 via-pink-100 to-sky-100 p-7 shadow-lg sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-white/50 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-purple-800 shadow-sm"><Sparkles size={17} /> Career preparation from learning to application</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-purple-900 sm:text-5xl">🌱 Career Hub</h1>
              <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-slate-700 sm:text-lg">Build job-ready proof, organize applications, and move toward your next role with an honest checklist.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-3xl border border-white bg-white/75 p-4 shadow-sm sm:grid-cols-4">
              <HeaderStat value={`${summary.readiness}%`} label="Ready" />
              <HeaderStat value={summary.completedTasks} label="Tasks" />
              <HeaderStat value={summary.applications} label="Applications" />
              <HeaderStat value={summary.completedCertifications} label="Certificates" />
            </div>
          </div>
        </header>

        <nav aria-label="Career Hub sections" className="flex flex-wrap gap-2 rounded-[2rem] border border-purple-100 bg-white/80 p-3 shadow-md">
          {careerSections.map((item) => (
            <button key={item} type="button" onClick={() => navigate(item)} aria-current={section === item ? "page" : undefined} className={`min-h-11 rounded-2xl px-4 py-2 text-sm font-black transition ${section === item ? "bg-purple-700 text-white shadow-sm" : "text-slate-700 hover:bg-purple-50 hover:text-purple-800"}`}>
              {careerSectionMeta[item].icon} {careerSectionMeta[item].label}
            </button>
          ))}
        </nav>

        {section === "home" ? <CareerHome preferences={preferences} state={state} summary={summary} recommended={recommended} navigate={navigate} /> : null}
        {section === "roadmaps" ? <Roadmaps roadmap={roadmap} roadmapId={roadmapId} setRoadmapId={setRoadmapId} completedIds={state.completedIds} onToggle={toggleCompletion} /> : null}
        {(["resume", "portfolio", "linkedin", "github"] as CareerSection[]).includes(section) ? <GuideView guide={careerGuides.find((guide) => guide.id === section)!} completedIds={state.completedIds} onToggle={toggleCompletion} /> : null}
        {section === "internships" ? <ApplicationTracker kind="internship" state={state} onSync={sync} /> : null}
        {section === "jobs" ? <ApplicationTracker kind="job" state={state} onSync={sync} /> : null}
        {section === "companies" ? <CompanyExplorer query={companyQuery} setQuery={setCompanyQuery} companiesToShow={filteredCompanies} favorites={state.favoriteCompanyIds} /> : null}
        {section === "certifications" ? <CertificationTracker state={state} onSync={sync} onXPAward={awardCertificationXP} /> : null}
        {section === "checklist" ? <CareerChecklist completedIds={state.completedIds} readiness={summary.readiness} onToggle={toggleCompletion} /> : null}
      </div>
    </AppLayout>
  );
}

function CareerHome({ preferences, state, summary, recommended, navigate }: {
  preferences: UserPreferences;
  state: CareerHubState;
  summary: ReturnType<typeof getCareerSummary>;
  recommended: ReturnType<typeof getRecommendedCareerAction>;
  navigate: (section: CareerSection) => void;
}) {
  const name = preferences.userName || "Data learner";
  const continueSection = state.lastSection === "home" ? "roadmaps" : state.lastSection;
  return <div className="space-y-7">
    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <article className="rounded-[2rem] border border-purple-200 bg-gradient-to-br from-white via-purple-50 to-pink-50 p-7 shadow-lg">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-purple-700">Welcome, {name}</p>
        <h2 className="mt-2 text-3xl font-black">Your goal: {preferences.careerGoal}</h2>
        <p className="mt-3 leading-7 text-slate-700">Your readiness score uses only the {summary.careerTotal} explicit Career Checklist items—trackers and browsing never inflate it.</p>
        <div className="mt-6 h-4 overflow-hidden rounded-full bg-purple-100" role="progressbar" aria-label="Overall career readiness" aria-valuemin={0} aria-valuemax={100} aria-valuenow={summary.readiness}><div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500" style={{ width: `${summary.readiness}%` }} /></div>
        <p className="mt-2 font-black text-purple-800">{summary.careerCompleted}/{summary.careerTotal} readiness checks complete · {summary.readiness}%</p>
      </article>
      <article className="rounded-[2rem] border border-amber-200 bg-amber-50/80 p-7 shadow-lg">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-amber-800">Recommended next action</p>
        <h2 className="mt-2 text-2xl font-black">{recommended.label}</h2>
        <p className="mt-2 leading-7 text-slate-700">{recommended.detail}</p>
        <button type="button" onClick={() => navigate(recommended.section)} className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-amber-700 px-5 font-black text-white">Continue <ArrowRight size={18} /></button>
      </article>
    </section>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <ProgressCard icon="🗺️" label="Roadmaps" value={`${summary.roadmapProgress}%`} />
      <ProgressCard icon="📄" label="Resume" value={`${summary.guideProgress.resume}%`} />
      <ProgressCard icon="🖼️" label="Portfolio" value={`${summary.guideProgress.portfolio}%`} />
      <ProgressCard icon="💼" label="LinkedIn" value={`${summary.guideProgress.linkedin}%`} />
      <ProgressCard icon="🐙" label="GitHub" value={`${summary.guideProgress.github}%`} />
    </section>

    <section className="rounded-[2rem] border border-sky-200 bg-white/85 p-6 shadow-lg sm:flex sm:items-center sm:justify-between sm:gap-5">
      <div><p className="text-sm font-black uppercase tracking-wider text-sky-700">Continue where you left off</p><h2 className="mt-1 text-2xl font-black">{careerSectionMeta[continueSection].icon} {careerSectionMeta[continueSection].label}</h2></div>
      <button type="button" onClick={() => navigate(continueSection)} className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-sky-700 px-5 font-black text-white sm:mt-0">Open section <ArrowRight size={18} /></button>
    </section>

    <section>
      <SectionHeading eyebrow="Quick links" title="Prepare every part of your application" description="Jump directly to your core career tools and DataBloom practice." />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <QuickButton icon="📄" label="Resume" onClick={() => navigate("resume")} />
        <QuickButton icon="💼" label="LinkedIn" onClick={() => navigate("linkedin")} />
        <QuickButton icon="🐙" label="GitHub" onClick={() => navigate("github")} />
        <QuickLink icon="🎤" label="Interview Hub" href="/interview-hub" />
        <QuickLink icon="🧩" label="Practice Lab" href="/practice-lab" />
        <QuickLink icon="📝" label="Smart Notes" href="/smart-notes" />
        <QuickLink icon="🧠" label="Flashcards" href="/flashcards" />
        <QuickLink icon="🏅" label="Certification Hub" href="/certification-hub" />
        <QuickLink icon="📊" label="Dashboard Studio" href="/dashboard" />
        <QuickLink icon="🗂️" label="Dataset Library" href="/dataset-library" />
        <QuickLink icon="🗄️" label="SQL Studio" href="/sql-studio" />
        <QuickLink icon="🐍" label="Python Studio" href="/python-studio" />
      </div>
    </section>
  </div>;
}

function Roadmaps({ roadmap, roadmapId, setRoadmapId, completedIds, onToggle }: { roadmap: (typeof careerRoadmaps)[number]; roadmapId: string; setRoadmapId: (id: string) => void; completedIds: string[]; onToggle: (id: string) => void }) {
  const completed = roadmap.steps.filter((step) => completedIds.includes(step.id)).length;
  const percentage = Math.round((completed / roadmap.steps.length) * 100);
  return <section>
    <SectionHeading eyebrow="Career roadmaps" title="Build a role-specific path" description="Every roadmap covers foundations, tools, projects, portfolio proof, interviews, certifications, and job readiness." />
    <div className="mt-5 flex flex-wrap gap-2">{careerRoadmaps.map((item) => <button key={item.id} type="button" onClick={() => { playClickSound(); setRoadmapId(item.id); }} className={`rounded-2xl px-4 py-3 font-black ${roadmapId === item.id ? "bg-purple-700 text-white" : "border border-purple-200 bg-white text-purple-800"}`}>{item.icon} {item.title}</button>)}</div>
    <article className="mt-6 rounded-[2rem] border border-purple-100 bg-white/85 p-6 shadow-lg sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-4xl">{roadmap.icon}</p><h2 className="mt-3 text-3xl font-black">{roadmap.title} roadmap</h2><p className="mt-2 max-w-3xl leading-7 text-slate-700">{roadmap.description}</p></div><p className="text-3xl font-black text-purple-800">{percentage}%</p></div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-purple-100"><div className="h-full bg-gradient-to-r from-purple-600 to-pink-500" style={{ width: `${percentage}%` }} /></div>
      <ol className="mt-6 grid gap-4 lg:grid-cols-2">{roadmap.steps.map((step, index) => { const checked = completedIds.includes(step.id); return <li key={step.id} className={`rounded-3xl border p-5 ${checked ? "border-emerald-200 bg-emerald-50" : "border-purple-100 bg-purple-50/40"}`}><label className="flex cursor-pointer items-start gap-4"><input type="checkbox" checked={checked} onChange={() => onToggle(step.id)} className="mt-1 size-5 accent-emerald-600" /><span><span className="text-sm font-black uppercase tracking-wider text-purple-700">{index + 1}. {step.stage}</span><span className="mt-1 block text-xl font-black">{step.title}</span><span className="mt-2 block leading-7 text-slate-700">{step.detail}</span><span className="mt-2 block text-sm font-black text-amber-700">+10 XP first completion</span></span></label></li>; })}</ol>
    </article>
  </section>;
}

function GuideView({ guide, completedIds, onToggle }: { guide: Guide; completedIds: string[]; onToggle: (id: string) => void }) {
  const completed = guide.checklist.filter((item) => completedIds.includes(item.id)).length;
  const score = Math.round((completed / guide.checklist.length) * 100);
  return <section className="space-y-6">
    <header className="rounded-[2rem] border border-white bg-gradient-to-br from-purple-100 via-white to-pink-100 p-7 shadow-lg"><p className="text-5xl">{guide.icon}</p><h1 className="mt-3 text-4xl font-black">{guide.title}</h1><p className="mt-3 max-w-3xl leading-7 text-slate-700">{guide.intro}</p><div className="mt-5 flex items-center gap-4"><div className="h-3 flex-1 overflow-hidden rounded-full bg-purple-100"><div className="h-full bg-gradient-to-r from-purple-600 to-pink-500" style={{ width: `${score}%` }} /></div><span className="font-black text-purple-800">{score}% ready</span></div></header>
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <article className="rounded-[2rem] border border-emerald-100 bg-white/85 p-6 shadow-lg"><h2 className="text-2xl font-black">Readiness checklist</h2><p className="mt-2 text-sm text-slate-600">Each item awards 10 XP once.</p><div className="mt-5 space-y-3">{guide.checklist.map((item) => { const checked = completedIds.includes(item.id); return <label key={item.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${checked ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}><input type="checkbox" checked={checked} onChange={() => onToggle(item.id)} className="mt-1 size-4 accent-emerald-600" /><span className={`font-semibold leading-6 ${checked ? "text-slate-500 line-through" : ""}`}>{item.label}</span></label>; })}</div></article>
      <div className="grid gap-4 md:grid-cols-2">{guide.sections.map((section) => <article key={section.title} className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm"><h2 className="text-xl font-black text-purple-900">{section.title}</h2><ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">{section.points.map((point) => <li key={point} className="leading-6">{point}</li>)}</ul></article>)}</div>
    </div>
  </section>;
}

const blankApplication = (kind: ApplicationKind): ApplicationInput => ({ kind, company: "", role: "", workType: "", location: "", applicationLink: "", dateApplied: "", deadline: "", status: kind === "internship" ? "Interested" : "Wishlist", interviewStage: "", notes: "", followUpDate: "" });

function ApplicationTracker({ kind, state, onSync }: { kind: ApplicationKind; state: CareerHubState; onSync: () => void }) {
  const records = state.applications.filter((item) => item.kind === kind);
  const statuses = kind === "internship" ? internshipStatuses : jobStatuses;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("updated");
  const [editing, setEditing] = useState<ApplicationRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ApplicationInput>(() => blankApplication(kind));

  const today = new Date().toISOString().slice(0, 10);
  const filtered = [...records].filter((item) => {
    const matchQuery = `${item.company} ${item.role} ${item.location} ${item.notes}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchQuery && (status === "All" || item.status === status);
  }).sort((a, b) => {
    if (sort === "company") return a.company.localeCompare(b.company);
    if (sort === "followup") return (a.followUpDate || "9999").localeCompare(b.followUpDate || "9999");
    return b.updatedAt.localeCompare(a.updatedAt);
  });
  const upcoming = records.filter((item) => item.followUpDate && item.followUpDate >= today).length;
  const overdue = records.filter((item) => item.followUpDate && item.followUpDate < today && !["Offer", "Rejected", "Withdrawn"].includes(item.status)).length;

  function openCreate() { playClickSound(); setEditing(null); setForm(blankApplication(kind)); setShowForm(true); }
  function openEdit(item: ApplicationRecord) { playClickSound(); setEditing(item); setForm({ kind: item.kind, company: item.company, role: item.role, workType: item.workType, location: item.location, applicationLink: item.applicationLink, dateApplied: item.dateApplied, deadline: item.deadline, status: item.status, interviewStage: item.interviewStage, notes: item.notes, followUpDate: item.followUpDate }); setShowForm(true); }
  function submit(event: React.FormEvent) { event.preventDefault(); const result = saveApplication({ ...form, company: form.company.trim(), role: form.role.trim() }, editing?.id); if (result.saved) { playSuccessSound(); setShowForm(false); setEditing(null); onSync(); } }
  function remove(item: ApplicationRecord) { if (!window.confirm(`Delete ${item.company} — ${item.role}? This cannot be undone.`)) return; if (deleteApplication(item.id)) { playClickSound(); onSync(); } }

  return <section className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><SectionHeading eyebrow={kind === "internship" ? "Internship Tracker" : "Job Application Tracker"} title={kind === "internship" ? "Build early-career momentum" : "Keep every application moving"} description="Add, edit, search, filter, sort, and follow up—all stored on this device." /><button type="button" onClick={openCreate} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-purple-700 px-5 font-black text-white"><Plus size={18} /> Add {kind}</button></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><ProgressCard icon="📬" label="Total" value={String(records.length)} /><ProgressCard icon="📅" label="Upcoming follow-ups" value={String(upcoming)} /><ProgressCard icon="⚠️" label="Overdue follow-ups" value={String(overdue)} /><ProgressCard icon="🎉" label="Offers" value={String(records.filter((item) => item.status === "Offer").length)} /></div>
    <div className="flex flex-wrap gap-2">{statuses.map((item) => <span key={item} className="rounded-full border border-purple-100 bg-white px-3 py-2 text-sm font-bold">{item}: {records.filter((record) => record.status === item).length}</span>)}</div>
    <div className="grid gap-3 rounded-3xl border border-purple-100 bg-white/80 p-4 shadow-sm md:grid-cols-[1fr_0.55fr_0.55fr]"><label className="relative"><span className="sr-only">Search applications</span><Search className="absolute left-3 top-3.5 text-slate-500" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search company, role, location, or notes" className="min-h-12 w-full rounded-2xl border border-slate-300 pl-10 pr-4" /></label><LabeledSelect label="Filter status" value={status} onChange={setStatus} options={["All", ...statuses]} /><LabeledSelect label="Sort applications" value={sort} onChange={setSort} options={["updated", "company", "followup"]} labels={{ updated: "Recently updated", company: "Company A–Z", followup: "Follow-up date" }} /></div>
    {showForm ? <ApplicationForm form={form} setForm={setForm} statuses={statuses} editing={Boolean(editing)} onClose={() => setShowForm(false)} onSubmit={submit} /> : null}
    {filtered.length ? <div className="grid gap-4 lg:grid-cols-2">{filtered.map((item) => <ApplicationCard key={item.id} item={item} today={today} onEdit={() => openEdit(item)} onDelete={() => remove(item)} />)}</div> : <EmptyState icon="📭" text={records.length ? "No applications match these filters." : `Add your first ${kind} opportunity to start tracking follow-ups.`} />}
  </section>;
}

function ApplicationForm({ form, setForm, statuses, editing, onClose, onSubmit }: { form: ApplicationInput; setForm: React.Dispatch<React.SetStateAction<ApplicationInput>>; statuses: readonly string[]; editing: boolean; onClose: () => void; onSubmit: (event: React.FormEvent) => void }) {
  const update = (key: keyof ApplicationInput, value: string) => setForm((current) => ({ ...current, [key]: value }));
  return <form onSubmit={onSubmit} className="rounded-[2rem] border border-purple-200 bg-purple-50/70 p-5 shadow-lg sm:p-7"><div className="flex items-center justify-between gap-4"><h2 className="text-2xl font-black">{editing ? "Edit application" : "Add application"}</h2><button type="button" onClick={onClose} aria-label="Close application form" className="grid size-10 place-items-center rounded-xl bg-white text-slate-700"><X size={19} /></button></div><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    <Field label="Company" required value={form.company} onChange={(value) => update("company", value)} />
    <Field label="Role" required value={form.role} onChange={(value) => update("role", value)} />
    <Field label="Work type" value={form.workType} onChange={(value) => update("workType", value)} placeholder="Remote, hybrid, onsite" />
    <Field label="Location" value={form.location} onChange={(value) => update("location", value)} />
    <Field label="Application link" type="url" value={form.applicationLink} onChange={(value) => update("applicationLink", value)} />
    <Field label="Date applied" type="date" value={form.dateApplied} onChange={(value) => update("dateApplied", value)} />
    <Field label="Deadline" type="date" value={form.deadline} onChange={(value) => update("deadline", value)} />
    <LabeledSelect label="Status" value={form.status} onChange={(value) => update("status", value)} options={[...statuses]} />
    <Field label="Interview stage" value={form.interviewStage} onChange={(value) => update("interviewStage", value)} placeholder="Recruiter, technical, final" />
    <Field label="Follow-up date" type="date" value={form.followUpDate} onChange={(value) => update("followUpDate", value)} />
    <label className="md:col-span-2 xl:col-span-3"><span className="mb-1.5 block text-sm font-black">Notes</span><textarea rows={4} value={form.notes} onChange={(event) => update("notes", event.target.value)} className="w-full rounded-2xl border border-slate-300 bg-white p-3" placeholder="Contacts, preparation notes, next steps…" /></label>
  </div><button type="submit" className="mt-5 min-h-12 rounded-2xl bg-purple-700 px-6 font-black text-white">{editing ? "Save changes" : "Add application"}</button></form>;
}

function ApplicationCard({ item, today, onEdit, onDelete }: { item: ApplicationRecord; today: string; onEdit: () => void; onDelete: () => void }) {
  const overdue = item.followUpDate && item.followUpDate < today && !["Offer", "Rejected", "Withdrawn"].includes(item.status);
  return <article className="rounded-3xl border border-purple-100 bg-white p-5 shadow-md"><div className="flex items-start justify-between gap-4"><div><span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-800">{item.status}</span><h2 className="mt-3 text-2xl font-black">{item.company}</h2><p className="mt-1 font-bold text-slate-700">{item.role}</p></div><div className="flex gap-2"><button type="button" onClick={onEdit} aria-label={`Edit ${item.company} ${item.role}`} className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><Edit3 size={17} /></button><button type="button" onClick={onDelete} aria-label={`Delete ${item.company} ${item.role}`} className="grid size-10 place-items-center rounded-xl bg-rose-50 text-rose-700"><Trash2 size={17} /></button></div></div><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><Info label="Work type" value={item.workType || "Not set"} /><Info label="Location" value={item.location || "Not set"} /><Info label="Applied" value={item.dateApplied || "Not set"} /><Info label="Deadline" value={item.deadline || "Not set"} /><Info label="Interview stage" value={item.interviewStage || "Not set"} /><Info label="Follow-up" value={item.followUpDate || "Not set"} alert={Boolean(overdue)} /></dl>{item.notes ? <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">{item.notes}</p> : null}{item.applicationLink ? <a href={item.applicationLink} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 font-black text-purple-800">Open application <ExternalLink size={16} /></a> : null}</article>;
}

function CompanyExplorer({ query, setQuery, companiesToShow, favorites }: { query: string; setQuery: (value: string) => void; companiesToShow: typeof companies; favorites: string[] }) {
  return <section><SectionHeading eyebrow="Company Explorer" title="Prepare for target companies" description="Stable preparation guides only—no live openings, salary claims, or changing hiring-policy promises." /><label className="relative mt-5 block max-w-xl"><span className="sr-only">Search companies</span><Search className="absolute left-4 top-3.5 text-slate-500" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search company or industry" className="min-h-12 w-full rounded-2xl border border-purple-200 bg-white pl-11 pr-4" /></label><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{companiesToShow.map((company) => <Link key={company.slug} href={`/career-hub/company/${company.slug}`} onClick={playClickSound} className="group rounded-3xl border border-purple-100 bg-gradient-to-br from-white to-purple-50 p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl"><div className="flex items-center justify-between"><span className="text-3xl">🏢</span>{favorites.includes(company.slug) ? <Heart className="text-pink-600" size={19} fill="currentColor" /> : null}</div><h2 className="mt-4 text-2xl font-black">{company.name}</h2><p className="mt-2 text-sm font-semibold text-slate-600">{company.type}</p><span className="mt-5 inline-flex items-center gap-2 font-black text-purple-800">Prepare <ArrowRight className="transition group-hover:translate-x-1" size={17} /></span></Link>)}</div>{companiesToShow.length === 0 ? <EmptyState icon="🔎" text="No companies match this search." /> : null}</section>;
}

const blankCertification: CertificationInput = { catalogId: "", name: "", provider: "", status: "Planned", targetDate: "", startDate: "", completionDate: "", certificateLink: "", credentialId: "", notes: "" };

function CertificationTracker({ state, onSync, onXPAward }: { state: CareerHubState; onSync: () => void; onXPAward: (amount: number) => void }) {
  const [form, setForm] = useState<CertificationInput>(blankCertification);
  const [editing, setEditing] = useState<CertificationRecord | null>(null);
  const update = (key: keyof CertificationInput, value: string) => setForm((current) => ({ ...current, [key]: value } as CertificationInput));
  function submit(event: React.FormEvent) { event.preventDefault(); const result = saveCertification({ ...form, name: form.name.trim() }, editing?.id); if (result.saved) { onXPAward(result.xpAward); playSuccessSound(); setForm(blankCertification); setEditing(null); onSync(); } }
  function edit(item: CertificationRecord) { playClickSound(); setEditing(item); setForm({ catalogId: item.catalogId, name: item.name, provider: item.provider, status: item.status, targetDate: item.targetDate, startDate: item.startDate, completionDate: item.completionDate, certificateLink: item.certificateLink, credentialId: item.credentialId, notes: item.notes }); }
  function remove(item: CertificationRecord) { if (!window.confirm(`Delete ${item.name}? This cannot be undone.`)) return; if (deleteCertification(item.id)) onSync(); }
  return <section className="space-y-6"><SectionHeading eyebrow="Certification Tracker" title="Track credentials with purpose" description="Save plans and evidence without treating certificates as a substitute for project skill." /><Link href="/certification-hub" onClick={playClickSound} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-purple-700 px-5 font-black text-white">Open the full Certification Hub <ArrowRight size={17} /></Link><form onSubmit={submit} className="rounded-[2rem] border border-purple-200 bg-white/85 p-6 shadow-lg"><div className="flex items-center justify-between"><h2 className="text-2xl font-black">{editing ? "Edit certification" : "Add certification"}</h2>{editing ? <button type="button" onClick={() => { setEditing(null); setForm(blankCertification); }} aria-label="Cancel certification editing" className="grid size-10 place-items-center rounded-xl bg-slate-100"><X size={18} /></button> : null}</div><div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3"><Field label="Certification name" required value={form.name} onChange={(value) => update("name", value)} /><Field label="Provider" value={form.provider} onChange={(value) => update("provider", value)} /><LabeledSelect label="Status" value={form.status} onChange={(value) => update("status", value)} options={[...certificationStatuses]} /><Field label="Target date" type="date" value={form.targetDate} onChange={(value) => update("targetDate", value)} /><Field label="Start date" type="date" value={form.startDate} onChange={(value) => update("startDate", value)} /><Field label="Completion date" type="date" value={form.completionDate} onChange={(value) => update("completionDate", value)} /><Field label="Certificate link" type="url" value={form.certificateLink} onChange={(value) => update("certificateLink", value)} /><Field label="Credential ID" value={form.credentialId} onChange={(value) => update("credentialId", value)} /><label className="md:col-span-2 lg:col-span-3"><span className="mb-1.5 block text-sm font-black">Notes</span><textarea rows={3} value={form.notes} onChange={(event) => update("notes", event.target.value)} className="w-full rounded-2xl border border-slate-300 p-3" /></label></div><button type="submit" className="mt-5 min-h-12 rounded-2xl bg-purple-700 px-6 font-black text-white">{editing ? "Save changes" : "Add certification"}</button></form>{state.certifications.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{state.certifications.map((item) => <article key={item.id} className="rounded-3xl border border-amber-100 bg-amber-50/60 p-5 shadow-md"><div className="flex items-start justify-between gap-4"><div><span className="rounded-full bg-white px-3 py-1 text-xs font-black text-amber-800">{item.status}</span><h2 className="mt-3 text-xl font-black">{item.name}</h2><p className="mt-1 text-sm font-semibold text-slate-600">{item.provider || "Provider not set"}</p></div><div className="flex gap-2"><button type="button" onClick={() => edit(item)} aria-label={`Edit ${item.name}`} className="grid size-9 place-items-center rounded-xl bg-white text-blue-700"><Edit3 size={16} /></button><button type="button" onClick={() => remove(item)} aria-label={`Delete ${item.name}`} className="grid size-9 place-items-center rounded-xl bg-white text-rose-700"><Trash2 size={16} /></button></div></div>{item.notes ? <p className="mt-4 text-sm leading-6 text-slate-700">{item.notes}</p> : null}{item.certificateLink ? <a href={item.certificateLink} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 font-black text-purple-800">Certificate <ExternalLink size={15} /></a> : null}</article>)}</div> : <EmptyState icon="🏅" text="Add a planned certification when it supports your target role." />}</section>;
}

function CareerChecklist({ completedIds, readiness, onToggle }: { completedIds: string[]; readiness: number; onToggle: (id: string) => void }) {
  return <section className="space-y-6"><header className="rounded-[2rem] border border-white bg-gradient-to-br from-emerald-100 via-white to-purple-100 p-7 shadow-lg"><p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-700">Career Checklist</p><h1 className="mt-2 text-4xl font-black">Honest career readiness: {readiness}%</h1><p className="mt-3 max-w-3xl leading-7 text-slate-700">This score counts only completed checklist items below. Applications, favorites, and page visits never increase it.</p><div className="mt-5 h-4 overflow-hidden rounded-full bg-emerald-100"><div className="h-full bg-gradient-to-r from-emerald-500 to-purple-600" style={{ width: `${readiness}%` }} /></div></header><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{careerChecklistCategories.map(([category]) => { const items = careerChecklistItems.filter((item) => item.category === category); return <article key={category} className="rounded-3xl border border-purple-100 bg-white p-5 shadow-md"><h2 className="text-2xl font-black">{category}</h2><div className="mt-4 space-y-3">{items.map((item) => { const checked = completedIds.includes(item.id); return <label key={item.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 ${checked ? "border-emerald-200 bg-emerald-50" : "border-slate-200"}`}><input type="checkbox" checked={checked} onChange={() => onToggle(item.id)} className="mt-1 size-4 accent-emerald-600" /><span><span className={checked ? "text-slate-500 line-through" : "font-semibold"}>{item.label}</span><span className="mt-1 block text-xs font-black text-amber-700">+10 XP once</span></span></label>; })}</div></article>; })}</div></section>;
}

function HeaderStat({ value, label }: { value: string | number; label: string }) { return <div className="min-w-20 rounded-2xl bg-white/80 px-3 py-3 text-center"><p className="text-xl font-black text-purple-900">{value}</p><p className="text-xs font-bold text-slate-600">{label}</p></div>; }
function ProgressCard({ icon, label, value }: { icon: string; label: string; value: string }) { return <article className="rounded-3xl border border-white bg-white/85 p-5 shadow-md"><span className="text-2xl">{icon}</span><p className="mt-3 text-2xl font-black text-purple-900">{value}</p><p className="mt-1 text-sm font-bold text-slate-600">{label}</p></article>; }
function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) { return <div><p className="text-sm font-black uppercase tracking-[0.16em] text-purple-700">{eyebrow}</p><h1 className="mt-1 text-3xl font-black">{title}</h1><p className="mt-2 max-w-3xl leading-7 text-slate-700">{description}</p></div>; }
function QuickButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) { return <button type="button" onClick={onClick} className="group flex min-h-28 items-center justify-between rounded-3xl border border-purple-100 bg-white p-5 text-left shadow-md transition hover:-translate-y-1 hover:shadow-xl"><span><span className="text-3xl">{icon}</span><span className="mt-2 block font-black">{label}</span></span><ArrowRight className="text-purple-700 transition group-hover:translate-x-1" size={18} /></button>; }
function QuickLink({ icon, label, href }: { icon: string; label: string; href: string }) { return <Link href={href} onClick={playClickSound} className="group flex min-h-28 items-center justify-between rounded-3xl border border-purple-100 bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl"><span><span className="text-3xl">{icon}</span><span className="mt-2 block font-black">{label}</span></span><ArrowRight className="text-purple-700 transition group-hover:translate-x-1" size={18} /></Link>; }
function EmptyState({ icon, text }: { icon: string; text: string }) { return <div className="rounded-[2rem] border border-dashed border-purple-200 bg-purple-50/50 p-10 text-center"><p className="text-4xl">{icon}</p><p className="mt-3 font-bold text-slate-700">{text}</p></div>; }
function Field({ label, value, onChange, type = "text", required = false, placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; placeholder?: string }) { return <label><span className="mb-1.5 block text-sm font-black">{label}</span><input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-3" /></label>; }
function LabeledSelect({ label, value, onChange, options, labels = {} }: { label: string; value: string; onChange: (value: string) => void; options: readonly string[]; labels?: Record<string, string> }) { return <label><span className="sr-only">{label}</span><select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-3 font-bold">{options.map((option) => <option key={option} value={option}>{labels[option] ?? option}</option>)}</select></label>; }
function Info({ label, value, alert = false }: { label: string; value: string; alert?: boolean }) { return <div className={`rounded-xl p-3 ${alert ? "bg-rose-50 text-rose-800" : "bg-slate-50"}`}><dt className="text-xs font-bold uppercase tracking-wide">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>; }
