"use client";

import Link from "next/link";
import { ArrowRight, LoaderCircle, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

import type {
  WorkSimPublicCatalogueItem,
  WorkSimResultSummary,
} from "@/lib/workSims/catalog";

type WorkSimStatus = "not_started" | "in_progress" | "completed";

type WorkSimResultsResponse = {
  authenticated: boolean;
  simulations: Array<{
    simulation: WorkSimPublicCatalogueItem;
    status: WorkSimStatus;
    result: WorkSimResultSummary | null;
  }>;
};

function statusLabel(status: WorkSimStatus) {
  if (status === "completed") return "Completed";
  if (status === "in_progress") return "In progress";
  return "Not started";
}

function dateLabel(value: string | null) {
  if (!value) return "Not completed yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Completion date unavailable";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function WorkSimResults() {
  const [data, setData] = useState<WorkSimResultsResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/work-sims", {
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = (await response.json()) as WorkSimResultsResponse;
        if (!response.ok || !Array.isArray(payload.simulations)) throw new Error("Unavailable");
        setData(payload);
      })
      .catch((caught: unknown) => {
        if (!(caught instanceof DOMException && caught.name === "AbortError")) {
          setError(true);
        }
      });

    return () => controller.abort();
  }, []);

  return (
    <section aria-labelledby="profile-work-sim-results">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--databloom-text-accent)]">
            Applied learning
          </p>
          <h2 id="profile-work-sim-results" className="mt-1 text-2xl font-black text-[var(--databloom-text-primary)]">
            WorkSim Results
          </h2>
          <p className="mt-1 text-sm text-[var(--databloom-text-secondary)]">
            Your server-recorded WorkSim progress and completed results.
          </p>
        </div>
        <Link
          href="/work-sims"
          className="inline-flex min-h-11 items-center gap-2 rounded-2xl px-3 py-2 font-black text-[var(--databloom-text-accent)] transition hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--databloom-focus)]"
        >
          View WorkSims <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      {error ? (
        <div className="databloom-phase3-surface mt-5 rounded-3xl border border-[var(--databloom-border)] p-5 text-sm font-semibold text-[var(--databloom-text-secondary)]" role="alert">
          WorkSim results are temporarily unavailable. Please refresh to try again.
        </div>
      ) : !data ? (
        <div className="databloom-phase3-surface mt-5 flex min-h-28 items-center rounded-3xl border border-[var(--databloom-border)] p-5 text-sm font-semibold text-[var(--databloom-text-secondary)]" aria-live="polite">
          <LoaderCircle className="mr-3 animate-spin text-[var(--databloom-text-accent)]" size={18} aria-hidden="true" />
          Loading WorkSim results…
        </div>
      ) : !data.authenticated ? (
        <div className="databloom-phase3-surface mt-5 rounded-3xl border border-[var(--databloom-border)] p-5 text-sm leading-6 text-[var(--databloom-text-secondary)]">
          Sign in to keep WorkSim progress and completed results with your account.
        </div>
      ) : (
        <div className="mt-5 grid gap-4">
          {data.simulations.map(({ simulation, status, result }) => (
            <article key={simulation.id} className="databloom-phase3-surface min-w-0 rounded-3xl border border-[var(--databloom-border)] p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--databloom-text-accent)]">
                    {simulation.label}
                  </p>
                  <h3 className="mt-1 text-xl font-black text-[var(--databloom-text-primary)]">
                    {simulation.title}
                  </h3>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-3 py-1.5 text-sm font-black text-[var(--databloom-text-primary)]">
                  <Trophy size={16} aria-hidden="true" /> {statusLabel(status)}
                </span>
              </div>
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] p-3">
                  <dt className="font-bold text-[var(--databloom-text-muted)]">Latest score</dt>
                  <dd className="mt-1 font-black">{result?.latestScore ?? 0}/{result?.maximumScore ?? simulation.maximumScore}</dd>
                </div>
                <div className="rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] p-3">
                  <dt className="font-bold text-[var(--databloom-text-muted)]">Best score</dt>
                  <dd className="mt-1 font-black">{result?.bestScore ?? 0}/{result?.maximumScore ?? simulation.maximumScore}</dd>
                </div>
                <div className="rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] p-3">
                  <dt className="font-bold text-[var(--databloom-text-muted)]">Last completed</dt>
                  <dd className="mt-1 font-black">{dateLabel(result?.completedAt ?? null)}</dd>
                </div>
                <div className="rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] p-3">
                  <dt className="font-bold text-[var(--databloom-text-muted)]">Attempts</dt>
                  <dd className="mt-1 font-black">{result?.attemptCount ?? 0}</dd>
                </div>
              </dl>
              <Link
                href={`/work-sims/${simulation.id}`}
                className="mt-5 inline-flex min-h-11 items-center gap-2 font-black text-[var(--databloom-text-accent)] transition hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--databloom-focus)]"
              >
                Open WorkSim <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
