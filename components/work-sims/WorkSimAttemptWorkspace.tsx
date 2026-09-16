"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Download,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  Send,
  Trophy,
} from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import {
  getWorkSimCatalogueItem,
  type WorkSimPublicCatalogueItem,
} from "@/lib/workSims/catalog";
import type { RetailProfitCrisisAssignment } from "@/lib/workSims/retailProfitCrisisAssignments";

const simulationId = "retail-profit-crisis-v1";
const briefingPath = `/work-sims/${simulationId}`;
const workspacePath = `${briefingPath}/attempt`;

type Attempt = {
  attemptNumber: number;
  score: number;
  maximumScore: number;
};

type CurrentStageResponse = {
  assignment: RetailProfitCrisisAssignment;
  attempt: Attempt;
};

type WorkSimProgress = {
  currentAttempt: Attempt | null;
  bestCompletedAttempt: (Attempt & { status: string }) | null;
};

type WorkSimDetailResponse = {
  authenticated: boolean;
  simulation: WorkSimPublicCatalogueItem;
  progress: WorkSimProgress | null;
};

type SubmissionResponse = {
  stage: {
    id: string;
    score: number;
    maximumScore: number;
    completionState: string;
  };
  attempt: Attempt & { status: "in_progress" | "completed"; completedAt: string | null };
  feedback: { message: string };
};

type Completion = {
  attemptNumber: number;
  score: number;
  maximumScore: number;
};

type SubmissionNotice = {
  stageTitle: string;
  score: number;
  maximumScore: number;
  attemptScore: number;
  attemptMaximumScore: number;
  message: string;
};

