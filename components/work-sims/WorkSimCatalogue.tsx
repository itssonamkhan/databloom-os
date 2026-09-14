"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BriefcaseBusiness, CircleCheck, Clock3, LoaderCircle, LockKeyhole, Sparkles } from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import type { WorkSimPublicCatalogueItem } from "@/lib/workSims/catalog";

type WorkSimStatus = "not_started" | "in_progress" | "completed";
type CatalogueResponse = {
  authenticated: boolean;
  simulations: Array<{ simulation: WorkSimPublicCatalogueItem; status: WorkSimStatus }>;
};

function statusLabel(status: WorkSimStatus) {
  if (status === "in_progress") return "In progress";
  if (status === "completed") return "Completed";
  return "Not started";
}

export default function WorkSimCatalogue() {
  const [data, setData] = useState<CatalogueResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    void fetch("/api/work-sims", { cache: "no-store", credentials: "same-origin" })
      .then(async (response) => {
        const payload = (await response.json()) as CatalogueResponse;
        if (!response.ok || !Array.isArray(payload.simulations)) throw new Error("Unavailable");
        if (active) setData(payload);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => { active = false; };
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8 text-[var(--databloom-text-primary)]">
        <header className="databloom-phase3-gradient-surface rounded-3xl border border-[var(--databloom-border)] p-6 shadow-lg sm:p-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-4 py-2 text-sm font-black text-[var(--databloom-text-accent)]">
            <BriefcaseBusiness size={18} aria-hidden="true" /> Applied learning
          </p>
          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">Data Analyst WorkSims</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--databloom-text-secondary)]">
            Step into realistic, fictional workplace assignments that bring your data skills together.
          </p>
        </header>

        {error ? (
          <section className="databloom-phase3-surface rounded-3xl border border-[var(--databloom-border)] p-7 text-center shadow-sm" role="alert">
            <h2 className="text-2xl font-black">WorkSims are temporarily unavailable</h2>
            <p className="mt-3 text-[var(--databloom-text-secondary)]">Please refresh the page and try again.</p>
          </section>
        ) : !data ? (
          <section className="databloom-phase3-surface flex min-h-48 items-center justify-center rounded-3xl border border-[var(--databloom-border)] p-7 shadow-sm" aria-live="polite">
            <LoaderCircle className="animate-spin text-[var(--databloom-text-accent)]" aria-hidden="true" />
            <span className="ml-3 font-bold text-[var(--databloom-text-secondary)]">Loading WorkSims…</span>
          </section>
        ) : (
          <section aria-labelledby="available-work-sims" className="space-y-5">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--databloom-text-accent)]">Available assignment</p>
              <h2 id="available-work-sims" className="mt-1 text-3xl font-black">Learn by doing</h2>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {data.simulations.map(({ simulation, status }) => {
                const authenticated = data.authenticated;
                const action = status === "in_progress" ? "Continue" : status === "completed" ? "Review result" : "View assignment";
                return (
                  <article key={simulation.id} className="databloom-phase3-surface flex min-w-0 flex-col rounded-3xl border border-[var(--databloom-border)] p-6 shadow-md sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--databloom-text-accent)]">{simulation.label}</p>
                        <h3 className="mt-2 text-3xl font-black tracking-tight">{simulation.title}</h3>
                        <p className="mt-1 font-bold text-[var(--databloom-text-secondary)]">{simulation.company}</p>
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-full border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-3 py-1.5 text-sm font-black text-[var(--databloom-text-primary)]">
                        <CircleCheck size={16} aria-hidden="true" /> {statusLabel(status)}
                      </span>
                    </div>
                    <p className="mt-5 leading-7 text-[var(--databloom-text-secondary)]">{simulation.summary}</p>
                    <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] p-3">
                        <dt className="font-bold text-[var(--databloom-text-muted)]">Dataset</dt>
                        <dd className="mt-1 font-black">{simulation.datasetVersion}</dd>
                      </div>
                      <div className="rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] p-3">
                        <dt className="font-bold text-[var(--databloom-text-muted)]">Structure</dt>
                        <dd className="mt-1 font-black">{simulation.stages.length} stages · {simulation.maximumScore} points</dd>
                      </div>
                    </dl>
                    <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--databloom-text-secondary)]"><Clock3 size={16} aria-hidden="true" /> Estimated time: {simulation.estimatedTime}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {simulation.skills.map((skill) => <span key={skill} className="rounded-full border border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] px-3 py-1.5 text-sm font-bold">{skill}</span>)}
                    </div>
                    <div className="mt-7">
                      {authenticated ? (
                        <Link href={`/work-sims/${simulation.id}`} className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[var(--databloom-action)] px-5 py-3 font-black text-[var(--databloom-text-on-accent)] shadow-sm transition hover:bg-[var(--databloom-action-hover)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--databloom-focus)]">
                          {action} <ArrowRight size={18} aria-hidden="true" />
                        </Link>
                      ) : (
                        <Link href={`/login?next=${encodeURIComponent(`/work-sims/${simulation.id}`)}`} className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-5 py-3 font-black text-[var(--databloom-text-primary)] shadow-sm transition hover:bg-[var(--databloom-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--databloom-focus)]">
                          <LockKeyhole size={18} aria-hidden="true" /> Sign in to start
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <p className="flex items-start gap-2 rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] p-4 text-sm leading-6 text-[var(--databloom-text-secondary)]">
          <Sparkles className="mt-0.5 shrink-0 text-[var(--databloom-text-accent)]" size={17} aria-hidden="true" />
          WorkSims use fictional data for educational practice. You can explore the assignment as a guest; an account is needed to start a tracked attempt.
        </p>
      </div>
    </AppLayout>
  );
}
