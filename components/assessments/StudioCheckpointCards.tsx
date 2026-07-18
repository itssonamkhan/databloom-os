"use client";

import Link from "next/link";
import { CheckCircle2, ClipboardCheck, LockKeyhole } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  CHECKPOINT_PROGRESS_EVENT,
  getStudioAssessmentConfiguration,
  getStudioProgressEventName,
  isCheckpointUnlocked,
  loadCheckpointProgress,
  loadCompletedStudioTopicIds,
  type CheckpointProgressState,
} from "@/lib/checkpointExams";
import type { AssessableStudioId } from "@/lib/studioAssessments";

export default function StudioCheckpointCards({
  studioId,
}: {
  studioId: AssessableStudioId;
}) {
  const studio = getStudioAssessmentConfiguration(studioId);
  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>([]);
  const [checkpointProgress, setCheckpointProgress] =
    useState<CheckpointProgressState>(() => loadCheckpointProgress());

  useEffect(() => {
    const sync = () => {
      setCompletedTopicIds(loadCompletedStudioTopicIds(studioId));
      setCheckpointProgress(loadCheckpointProgress());
    };
    const studioEvent = getStudioProgressEventName(studioId);
    sync();
    window.addEventListener(studioEvent, sync);
    window.addEventListener(CHECKPOINT_PROGRESS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(studioEvent, sync);
      window.removeEventListener(CHECKPOINT_PROGRESS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [studioId]);

  const completed = useMemo(() => new Set(completedTopicIds), [completedTopicIds]);
  if (!studio) return null;

  return (
    <section aria-labelledby={`${studioId}-checkpoints-heading`}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-purple-700">
            <ClipboardCheck size={17} aria-hidden="true" /> Chapter milestones
          </p>
          <h2
            id={`${studioId}-checkpoints-heading`}
            className="mt-1 text-3xl font-black text-slate-950"
          >
            Checkpoint exams
          </h2>
          <p className="mt-2 max-w-3xl text-slate-600">
            Each checkpoint unlocks after every lesson in its chapter group is complete.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {studio.checkpoints.map((checkpoint) => {
          const unlocked = isCheckpointUnlocked(checkpoint, completedTopicIds);
          const remaining = checkpoint.unlockRequirement.requiredTopicIds.filter(
            (topicId) => !completed.has(topicId),
          ).length;
          const completion =
            checkpointProgress.completions[`${studioId}:${checkpoint.id}`];

          return (
            <article
              key={checkpoint.id}
              className="flex min-h-64 flex-col rounded-3xl border border-purple-100 bg-white/80 p-6 shadow-md backdrop-blur-xl"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-800">
                  {checkpoint.coverage.topicIds.length} topics
                </span>
                {completion ? (
                  <span className="inline-flex items-center gap-1 text-sm font-black text-emerald-700">
                    <CheckCircle2 size={17} aria-hidden="true" /> Passed
                  </span>
                ) : !unlocked ? (
                  <LockKeyhole size={19} className="text-slate-500" aria-label="Locked" />
                ) : null}
              </div>

              <h3 className="mt-4 text-xl font-black text-slate-950">
                {checkpoint.name}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {checkpoint.coverage.chapterNames.join(" · ")}
              </p>

              <div className="mt-auto pt-5">
                {completion ? (
                  <p className="mb-3 text-sm font-bold text-emerald-700">
                    Best score: {completion.bestScore}%
                  </p>
                ) : !unlocked ? (
                  <p className="mb-3 text-sm font-bold text-slate-600">
                    Complete {remaining} more {remaining === 1 ? "lesson" : "lessons"} to unlock.
                  </p>
                ) : (
                  <p className="mb-3 text-sm font-bold text-purple-700">
                    Ready · Pass at {checkpoint.suggestedPassingScore}%
                  </p>
                )}

                {unlocked ? (
                  <Link
                    href={`/checkpoint/${studioId}/${checkpoint.id}`}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-purple-700 px-5 py-3 font-black text-white transition hover:bg-purple-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                  >
                    {completion ? "Review checkpoint" : "Start checkpoint"}
                  </Link>
                ) : (
                  <span className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-slate-100 px-5 py-3 font-black text-slate-500">
                    Locked
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