function loginHref() {
  return `/login?next=${encodeURIComponent(workspacePath)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function hasAnswer(question: RetailProfitCrisisAssignment["questions"][number], value: unknown) {
  if (question.type === "boolean") return value === true;
  if (question.type === "multi_select") {
    return Array.isArray(value)
      && value.length >= question.minimumSelections
      && value.length <= question.maximumSelections;
  }
  if (question.type === "numeric") {
    return typeof value === "number"
      && Number.isFinite(value)
      && value >= question.minimum
      && value <= question.maximum;
  }
  return typeof value === "string" && value.length > 0;
}

function includesChoice(value: unknown, choiceId: string) {
  return Array.isArray(value) && value.some((entry) => typeof entry === "string" && entry === choiceId);
}

function numericAnswerValue(value: unknown): number | "" {
  return typeof value === "number" ? value : "";
}

export default function WorkSimAttemptWorkspace() {
  const router = useRouter();
  const simulation = getWorkSimCatalogueItem(simulationId)!;
  const [current, setCurrent] = useState<CurrentStageResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<SubmissionNotice | null>(null);
  const [completion, setCompletion] = useState<Completion | null>(null);

  const loadCurrentStage = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/work-sims/${simulationId}/attempt/stage`, {
        cache: "no-store",
        credentials: "same-origin",
      });
      const payload = await readJson(response);

      if (response.status === 401) {
        router.replace(loginHref());
        return;
      }

      if (response.ok && isRecord(payload) && isRecord(payload.assignment) && isRecord(payload.attempt)) {
        setCurrent(payload as unknown as CurrentStageResponse);
        setAnswers({});
        setCompletion(null);
        return;
      }

      if (response.status === 404) {
        const detailResponse = await fetch(`/api/work-sims/${simulationId}`, {
          cache: "no-store",
          credentials: "same-origin",
        });
        const detailPayload = await readJson(detailResponse);
        if (detailResponse.status === 401 || (isRecord(detailPayload) && detailPayload.authenticated === false)) {
          router.replace(loginHref());
          return;
        }
        if (detailResponse.ok && isRecord(detailPayload) && isRecord(detailPayload.progress)) {
          const detail = detailPayload as unknown as WorkSimDetailResponse;
          if (detail.progress?.bestCompletedAttempt) {
            setCurrent(null);
            setCompletion(detail.progress.bestCompletedAttempt);
            return;
          }
        }
        setCurrent(null);
        setError("There is no active assignment yet. Start the WorkSim from its briefing.");
        return;
      }

      setError("Your assignment could not be loaded. Please try again.");
    } catch {
      setError("Your assignment could not be loaded. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const requestId = window.setTimeout(() => {
      void loadCurrentStage();
    }, 0);
    return () => window.clearTimeout(requestId);
  }, [loadCurrentStage]);

  const currentStageIndex = useMemo(() => {
    if (!current) return -1;
    return simulation.stages.findIndex((stage) => stage.id === current.assignment.stageId);
  }, [current, simulation.stages]);

  const readyToSubmit = Boolean(current) && current!.assignment.questions.every((question) => hasAnswer(question, answers[question.id]));

  function updateAnswer(questionId: string, value: unknown) {
    setAnswers((previous) => ({ ...previous, [questionId]: value }));
  }

  function toggleMultiSelect(questionId: string, choiceId: string) {
    setAnswers((previous) => {
      const selected = Array.isArray(previous[questionId]) ? previous[questionId].filter((value): value is string => typeof value === "string") : [];
      const next = selected.includes(choiceId)
        ? selected.filter((value) => value !== choiceId)
        : [...selected, choiceId];
      return { ...previous, [questionId]: next };
    });
  }

  async function submitStage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!current || !readyToSubmit || submitting) return;

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`/api/work-sims/${simulationId}/attempt/stage`, {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId: current.assignment.stageId, answers }),
      });
      const payload = await readJson(response);

      if (response.status === 401) {
        router.replace(loginHref());
        return;
      }
      if (!response.ok || !isRecord(payload) || !isRecord(payload.stage) || !isRecord(payload.attempt) || !isRecord(payload.feedback)) {
        if (response.status === 409) {
          setError("This stage was already updated in another tab or request. Refresh the assignment to continue safely.");
        } else if (response.status === 400) {
          setError("Please review your responses and submit the current stage again.");
        } else {
          setError("Your stage could not be submitted. Your responses are still here, so you can try again.");
        }
        return;
      }

      const result = payload as unknown as SubmissionResponse;
      setNotice({
        stageTitle: current.assignment.title,
        score: result.stage.score,
        maximumScore: result.stage.maximumScore,
        attemptScore: result.attempt.score,
        attemptMaximumScore: result.attempt.maximumScore,
        message: result.feedback.message,
      });

      if (result.attempt.status === "completed") {
        setCurrent(null);
        setAnswers({});
        setCompletion({
          attemptNumber: current.attempt.attemptNumber,
          score: result.attempt.score,
          maximumScore: result.attempt.maximumScore,
        });
      } else {
        await loadCurrentStage();
      }
    } catch {
      setError("Your stage could not be submitted. Your responses are still here, so you can try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <div className="space-y-7 text-[var(--databloom-text-primary)]">
        <Link href={briefingPath} className="inline-flex min-h-11 items-center gap-2 rounded-2xl px-2 py-2 font-bold text-[var(--databloom-text-accent)] transition hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--databloom-focus)]">
          <ArrowLeft size={18} aria-hidden="true" /> Back to briefing
        </Link>

        <header className="databloom-phase3-gradient-surface rounded-3xl border border-[var(--databloom-border)] p-6 shadow-lg sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--databloom-text-accent)]">{simulation.label} · {simulation.company}</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{simulation.title}</h1>
          <p className="mt-3 max-w-3xl leading-7 text-[var(--databloom-text-secondary)]">Work through the ordered assignment stages. Your score is calculated securely when you submit each stage.</p>
        </header>

        {notice ? <section className="rounded-3xl border border-[var(--databloom-border)] bg-[var(--databloom-accent-soft)] p-5 shadow-sm" aria-live="polite">
          <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-[var(--databloom-text-accent)]" aria-hidden="true" /><div><h2 className="font-black">{notice.stageTitle} submitted</h2><p className="mt-1 leading-6 text-[var(--databloom-text-secondary)]">{notice.message} Stage score: {notice.score}/{notice.maximumScore}. Attempt score: {notice.attemptScore}/{notice.attemptMaximumScore}.</p></div></div>
        </section> : null}

        {error ? <section className="rounded-3xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] p-5" role="alert"><p className="font-semibold leading-6 text-[var(--databloom-text-secondary)]">{error}</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => void loadCurrentStage()} className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-4 py-2 font-black transition hover:bg-[var(--databloom-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--databloom-focus)]"><RefreshCw size={17} aria-hidden="true" /> Try again</button><Link href={briefingPath} className="inline-flex min-h-11 items-center rounded-2xl px-4 py-2 font-black text-[var(--databloom-text-accent)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--databloom-focus)]">View briefing</Link></div></section> : null}

        {loading ? <section className="databloom-phase3-surface flex min-h-56 items-center justify-center rounded-3xl border border-[var(--databloom-border)] p-6 shadow-sm" aria-live="polite"><LoaderCircle className="animate-spin text-[var(--databloom-text-accent)]" aria-hidden="true" /><span className="ml-3 font-bold text-[var(--databloom-text-secondary)]">Loading your assignment…</span></section> : null}

        {completion ? <section className="databloom-phase3-surface rounded-3xl border border-[var(--databloom-border)] p-6 shadow-sm sm:p-8" aria-labelledby="work-sim-complete"><div className="flex flex-wrap items-start gap-4"><span className="grid size-12 place-items-center rounded-full bg-[var(--databloom-accent-soft)] text-[var(--databloom-text-accent)]"><Trophy aria-hidden="true" /></span><div className="min-w-0"><p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--databloom-text-accent)]">Assignment complete</p><h2 id="work-sim-complete" className="mt-1 text-3xl font-black">You completed the WorkSim</h2><p className="mt-3 max-w-2xl leading-7 text-[var(--databloom-text-secondary)]">Attempt {completion.attemptNumber} finished with a canonical score of {completion.score}/{completion.maximumScore}. Keep your findings and recommendations as evidence of your analysis practice.</p></div></div><Link href={briefingPath} className="mt-6 inline-flex min-h-11 items-center rounded-2xl bg-[var(--databloom-action)] px-5 py-3 font-black text-[var(--databloom-text-on-accent)] shadow-sm transition hover:bg-[var(--databloom-action-hover)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--databloom-focus)]">Return to briefing</Link></section> : null}

        {current ? <section className="grid min-w-0 gap-6 xl:grid-cols-[0.7fr_1.3fr]">
          <aside className="databloom-phase3-surface min-w-0 rounded-3xl border border-[var(--databloom-border)] p-5 shadow-sm sm:p-6" aria-label="Assignment progress">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--databloom-text-accent)]">Attempt {current.attempt.attemptNumber}</p>
            <p className="mt-2 text-2xl font-black">{current.attempt.score}/{current.attempt.maximumScore} points</p>
            <ol className="mt-6 space-y-3">{simulation.stages.map((stage, index) => {
              const completed = index < currentStageIndex;
              const active = index === currentStageIndex;
              return <li key={stage.id} className="flex min-w-0 items-start gap-3"><span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-[var(--databloom-border)] bg-[var(--databloom-glass)] text-[var(--databloom-text-accent)]">{completed ? <CheckCircle2 size={16} aria-label="Completed" /> : active ? <Circle size={16} fill="currentColor" aria-label="Current stage" /> : <LockKeyhole size={14} aria-label="Locked" />}</span><div className="min-w-0"><p className="font-black">{index + 1}. {stage.title}</p><p className="text-sm leading-5 text-[var(--databloom-text-secondary)]">{active ? `Current · ${stage.maximumScore} points` : completed ? "Completed" : `Locked · ${stage.maximumScore} points`}</p></div></li>;
            })}</ol>
          </aside>

          <form onSubmit={submitStage} className="databloom-phase3-surface min-w-0 rounded-3xl border border-[var(--databloom-border)] p-6 shadow-sm sm:p-8" noValidate>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--databloom-text-accent)]">Stage {currentStageIndex + 1} of {simulation.stages.length} · {current.assignment.maximumScore} points</p>
            <h2 className="mt-2 text-3xl font-black">{current.assignment.title}</h2>
            <p className="mt-4 max-w-3xl leading-7 text-[var(--databloom-text-secondary)]">{current.assignment.instructions}</p>

            <div className="mt-7 space-y-7">{current.assignment.questions.map((question, questionIndex) => <fieldset key={question.id} className="min-w-0 rounded-3xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] p-5"><legend className="px-1 text-lg font-black">{questionIndex + 1}. {question.prompt}</legend>
              {question.type === "single_select" ? <div className="mt-4 space-y-3">{question.choices.map((choice) => <label key={choice.id} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl border border-[var(--databloom-border)] p-3 transition hover:bg-[var(--databloom-accent-soft)]"><input type="radio" name={question.id} value={choice.id} checked={answers[question.id] === choice.id} onChange={() => updateAnswer(question.id, choice.id)} className="mt-1 size-4 accent-[var(--databloom-action)]" /><span className="leading-6">{choice.label}</span></label>)}</div> : null}
              {question.type === "multi_select" ? <div className="mt-4 space-y-3"><p className="text-sm font-semibold text-[var(--databloom-text-secondary)]">Select {question.minimumSelections === question.maximumSelections ? question.minimumSelections : `${question.minimumSelections} to ${question.maximumSelections}`} options.</p>{question.choices.map((choice) => { const selected = includesChoice(answers[question.id], choice.id); return <label key={choice.id} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl border border-[var(--databloom-border)] p-3 transition hover:bg-[var(--databloom-accent-soft)]"><input type="checkbox" checked={selected} onChange={() => toggleMultiSelect(question.id, choice.id)} className="mt-1 size-4 rounded accent-[var(--databloom-action)]" /><span className="leading-6">{choice.label}</span></label>; })}</div> : null}
              {question.type === "numeric" ? <div className="mt-4 max-w-md"><label htmlFor={question.id} className="block font-bold">Answer in {question.unit}</label><input id={question.id} name={question.id} type="number" min={question.minimum} max={question.maximum} step="any" inputMode="decimal" value={numericAnswerValue(answers[question.id])} onChange={(event) => { const rawValue = event.target.value; updateAnswer(question.id, rawValue === "" ? "" : Number(rawValue)); }} className="mt-2 min-h-11 w-full rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-4 py-2 font-semibold text-[var(--databloom-text-primary)] outline-none transition focus:border-[var(--databloom-focus)] focus:ring-2 focus:ring-[var(--databloom-focus)]" /></div> : null}
              {question.type === "boolean" ? <label className="mt-4 flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl border border-[var(--databloom-border)] p-3 transition hover:bg-[var(--databloom-accent-soft)]"><input type="checkbox" checked={answers[question.id] === true} onChange={(event) => updateAnswer(question.id, event.target.checked)} className="mt-1 size-4 rounded accent-[var(--databloom-action)]" /><span className="leading-6">Confirm</span></label> : null}
            </fieldset>)}</div>

            <div className="mt-7 flex flex-wrap items-center gap-4"><button type="submit" disabled={!readyToSubmit || submitting} className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[var(--databloom-action)] px-5 py-3 font-black text-[var(--databloom-text-on-accent)] shadow-sm transition hover:bg-[var(--databloom-action-hover)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--databloom-focus)] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? <LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}{submitting ? "Submitting…" : "Submit stage"}</button><p className="text-sm font-semibold text-[var(--databloom-text-secondary)]">Your answers stay only in this page while you work.</p></div>
          </form>
        </section> : null}

        {!loading && !completion ? <details className="databloom-phase3-surface rounded-3xl border border-[var(--databloom-border)] p-5 shadow-sm"><summary className="cursor-pointer font-black text-[var(--databloom-text-primary)]">Dataset reference files</summary><p className="mt-3 leading-6 text-[var(--databloom-text-secondary)]">Use the fictional dataset and data dictionary as you work through the assignment.</p><div className="mt-4 flex flex-wrap gap-3">{simulation.datasetFiles.map((file) => <a key={file.file} href={file.path} download className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-4 py-2 font-bold transition hover:bg-[var(--databloom-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--databloom-focus)]"><Download size={16} aria-hidden="true" /> {file.label}</a>)}<a href={simulation.dataDictionaryPath} download className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-4 py-2 font-bold transition hover:bg-[var(--databloom-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--databloom-focus)]"><Download size={16} aria-hidden="true" /> Data dictionary</a></div></details> : null}
      </div>
    </AppLayout>
  );
}
