"use client";

import { LoaderCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type WorkSimRetryButtonProps = {
  simulationId: string;
  workspacePath: string;
  onStarted?: () => void;
};

export default function WorkSimRetryButton({
  simulationId,
  workspacePath,
  onStarted,
}: WorkSimRetryButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function startNewAttempt() {
    if (submitting) return;
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/work-sims/${simulationId}/attempt/retry`,
        {
          method: "POST",
          cache: "no-store",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        },
      );

      if (response.status === 401) {
        router.replace(`/login?next=${encodeURIComponent(workspacePath)}`);
        return;
      }

      if (!response.ok) {
        setError(
          response.status === 409
            ? "A newer WorkSim attempt is already available. Open it to continue safely."
            : "Your new WorkSim attempt could not be started. Please try again.",
        );
        return;
      }

      setConfirming(false);
      onStarted?.();
      router.replace(workspacePath);
      router.refresh();
    } catch {
      setError("Your new WorkSim attempt could not be started. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => {
          setError("");
          setConfirming(true);
        }}
        className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-5 py-3 font-black text-[var(--databloom-text-primary)] shadow-sm transition hover:bg-[var(--databloom-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--databloom-focus)]"
      >
        <RefreshCw size={18} aria-hidden="true" /> Try Again
      </button>
    );
  }

  return (
    <div
      className="rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] p-4"
      role="group"
      aria-labelledby="work-sim-retry-title"
    >
      <p id="work-sim-retry-title" className="font-black">
        Start a new attempt?
      </p>
      <p className="mt-1 text-sm leading-6 text-[var(--databloom-text-secondary)]">
        Your completed attempts stay in your history. This opens the next numbered attempt from the first stage.
      </p>
      {error ? (
        <p className="mt-3 text-sm font-semibold text-[var(--databloom-text-secondary)]" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            if (!submitting) {
              setConfirming(false);
              setError("");
            }
          }}
          disabled={submitting}
          className="inline-flex min-h-11 items-center rounded-2xl px-4 py-2 font-black text-[var(--databloom-text-accent)] transition hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--databloom-focus)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void startNewAttempt()}
          disabled={submitting}
          className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[var(--databloom-action)] px-5 py-3 font-black text-[var(--databloom-text-on-accent)] shadow-sm transition hover:bg-[var(--databloom-action-hover)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--databloom-focus)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? <LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> : <RefreshCw size={18} aria-hidden="true" />}
          {submitting ? "Starting…" : "Start new attempt"}
        </button>
      </div>
    </div>
  );
}
