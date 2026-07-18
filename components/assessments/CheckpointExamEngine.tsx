"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

import AppLayout from "@/components/layout/AppLayout";
import { useProgress } from "@/context/ProgressContext";
import {
  getStudioProgressEventName,
  isCheckpointUnlocked,
  loadCompletedStudioTopicIds,
  saveCheckpointPass,
  type CheckpointQuestion,
} from "@/lib/checkpointExams";
import {
  playClickSound,
  playNotificationSound,
  playSuccessSound,
  playXPSound,
} from "@/lib/sounds";
import type {
  StudioAssessmentConfiguration,
  StudioCheckpoint,
} from "@/lib/studioAssessments";

type ExamResult = {
  passed: boolean;
  correctCount: number;
  percentage: number;
  xpAwarded: number;
};

export default function CheckpointExamEngine({
  studio,
  checkpoint,
  questions,
}: {
  studio: StudioAssessmentConfiguration;
  checkpoint: StudioCheckpoint;
  questions: readonly CheckpointQuestion[];
}) {
  const { addXP } = useProgress();
  const [accessChecked, setAccessChecked] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ExamResult | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const syncAccess = () => {
      setUnlocked(
        isCheckpointUnlocked(
          checkpoint,
          loadCompletedStudioTopicIds(studio.studioId),
        ),
      );
      setAccessChecked(true);
    };
    const progressEvent = getStudioProgressEventName(studio.studioId);
    syncAccess();
    window.addEventListener(progressEvent, syncAccess);
    window.addEventListener("storage", syncAccess);
    return () => {
      window.removeEventListener(progressEvent, syncAccess);
      window.removeEventListener("storage", syncAccess);
    };
  }, [checkpoint, studio.studioId]);

  if (!accessChecked) {
    return (
      <AppLayout>
        <div className="rounded-3xl border border-purple-100 bg-white/80 p-8 font-bold text-slate-700 shadow-md">
          Checking checkpoint access…
        </div>
      </AppLayout>
    );
  }

  if (!unlocked) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-purple-100 bg-white/80 p-8 text-center shadow-lg backdrop-blur-xl sm:p-10">
          <LockKeyhole className="mx-auto text-purple-700" size={42} aria-hidden="true" />
          <h1 className="mt-5 text-3xl font-black text-slate-950">Checkpoint locked</h1>
          <p className="mt-3 leading-7 text-slate-600">
            Complete every lesson in {checkpoint.coverage.chapterNames.join(", ")} before starting this checkpoint.
          </p>
          <Link
            href={studio.studioRoute}
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-purple-700 px-6 py-3 font-black text-white hover:bg-purple-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
          >
            <ArrowLeft size={18} aria-hidden="true" /> Back to {studio.studioName}
          </Link>
        </div>
      </AppLayout>
    );
  }

  if (questions.length === 0) {
    return (
      <AppLayout>
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-slate-800 shadow-md">
          <h1 className="text-2xl font-black">Checkpoint questions unavailable</h1>
          <p className="mt-2">No existing lesson questions could be prepared for this checkpoint.</p>
          <Link href={studio.studioRoute} className="mt-5 inline-flex font-black text-purple-800">
            Return to {studio.studioName}
          </Link>
        </div>
      </AppLayout>
    );
  }

  if (result) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-4xl space-y-6 text-slate-950">
          <section
            className={`rounded-[2rem] border p-8 text-center shadow-lg backdrop-blur-xl sm:p-10 ${
              result.passed
                ? "border-emerald-200 bg-emerald-50/90"
                : "border-amber-200 bg-amber-50/90"
            }`}
          >
            {result.passed ? (
              <CheckCircle2 className="mx-auto text-emerald-700" size={48} aria-hidden="true" />
            ) : (
              <RotateCcw className="mx-auto text-amber-700" size={48} aria-hidden="true" />
            )}
            <p className="mt-5 text-sm font-black uppercase tracking-wider text-purple-700">
              {studio.studioName}
            </p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              {result.passed ? "Checkpoint passed!" : "Review and retry"}
            </h1>
            <p className="mt-4 text-lg font-bold text-slate-700">
              {result.correctCount} of {questions.length} correct · {result.percentage}%
            </p>
            <p className="mt-3 text-slate-600">
              Passing score: {checkpoint.suggestedPassingScore}%
            </p>
            <div className="mx-auto mt-6 max-w-2xl rounded-2xl bg-white/80 p-5 text-left text-slate-700 shadow-sm">
              <p className="font-black text-purple-800">🌸 Mochi says</p>
              <p className="mt-2 leading-7">
                {result.passed
                  ? "Beautiful work! You connected the chapter ideas and reached this learning milestone."
                  : "You’re still growing. Review the covered lessons, then come back for another calm try."}
              </p>
              {result.xpAwarded > 0 && (
                <p className="mt-3 font-black text-emerald-700">
                  +{result.xpAwarded} XP earned once
                </p>
              )}
            </div>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={studio.studioRoute}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-purple-200 bg-white px-6 py-3 font-black text-purple-800 hover:bg-purple-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
              >
                <ArrowLeft size={18} aria-hidden="true" /> Back to studio
              </Link>
              {!result.passed && (
                <button
                  type="button"
                  onClick={retry}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-purple-700 px-6 py-3 font-black text-white hover:bg-purple-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                >
                  <RotateCcw size={18} aria-hidden="true" /> Retry checkpoint
                </button>
              )}
            </div>
          </section>
        </div>
      </AppLayout>
    );
  }

  const question = questions[currentIndex];
  const selectedAnswer = answers[question.id];
  const progress = Math.round(((currentIndex + 1) / questions.length) * 100);
  const isFinalQuestion = currentIndex === questions.length - 1;

  function retry() {
    playClickSound();
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    setMessage("");
  }

  function submitExam() {
    playClickSound();
    if (Object.keys(answers).length !== questions.length) {
      setMessage("Answer every question before submitting your checkpoint.");
      return;
    }

    const correctCount = questions.filter(
      (item) => answers[item.id] === item.correctAnswer,
    ).length;
    const percentage = Math.round((correctCount / questions.length) * 100);
    const passed = percentage >= checkpoint.suggestedPassingScore;
    let xpAwarded = 0;

    if (passed) {
      const saved = saveCheckpointPass({
        studioId: studio.studioId,
        checkpointId: checkpoint.id,
        score: percentage,
        passingScore: checkpoint.suggestedPassingScore,
      });
      if (saved.xpAwarded) {
        xpAwarded = checkpoint.xpReward;
        addXP(checkpoint.xpReward);
        playXPSound();
      }
      playSuccessSound();
    } else {
      playNotificationSound();
    }

    setResult({ passed, correctCount, percentage, xpAwarded });
    setMessage("");
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6 text-slate-950">
        <Link
          href={studio.studioRoute}
          className="inline-flex items-center gap-2 font-black text-purple-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
        >
          <ArrowLeft size={18} aria-hidden="true" /> Back to {studio.studioName}
        </Link>

        <header className="rounded-[2rem] border border-white/80 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-7 shadow-lg sm:p-9">
          <p className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-purple-700">
            <Sparkles size={17} aria-hidden="true" /> {studio.studioName}
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">{checkpoint.name}</h1>
          <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold text-slate-700">
            <span className="rounded-full bg-white/80 px-4 py-2">{questions.length} questions</span>
            <span className="rounded-full bg-white/80 px-4 py-2">Pass at {checkpoint.suggestedPassingScore}%</span>
            <span className="rounded-full bg-white/80 px-4 py-2">+{checkpoint.xpReward} XP first pass</span>
          </div>
        </header>

        <section className="rounded-[2rem] border border-purple-100 bg-white/80 p-6 shadow-lg backdrop-blur-xl sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <p className="font-black text-purple-800">
              Question {currentIndex + 1} of {questions.length}
            </p>
            <span className="text-sm font-bold text-slate-600">{progress}%</span>
          </div>
          <div
            className="mt-3 h-3 overflow-hidden rounded-full bg-purple-100"
            role="progressbar"
            aria-label="Checkpoint progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <fieldset className="mt-8">
            <legend className="text-xl font-black leading-8 sm:text-2xl">
              {question.prompt}
            </legend>
            <div className="mt-6 grid gap-3">
              {question.options.map((option) => {
                const selected = selectedAnswer === option;
                return (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 font-semibold transition focus-within:ring-2 focus-within:ring-purple-500 ${
                      selected
                        ? "border-purple-400 bg-purple-100 text-purple-950"
                        : "border-purple-100 bg-white text-slate-700 hover:bg-purple-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={selected}
                      onChange={() => {
                        setAnswers((current) => ({ ...current, [question.id]: option }));
                        setMessage("");
                      }}
                      className="mt-1 size-4 accent-purple-700"
                    />
                    <span className="min-w-0 break-words">{option}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <p className="mt-4 min-h-6 text-sm font-bold text-rose-700" aria-live="polite">
            {message}
          </p>

          <div className="mt-5 flex flex-col-reverse justify-between gap-3 sm:flex-row">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => {
                playClickSound();
                setCurrentIndex((current) => Math.max(0, current - 1));
                setMessage("");
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-purple-200 bg-white px-6 py-3 font-black text-purple-800 hover:bg-purple-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            >
              <ArrowLeft size={18} aria-hidden="true" /> Previous
            </button>

            {isFinalQuestion ? (
              <button
                type="button"
                onClick={submitExam}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              >
                Submit checkpoint <CheckCircle2 size={18} aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!selectedAnswer}
                onClick={() => {
                  playClickSound();
                  setCurrentIndex((current) => Math.min(questions.length - 1, current + 1));
                  setMessage("");
                }}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-purple-700 px-6 py-3 font-black text-white hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-purple-200 disabled:text-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
              >
                Next <ArrowRight size={18} aria-hidden="true" />
              </button>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
