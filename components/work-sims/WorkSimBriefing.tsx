"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Download, LoaderCircle, LockKeyhole, PlayCircle, ShieldCheck } from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import { getWorkSimCatalogueItem, type WorkSimPublicCatalogueItem } from "@/lib/workSims/catalog";

type StageResult = { stageId: string; completionState: "not_started" | "in_progress" | "completed"; bestScore: number; maximumScore: number };
type Progress = {
  currentAttempt: { attemptNumber: number; status: string; score: number; maximumScore: number } | null;
  bestCompletedAttempt: { attemptNumber: number; status: string; score: number; maximumScore: number } | null;
  completedStageIds: string[];
  stageResults: StageResult[];
};
type DetailResponse = { authenticated: boolean; simulation: WorkSimPublicCatalogueItem; progress: Progress | null };

const simulationId = "retail-profit-crisis-v1";

function loginHref() {
  return `/login?next=${encodeURIComponent(`/work-sims/${simulationId}`)}`;
}

export default function WorkSimBriefing() {
  const fallback = getWorkSimCatalogueItem(simulationId)!;
  const [detail, setDetail] = useState<DetailResponse | null>(null);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/work-sims/${simulationId}`, { cache: "no-store", credentials: "same-origin" });
      const payload = (await response.json()) as DetailResponse | { error?: string };
      if (!response.ok || !("simulation" in payload)) throw new Error("Unavailable");
      setDetail(payload);
    } catch {
      setError("This WorkSim is temporarily unavailable. Please refresh and try again.");
    }
  }, []);

  useEffect(() => {
    const requestId = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(requestId);
  }, [load]);

  const simulation = detail?.simulation ?? fallback;
  const progress = detail?.progress;
  const completed = useMemo(() => new Set(progress?.completedStageIds ?? []), [progress?.completedStageIds]);
  const firstIncompleteIndex = simulation.stages.findIndex((stage) => !completed.has(stage.id));

  async function startOrResume() {
    setStarting(true);
    setError("");
    try {
      const response = await fetch(`/api/work-sims/${simulationId}/attempt`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      if (!response.ok) throw new Error("Unavailable");
      await load();
    } catch {
      setError("Your WorkSim attempt could not be started. Please try again.");
    } finally {
      setStarting(false);
    }
  }

  return (
    <AppLayout>
      <div className="space-y-7 text-[var(--databloom-text-primary)]">
        <Link href="/work-sims" className="inline-flex min-h-11 items-center gap-2 rounded-2xl px-2 py-2 font-bold text-[var(--databloom-text-accent)] transition hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--databloom-focus)]">
          <ArrowLeft size={18} aria-hidden="true" /> Back to WorkSims
        </Link>

        <header className="databloom-phase3-gradient-surface rounded-3xl border border-[var(--databloom-border)] p-6 shadow-lg sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--databloom-text-accent)]">{simulation.label} · {simulation.company}</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">Revenue Up, Profit Down</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--databloom-text-secondary)]">You are a junior data analyst asked to investigate why a growing fictional retail business is seeing weaker profitability.</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold">
            <span className="rounded-full border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-4 py-2">{simulation.datasetVersion}</span>
            <span className="rounded-full border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-4 py-2">{simulation.stages.length} stages</span>
            <span className="rounded-full border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-4 py-2">{simulation.maximumScore} points</span>
          </div>
        </header>

        {error ? <p className="rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] p-4 font-semibold text-[var(--databloom-text-secondary)]" role="alert">{error}</p> : null}

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="databloom-phase3-surface rounded-3xl border border-[var(--databloom-border)] p-6 shadow-sm sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--databloom-text-accent)]">Manager&apos;s brief</p>
            <h2 className="mt-2 text-3xl font-black">Find the story behind the numbers</h2>
            <p className="mt-4 leading-8 text-[var(--databloom-text-secondary)]">Management has seen sales grow over six months, but profit is under pressure. Inspect the related order, product, customer, return, and shipment records; identify the drivers; and recommend practical next steps.</p>
            <h3 className="mt-6 text-xl font-black">Your objective</h3>
            <p className="mt-2 leading-7 text-[var(--databloom-text-secondary)]">Produce a defensible analysis of the profitability problem, explain the operational and commercial factors involved, and communicate recommendations clearly for a non-technical manager.</p>
          </div>
          <aside className="databloom-phase3-surface rounded-3xl border border-[var(--databloom-border)] p-6 shadow-sm">
            <h2 className="text-2xl font-black">Your role</h2>
            <p className="mt-3 leading-7 text-[var(--databloom-text-secondary)]">Junior Data Analyst</p>
            <h3 className="mt-6 text-lg font-black">Skills you will use</h3>
            <div className="mt-3 flex flex-wrap gap-2">{simulation.skills.map((skill) => <span key={skill} className="rounded-full border border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] px-3 py-1.5 text-sm font-bold">{skill}</span>)}</div>
          </aside>
        </section>

        <section className="databloom-phase3-surface rounded-3xl border border-[var(--databloom-border)] p-6 shadow-sm sm:p-8" aria-labelledby="dataset-contents">
          <h2 id="dataset-contents" className="text-3xl font-black">Dataset contents</h2>
          <p className="mt-3 leading-7 text-[var(--databloom-text-secondary)]">Download the six related CSV files and use the dictionary to understand each table, relationship, and metric definition.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {simulation.datasetFiles.map((file) => <a key={file.file} href={file.path} download className="flex min-h-11 items-center justify-between gap-3 rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-4 py-3 font-bold transition hover:bg-[var(--databloom-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--databloom-focus)]"><span>{file.label} <span className="text-[var(--databloom-text-muted)]">({file.rowCount} rows)</span></span><Download size={17} aria-hidden="true" /></a>)}
          </div>
          <a href={simulation.dataDictionaryPath} download className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-4 py-3 font-bold text-[var(--databloom-text-accent)] transition hover:bg-[var(--databloom-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--databloom-focus)]"><Download size={17} aria-hidden="true" /> Download data dictionary</a>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="databloom-phase3-surface rounded-3xl border border-[var(--databloom-border)] p-6 shadow-sm">
            <h2 className="text-2xl font-black">KPI reference</h2>
            <dl className="mt-4 space-y-4">{simulation.kpis.map((kpi) => <div key={kpi.name}><dt className="font-black">{kpi.name}</dt><dd className="mt-1 leading-6 text-[var(--databloom-text-secondary)]">{kpi.definition}</dd></div>)}</dl>
          </div>
          <div className="rounded-3xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] p-6 shadow-sm">
            <div className="flex gap-3"><ShieldCheck className="shrink-0 text-[var(--databloom-text-accent)]" aria-hidden="true" /><div><h2 className="text-2xl font-black">Fictional educational data</h2><p className="mt-3 leading-7 text-[var(--databloom-text-secondary)]">DataBloom Retail Co. and every record in this WorkSim are fictional and created for educational practice. They do not describe a real company, customer, product, or transaction.</p></div></div>
          </div>
        </section>

        <section className="databloom-phase3-surface rounded-3xl border border-[var(--databloom-border)] p-6 shadow-sm sm:p-8" aria-labelledby="assignment-stages">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--databloom-text-accent)]">Assignment roadmap</p><h2 id="assignment-stages" className="mt-1 text-3xl font-black">Seven stages</h2></div>{progress?.currentAttempt ? <p className="rounded-full border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-4 py-2 text-sm font-black">Attempt {progress.currentAttempt.attemptNumber} · {progress.currentAttempt.score}/{progress.currentAttempt.maximumScore} points</p> : progress?.bestCompletedAttempt ? <p className="rounded-full border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-4 py-2 text-sm font-black">Completed attempt {progress.bestCompletedAttempt.attemptNumber} · {progress.bestCompletedAttempt.score}/{progress.bestCompletedAttempt.maximumScore}</p> : null}</div>
          <ol className="mt-6 space-y-3">{simulation.stages.map((stage, index) => {
            const isComplete = completed.has(stage.id);
            const isCurrent = Boolean(progress?.currentAttempt) && index === firstIncompleteIndex;
            const state = isComplete ? "Completed" : isCurrent ? "Current stage" : progress?.currentAttempt ? "Locked" : "Available after starting";
            return <li key={stage.id} className="flex min-w-0 items-start gap-4 rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] p-4"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--databloom-accent-soft)] text-sm font-black">{index + 1}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-black">{stage.title}</h3><span className="text-sm font-bold text-[var(--databloom-text-secondary)]">{state} · {stage.maximumScore} points</span></div><p className="mt-1 leading-6 text-[var(--databloom-text-secondary)]">{stage.description}</p></div></li>;
          })}</ol>
          {progress?.currentAttempt ? <p className="mt-6 rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] p-4 text-sm font-semibold leading-6">Interactive submissions will be added in the next WorkSim task. Your canonical attempt is ready; no scores or completion can be changed here yet.</p> : null}
          <div className="mt-7">
            {detail === null ? <p className="inline-flex items-center gap-2 font-bold text-[var(--databloom-text-secondary)]"><LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> Loading assignment status…</p> : !detail.authenticated ? <Link href={loginHref()} className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[var(--databloom-action)] px-5 py-3 font-black text-[var(--databloom-text-on-accent)] shadow-sm transition hover:bg-[var(--databloom-action-hover)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--databloom-focus)]"><LockKeyhole size={18} aria-hidden="true" /> Sign in to start</Link> : progress?.currentAttempt ? <button type="button" disabled className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-5 py-3 font-black text-[var(--databloom-text-secondary)] opacity-80">Attempt in progress <ArrowRight size={18} aria-hidden="true" /></button> : progress?.bestCompletedAttempt ? <p className="font-bold text-[var(--databloom-text-secondary)]">Your completed result is ready to review. A new attempt will be available with the next interactive WorkSim task.</p> : <button type="button" onClick={() => void startOrResume()} disabled={starting} className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[var(--databloom-action)] px-5 py-3 font-black text-[var(--databloom-text-on-accent)] shadow-sm transition hover:bg-[var(--databloom-action-hover)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--databloom-focus)] disabled:cursor-not-allowed disabled:opacity-60">{starting ? "Starting…" : "Start assignment"} <PlayCircle size={18} aria-hidden="true" /></button>}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
