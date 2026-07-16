"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
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
  certificationCatalog,
  certificationProviders,
  certificationSkillAreas,
  type CertificationDefinition,
} from "@/lib/certificationData";
import {
  addCatalogCertificationToTracker,
  CERTIFICATION_HUB_EVENT,
  deleteCertificationTrackerRecord,
  getCertificationProgress,
  getCertificationScopeId,
  getCertificationSummary,
  saveCertificationTrackerRecord,
  toggleCertificationFavorite,
} from "@/lib/certificationHub";
import {
  certificationStatuses,
  loadCareerHubState,
  type CareerHubState,
  type CertificationInput,
  type CertificationRecord,
} from "@/lib/careerHub";
import { playClickSound, playSuccessSound, playXPSound } from "@/lib/sounds";
import { incrementStats } from "@/lib/stats";
import { registerStudyDay } from "@/lib/streak";
import { useUserPreferences } from "@/hooks/useUserPreferences";

const blankTrackerRecord: CertificationInput = {
  catalogId: "",
  name: "",
  provider: "",
  status: "Interested",
  targetDate: "",
  startDate: "",
  completionDate: "",
  certificateLink: "",
  credentialId: "",
  notes: "",
};

const fieldClass = "min-h-12 w-full rounded-2xl border border-purple-200 bg-white/85 px-4 text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-200";
const focusClass = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2";

export default function CertificationHub() {
  const { addXP } = useProgress();
  const [state, setState] = useState<CareerHubState | null>(null);
  const preferences = useUserPreferences();
  const userName = preferences.userName || "Learner";
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState("All");
  const [skill, setSkill] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [trackerQuery, setTrackerQuery] = useState("");
  const [trackerStatus, setTrackerStatus] = useState("All");
  const [form, setForm] = useState<CertificationInput>(blankTrackerRecord);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [message, setMessage] = useState("");

  function sync() {
    setState(loadCareerHubState());
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      sync();
    });
    window.addEventListener(CERTIFICATION_HUB_EVENT, sync);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener(CERTIFICATION_HUB_EVENT, sync);
    };
  }, []);

  const filteredCatalog = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return certificationCatalog.filter((item) => {
      const matchesQuery = !normalized || [item.name, item.provider, item.skillArea, item.summary, ...item.skills, ...item.studios]
        .join(" ").toLowerCase().includes(normalized);
      return matchesQuery && (provider === "All" || item.provider === provider) && (skill === "All" || item.skillArea === skill) && (difficulty === "All" || item.difficulty === difficulty);
    });
  }, [difficulty, provider, query, skill]);

  if (!state) {
    return <AppLayout><div className="grid min-h-[50vh] place-items-center rounded-[2rem] border border-white/80 bg-white/70 text-lg font-black text-purple-800">Preparing your certification garden…</div></AppLayout>;
  }

  const summary = getCertificationSummary(state);
  const recommended = certificationCatalog
    .filter((item) => item.beginnerFriendly || item.skillArea === "Data analytics")
    .filter((item) => !state.certifications.some((record) => record.catalogId === item.id))
    .slice(0, 3);
  const planned = state.certifications.filter((item) => item.status === "Interested" || item.status === "Planned");
  const inProgress = state.certifications.filter((item) => item.status === "In Progress" || item.status === "Exam Scheduled");
  const completed = state.certifications.filter((item) => item.status === "Completed");
  const trackerNormalized = trackerQuery.trim().toLowerCase();
  const filteredTracker = state.certifications.filter((item) =>
    (!trackerNormalized || `${item.name} ${item.provider} ${item.notes} ${item.credentialId}`.toLowerCase().includes(trackerNormalized)) &&
    (trackerStatus === "All" || item.status === trackerStatus),
  );

  function awardXP(amount: number) {
    if (!amount) return;
    addXP(amount);
    incrementStats(1, 1, amount, 0);
    registerStudyDay();
    playXPSound();
    setMessage(`+${amount} XP earned once.`);
  }

  function addToTracker(item: CertificationDefinition) {
    playClickSound();
    const result = addCatalogCertificationToTracker(item);
    if (result.existing) {
      setMessage("This certification is already in your tracker.");
      return;
    }
    if (result.saved) {
      awardXP(result.xpAward);
      playSuccessSound();
      sync();
      setMessage(result.xpAward ? `Added to your tracker · +${result.xpAward} XP earned once.` : "Added to your tracker.");
    }
  }

  function toggleFavorite(id: string) {
    playClickSound();
    setState(toggleCertificationFavorite(id));
  }

  function updateForm<K extends keyof CertificationInput>(key: K, value: CertificationInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submitTracker(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = saveCertificationTrackerRecord({ ...form, name: form.name.trim(), provider: form.provider.trim() }, editingId);
    if (!result.saved) return;
    awardXP(result.xpAward);
    playSuccessSound();
    setForm(blankTrackerRecord);
    setEditingId(undefined);
    sync();
    setMessage(editingId ? "Certification updated." : result.xpAward ? `Certification added · +${result.xpAward} XP earned once.` : "Certification added.");
  }

  function editTracker(item: CertificationRecord) {
    playClickSound();
    setEditingId(item.id);
    setForm({
      catalogId: item.catalogId,
      name: item.name,
      provider: item.provider,
      status: item.status,
      targetDate: item.targetDate,
      startDate: item.startDate,
      completionDate: item.completionDate,
      certificateLink: item.certificateLink,
      credentialId: item.credentialId,
      notes: item.notes,
    });
    document.getElementById("tracker-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function removeTracker(item: CertificationRecord) {
    if (!window.confirm(`Delete ${item.name}? This cannot be undone.`)) return;
    if (deleteCertificationTrackerRecord(item.id)) {
      playClickSound();
      if (editingId === item.id) {
        setEditingId(undefined);
        setForm(blankTrackerRecord);
      }
      sync();
      setMessage("Certification removed from the tracker.");
    }
  }

  return (
    <AppLayout>
      <div className="min-w-0 space-y-8 overflow-x-hidden text-slate-900">
        <header className="relative overflow-hidden rounded-[2.25rem] border border-white/90 bg-gradient-to-br from-pink-100 via-purple-100 to-sky-100 p-6 shadow-[0_22px_65px_rgba(88,28,135,0.14)] sm:p-9">
          <div aria-hidden="true" className="absolute -right-16 -top-20 size-64 rounded-full bg-white/60 blur-3xl" />
          <div className="relative grid gap-7 xl:grid-cols-[1fr_auto] xl:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-4 py-2 text-sm font-black text-purple-800 shadow-sm"><Sparkles size={16} /> Role-aligned credentials, honestly tracked</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-purple-950 sm:text-5xl">🏅 {userName}&apos;s Certification Hub</h1>
              <p className="mt-3 max-w-3xl text-base font-medium leading-7 text-slate-700 sm:text-lg">Compare stable preparation paths, track real milestones, and calculate readiness only from completed preparation steps.</p>
              <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/85 px-4 py-3 text-sm font-semibold text-amber-900">Always verify current exam names, availability, policies, and costs on the provider&apos;s official page before making a decision.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:max-w-xl">
              <SummaryTile label="Tracked" value={summary.tracked} />
              <SummaryTile label="In progress" value={summary.inProgress} />
              <SummaryTile label="Completed" value={summary.completed} />
              <SummaryTile label="Readiness" value={`${summary.readinessProgress}%`} />
            </div>
          </div>
        </header>

        <p className="sr-only" aria-live="polite">{message}</p>

        <section aria-labelledby="readiness-heading" className="rounded-[2rem] border border-white/90 bg-white/75 p-6 shadow-lg backdrop-blur-xl sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-sm font-black uppercase tracking-[0.16em] text-purple-700">Certification readiness</p><h2 id="readiness-heading" className="mt-1 text-3xl font-black text-slate-950">Preparation progress: {summary.readinessProgress}%</h2><p className="mt-2 text-slate-600">Calculated only from completed roadmap and practice checklist items.</p></div>
            <p className="rounded-2xl bg-purple-50 px-4 py-3 font-black text-purple-800">{summary.preparationStepsCompleted} preparation steps complete</p>
          </div>
          <div className="mt-5 h-4 overflow-hidden rounded-full bg-purple-100" role="progressbar" aria-label="Certification readiness" aria-valuemin={0} aria-valuemax={100} aria-valuenow={summary.readinessProgress}><div className="h-full rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-sky-500 transition-[width] motion-reduce:transition-none" style={{ width: `${summary.readinessProgress}%` }} /></div>
        </section>

        <section aria-labelledby="status-heading">
          <SectionHeading eyebrow="Your tracker" title="Certification progress summary" description="Status totals and target dates come only from certifications you have saved." id="status-heading" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatusGroup title="Planned certifications" icon="🗓️" items={planned} empty="No planned certifications yet. Add one from the catalog when it supports your goal." />
            <StatusGroup title="In-progress certifications" icon="🚀" items={inProgress} empty="Nothing is in progress. Start when you have room for consistent preparation." />
            <StatusGroup title="Completed certifications" icon="🎓" items={completed} empty="No completed certifications yet. Your completed credentials will appear here." />
            <StatusGroup title="Upcoming target dates" icon="⏳" items={summary.upcomingTargets.slice(0, 4)} empty="No upcoming targets. Add a target date when you have a realistic plan." showDate />
          </div>
        </section>

        <section aria-labelledby="recommended-heading">
          <SectionHeading eyebrow="Recommended" title="Good starting points" description="Beginner-friendly and broad analyst pathways to compare against your role goals." id="recommended-heading" />
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            {recommended.map((item) => <RecommendationCard key={item.id} item={item} onAdd={() => addToTracker(item)} />)}
          </div>
        </section>

        <section id="catalog" aria-labelledby="catalog-heading" className="scroll-mt-24">
          <SectionHeading eyebrow="Certification catalog" title={`${filteredCatalog.length} pathways to explore`} description="Search by credential, provider, skill, Studio, or topic. Catalog descriptions intentionally avoid live price and policy claims." id="catalog-heading" />
          <div className="mt-5 rounded-[2rem] border border-white/90 bg-white/75 p-4 shadow-lg backdrop-blur-xl sm:p-5">
            <label className="relative block"><span className="sr-only">Search certifications</span><Search className="pointer-events-none absolute left-4 top-3.5 text-purple-600" size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search certifications, providers, skills, or Studios" className={`${fieldClass} pl-12`} /></label>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Filter label="Provider" value={provider} onChange={setProvider} options={["All", ...certificationProviders]} />
              <Filter label="Skill area" value={skill} onChange={setSkill} options={["All", ...certificationSkillAreas]} />
              <Filter label="Difficulty" value={difficulty} onChange={setDifficulty} options={["All", "Beginner", "Intermediate", "Advanced"]} />
              <button type="button" onClick={() => { setQuery(""); setProvider("All"); setSkill("All"); setDifficulty("All"); }} className={`min-h-12 rounded-2xl border border-purple-200 bg-purple-50 px-4 font-black text-purple-800 transition hover:bg-purple-100 ${focusClass}`}>Clear filters</button>
            </div>
          </div>
          {filteredCatalog.length ? <div className="mt-6 grid gap-6 xl:grid-cols-2">{filteredCatalog.map((item) => {
            const tracked = state.certifications.find((record) => record.catalogId === item.id);
            return <CatalogCard key={item.id} item={item} tracked={tracked} favorite={state.certificationFavoriteIds.includes(item.id)} note={state.certificationNotes[item.id] ?? tracked?.notes ?? ""} onFavorite={() => toggleFavorite(item.id)} onAdd={() => addToTracker(item)} />;
          })}</div> : <EmptyState icon="🔎" title="No certifications match" text="Try a broader provider, skill, or search term." />}
        </section>

        <section id="tracker" aria-labelledby="tracker-heading" className="scroll-mt-24 space-y-6">
          <SectionHeading eyebrow="Certification tracker" title="Plan and preserve your credential evidence" description="Add custom records or edit catalog certifications. Everything remains on this device." id="tracker-heading" />
          <form id="tracker-form" onSubmit={submitTracker} className="rounded-[2rem] border border-purple-200 bg-white/80 p-5 shadow-lg backdrop-blur-xl sm:p-7">
            <div className="flex items-center justify-between gap-4"><h3 className="text-2xl font-black text-purple-900">{editingId ? "Edit certification" : "Add a certification"}</h3>{editingId ? <button type="button" onClick={() => { setEditingId(undefined); setForm(blankTrackerRecord); }} aria-label="Cancel editing" className={`grid size-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 ${focusClass}`}><X size={19} /></button> : null}</div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Certification name" required value={form.name} onChange={(value) => updateForm("name", value)} />
              <Field label="Provider" value={form.provider} onChange={(value) => updateForm("provider", value)} />
              <Filter label="Status" value={form.status} onChange={(value) => updateForm("status", value as CertificationInput["status"])} options={[...certificationStatuses]} />
              <Field label="Target date" type="date" value={form.targetDate} onChange={(value) => updateForm("targetDate", value)} />
              <Field label="Start date" type="date" value={form.startDate} onChange={(value) => updateForm("startDate", value)} />
              <Field label="Completion date" type="date" value={form.completionDate} onChange={(value) => updateForm("completionDate", value)} />
              <Field label="Certificate link" type="url" value={form.certificateLink} onChange={(value) => updateForm("certificateLink", value)} placeholder="https://…" />
              <Field label="Credential ID" value={form.credentialId} onChange={(value) => updateForm("credentialId", value)} />
              <label className="md:col-span-2 xl:col-span-3"><span className="mb-1.5 block text-sm font-black text-slate-700">Notes</span><textarea rows={4} value={form.notes} onChange={(event) => updateForm("notes", event.target.value)} placeholder="Preparation context, result, renewal reminder, or evidence…" className={`${fieldClass} min-h-28 py-3`} /></label>
            </div>
            <button type="submit" className={`mt-5 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-purple-700 px-6 font-black text-white shadow-md transition hover:bg-purple-800 ${focusClass}`}><Plus size={18} /> {editingId ? "Save changes" : "Add to tracker"}</button>
          </form>

          <div className="rounded-[2rem] border border-white/90 bg-white/70 p-4 shadow-md sm:p-5">
            <div className="grid gap-3 md:grid-cols-[1fr_16rem]"><label className="relative"><span className="sr-only">Search tracked certifications</span><Search className="absolute left-4 top-3.5 text-purple-600" size={19} /><input value={trackerQuery} onChange={(event) => setTrackerQuery(event.target.value)} placeholder="Search tracked certifications" className={`${fieldClass} pl-12`} /></label><Filter label="Tracker status" value={trackerStatus} onChange={setTrackerStatus} options={["All", ...certificationStatuses]} /></div>
          </div>
          {filteredTracker.length ? <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">{filteredTracker.map((item) => <TrackerCard key={item.id} item={item} state={state} onEdit={() => editTracker(item)} onDelete={() => removeTracker(item)} />)}</div> : <EmptyState icon="🏅" title={state.certifications.length ? "No tracker records match" : "No tracked certifications"} text={state.certifications.length ? "Clear the search or status filter to see your records." : "Add a catalog pathway or create a custom record when a credential supports your role goal."} />}
        </section>
      </div>
    </AppLayout>
  );
}

function SummaryTile({ label, value }: { label: string; value: string | number }) {
  return <div className="min-w-28 rounded-2xl border border-white/90 bg-white/75 p-4 text-center shadow-sm"><p className="text-2xl font-black text-purple-900">{value}</p><p className="mt-1 text-xs font-bold text-slate-600">{label}</p></div>;
}

function SectionHeading({ eyebrow, title, description, id }: { eyebrow: string; title: string; description: string; id: string }) {
  return <div><p className="text-sm font-black uppercase tracking-[0.16em] text-purple-700">{eyebrow}</p><h2 id={id} className="mt-1 text-3xl font-black text-slate-950">{title}</h2><p className="mt-2 max-w-3xl leading-7 text-slate-600">{description}</p></div>;
}

function StatusGroup({ title, icon, items, empty, showDate = false }: { title: string; icon: string; items: CertificationRecord[]; empty: string; showDate?: boolean }) {
  return <article className="rounded-[1.75rem] border border-white/90 bg-white/75 p-5 shadow-md backdrop-blur-xl"><p className="text-2xl" aria-hidden="true">{icon}</p><h3 className="mt-3 text-xl font-black text-purple-900">{title}</h3>{items.length ? <ul className="mt-4 space-y-3">{items.slice(0, 4).map((item) => <li key={item.id} className="rounded-2xl border border-purple-100 bg-purple-50/60 p-3"><p className="font-black text-slate-900">{item.name}</p><p className="mt-1 text-xs font-semibold text-slate-600">{showDate ? item.targetDate : item.provider || item.status}</p></li>)}</ul> : <p className="mt-4 text-sm leading-6 text-slate-600">{empty}</p>}</article>;
}

function RecommendationCard({ item, onAdd }: { item: CertificationDefinition; onAdd: () => void }) {
  return <article className="rounded-[1.75rem] border border-purple-100 bg-gradient-to-br from-white/90 via-pink-50/80 to-purple-50/80 p-5 shadow-lg"><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-white px-3 py-1 text-xs font-black text-purple-800">{item.provider}</span><span className="text-xs font-black text-emerald-700">{item.difficulty}</span></div><h3 className="mt-4 text-xl font-black text-slate-950">{item.name}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{item.summary}</p><div className="mt-5 flex flex-wrap gap-3"><Link href={`/certification-hub/${item.id}`} onClick={playClickSound} className={`inline-flex min-h-11 items-center gap-2 rounded-2xl bg-purple-700 px-4 font-black text-white ${focusClass}`}>View roadmap <ArrowRight size={16} /></Link><button type="button" onClick={onAdd} className={`min-h-11 rounded-2xl border border-purple-200 bg-white px-4 font-black text-purple-800 ${focusClass}`}>Add to tracker</button></div></article>;
}

function CatalogCard({ item, tracked, favorite, note, onFavorite, onAdd }: { item: CertificationDefinition; tracked?: CertificationRecord; favorite: boolean; note: string; onFavorite: () => void; onAdd: () => void }) {
  return <article className="rounded-[2rem] border border-white/90 bg-gradient-to-br from-white/90 via-purple-50/60 to-sky-50/70 p-5 shadow-[0_16px_45px_rgba(88,28,135,0.10)] backdrop-blur-xl sm:p-6"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap gap-2"><Badge>{item.provider}</Badge><Badge>{item.skillArea}</Badge><Badge>{item.difficulty}</Badge>{item.freeOption ? <Badge>Free option</Badge> : null}</div><h3 className="mt-4 text-2xl font-black text-slate-950">{item.name}</h3><p className="mt-2 leading-7 text-slate-600">{item.summary}</p></div><button type="button" onClick={onFavorite} aria-label={`${favorite ? "Remove" : "Add"} ${item.name} ${favorite ? "from" : "to"} favorites`} className={`grid size-11 shrink-0 place-items-center rounded-2xl border border-pink-200 bg-pink-50 text-pink-700 transition hover:bg-pink-100 ${focusClass}`}><Heart size={19} fill={favorite ? "currentColor" : "none"} /></button></div><dl className="mt-5 grid gap-3 sm:grid-cols-2"><Info label="Preparation level" value={item.preparationLevel} /><Info label="Status" value={tracked?.status ?? "Not tracked"} /><Info label="Target date" value={tracked?.targetDate || "No target date"} /><Info label="Personal notes" value={note || "No notes yet"} /></dl><DetailList label="Prerequisites" items={item.prerequisites} /><DetailList label="Skills covered" items={item.skills} /><DetailList label="Recommended DataBloom Studios" items={item.studios} /><div className="mt-5 flex flex-wrap gap-3"><Link href={`/certification-hub/${item.id}`} onClick={playClickSound} className={`inline-flex min-h-11 items-center gap-2 rounded-2xl bg-purple-700 px-4 font-black text-white ${focusClass}`}>Full preparation guide <ArrowRight size={16} /></Link><button type="button" onClick={onAdd} disabled={Boolean(tracked)} className={`min-h-11 rounded-2xl border border-purple-200 bg-white px-4 font-black text-purple-800 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${focusClass}`}>{tracked ? "Added to tracker" : "Add to tracker"}</button><a href={item.officialLink} target="_blank" rel="noreferrer" className={`inline-flex min-h-11 items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 font-black text-sky-800 ${focusClass}`}>Official page <ExternalLink size={15} /></a></div></article>;
}

function TrackerCard({ item, state, onEdit, onDelete }: { item: CertificationRecord; state: CareerHubState; onEdit: () => void; onDelete: () => void }) {
  const scopeId = getCertificationScopeId(item);
  const progress = getCertificationProgress(scopeId, undefined, state);
  return <article className="rounded-[1.75rem] border border-purple-100 bg-white/80 p-5 shadow-md"><div className="flex items-start justify-between gap-4"><div><span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-800">{item.status}</span><h3 className="mt-3 text-xl font-black text-slate-950">{item.name}</h3><p className="mt-1 text-sm font-semibold text-slate-600">{item.provider || "Provider not set"}</p></div><div className="flex gap-2"><button type="button" onClick={onEdit} aria-label={`Edit ${item.name}`} className={`grid size-10 place-items-center rounded-xl border border-sky-200 bg-sky-50 text-sky-800 ${focusClass}`}><Edit3 size={16} /></button><button type="button" onClick={onDelete} aria-label={`Delete ${item.name}`} className={`grid size-10 place-items-center rounded-xl border border-rose-200 bg-rose-50 text-rose-800 ${focusClass}`}><Trash2 size={16} /></button></div></div><div className="mt-4"><div className="flex items-center justify-between text-sm font-bold text-slate-700"><span>Readiness</span><span>{progress.percentage}%</span></div><div className="mt-2 h-2.5 overflow-hidden rounded-full bg-purple-100"><div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500" style={{ width: `${progress.percentage}%` }} /></div></div><dl className="mt-4 grid grid-cols-2 gap-3"><Info label="Target" value={item.targetDate || "Not set"} /><Info label="Started" value={item.startDate || "Not set"} /><Info label="Completed" value={item.completionDate || "Not set"} /><Info label="Credential ID" value={item.credentialId || "Not set"} /></dl>{item.notes ? <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">{item.notes}</p> : null}<div className="mt-4 flex flex-wrap gap-3">{item.catalogId ? <Link href={`/certification-hub/${item.catalogId}`} onClick={playClickSound} className="inline-flex items-center gap-2 font-black text-purple-800">Preparation guide <ArrowRight size={16} /></Link> : null}{item.certificateLink ? <a href={item.certificateLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-black text-sky-800">Certificate <ExternalLink size={15} /></a> : null}</div></article>;
}

function Filter({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: readonly string[] }) {
  return <label><span className="sr-only">{label}</span><select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className={`${fieldClass} font-bold`}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function Field({ label, value, onChange, type = "text", required = false, placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return <label><span className="mb-1.5 block text-sm font-black text-slate-700">{label}</span><input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={fieldClass} /></label>;
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-purple-100 bg-white/85 px-3 py-1 text-xs font-black text-purple-800">{children}</span>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 rounded-2xl border border-white bg-white/75 p-3"><dt className="text-xs font-black uppercase tracking-wide text-purple-700">{label}</dt><dd className="mt-1 break-words text-sm font-semibold text-slate-700">{value}</dd></div>;
}

function DetailList({ label, items }: { label: string; items: string[] }) {
  return <div className="mt-4"><p className="text-sm font-black text-purple-800">{label}</p><div className="mt-2 flex flex-wrap gap-2">{items.map((item) => <span key={item} className="rounded-xl bg-white/80 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm">{item}</span>)}</div></div>;
}

function EmptyState({ icon, title, text }: { icon: string; title: string; text: string }) {
  return <div className="mt-6 rounded-[2rem] border border-dashed border-purple-200 bg-purple-50/60 p-10 text-center"><p className="text-4xl" aria-hidden="true">{icon}</p><h3 className="mt-3 text-xl font-black text-purple-900">{title}</h3><p className="mx-auto mt-2 max-w-xl leading-7 text-slate-600">{text}</p></div>;
}
