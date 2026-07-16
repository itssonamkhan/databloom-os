"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  FlaskConical,
  Lightbulb,
  Sparkles,
  Table2,
  Trophy,
} from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import { useProgress } from "@/context/ProgressContext";
import {
  completePracticeTask,
  DASHBOARD_PRACTICE_EVENT,
  DASHBOARD_PRACTICE_STORAGE_KEY,
  getPracticeProject,
  getPracticeTaskKey,
  isPracticeAnswerCorrect,
  loadDashboardPracticeState,
  type PracticeProjectId,
  type PracticeTask,
} from "@/lib/dashboardPractice";
import {
  playClickSound,
  playNotificationSound,
  playSuccessSound,
  playXPSound,
} from "@/lib/sounds";
import { registerStudyActivity } from "@/lib/studyActivity";

type Feedback = {
  tone: "correct" | "incorrect" | "warning";
  message: string;
};

type ProjectPracticeProps = {
  projectId: PracticeProjectId;
};

export default function ProjectPractice({
  projectId,
}: ProjectPracticeProps) {
  const project = getPracticeProject(projectId);
  const { addXP } = useProgress();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [visibleHints, setVisibleHints] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({});
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false);

  useEffect(() => {
    function syncProgress() {
      setCompletedTaskIds(
        loadDashboardPracticeState().completedTaskIds,
      );
      setHasLoadedProgress(true);
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === DASHBOARD_PRACTICE_STORAGE_KEY) {
        syncProgress();
      }
    }

    syncProgress();
    window.addEventListener(DASHBOARD_PRACTICE_EVENT, syncProgress);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(DASHBOARD_PRACTICE_EVENT, syncProgress);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const completedCount = useMemo(
    () =>
      project.tasks.filter((task) =>
        completedTaskIds.includes(getPracticeTaskKey(project.id, task.id)),
      ).length,
    [completedTaskIds, project],
  );

  const totalXP = project.tasks.reduce(
    (total, task) => total + task.xpReward,
    0,
  );
  const progressPercentage = (completedCount / project.tasks.length) * 100;

  function toggleHint(taskId: string) {
    playClickSound();
    setVisibleHints((currentHints) =>
      currentHints.includes(taskId)
        ? currentHints.filter((id) => id !== taskId)
        : [...currentHints, taskId],
    );
  }

  function updateAnswer(taskId: string, value: string) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [taskId]: value,
    }));

    setFeedback((currentFeedback) => {
      if (!currentFeedback[taskId]) return currentFeedback;

      const nextFeedback = { ...currentFeedback };
      delete nextFeedback[taskId];
      return nextFeedback;
    });
  }

  function checkAnswer(task: PracticeTask) {
    playClickSound();
    const answer = answers[task.id] ?? "";

    if (!answer.trim()) {
      setFeedback((currentFeedback) => ({
        ...currentFeedback,
        [task.id]: {
          tone: "warning",
          message: "Enter an answer before checking this task.",
        },
      }));
      return;
    }

    if (!isPracticeAnswerCorrect(task, answer)) {
      playNotificationSound();
      setFeedback((currentFeedback) => ({
        ...currentFeedback,
        [task.id]: {
          tone: "incorrect",
          message:
            "Not quite yet. Recheck the dataset, use the hint if needed, and try again.",
        },
      }));
      return;
    }

    const result = completePracticeTask(project.id, task.id);

    if (!result.saved) {
      playSuccessSound();
      setFeedback((currentFeedback) => ({
        ...currentFeedback,
        [task.id]: {
          tone: "warning",
          message:
            "That answer is correct, but progress could not be saved. XP was not added so it cannot be duplicated.",
        },
      }));
      return;
    }

    setCompletedTaskIds(result.state.completedTaskIds);
    playSuccessSound();

    if (result.newlyRewarded) {
      addXP(task.xpReward);
      registerStudyActivity({ kind: "practice", source: `dashboard-practice:${project.id}:${task.id}`, minutes: 10, xp: task.xpReward });
      playXPSound();
    }

    setFeedback((currentFeedback) => ({
      ...currentFeedback,
      [task.id]: {
        tone: "correct",
        message: result.newlyRewarded
          ? `Correct! You earned ${task.xpReward} XP and completed this task.`
          : "Correct! This task was already completed, so XP was not added again.",
      },
    }));
  }

  return (
    <AppLayout>
      <div className="space-y-7 text-slate-900">
        <Link
          href="/practice"
          onClick={playClickSound}
          className="inline-flex items-center gap-2 rounded-xl px-2 py-2 font-semibold text-purple-800 transition hover:bg-white/80 hover:text-purple-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700"
        >
          <ArrowLeft aria-hidden="true" size={18} />
          Back to Project Practice
        </Link>

        <header className="rounded-3xl border border-purple-200 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-7 shadow-lg sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-bold text-purple-900 shadow-sm">
                <FlaskConical aria-hidden="true" size={17} />
                Dashboard Practice · {project.focus}
              </p>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
                <span aria-hidden="true">{project.icon}</span>{" "}
                {project.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-slate-700 sm:text-lg">
                {project.description} Complete each task once to earn up to{" "}
                {totalXP} XP.
              </p>
            </div>

            <div className="min-w-64 rounded-2xl border border-white/80 bg-white/85 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="font-bold text-slate-800">Your progress</span>
                <span className="font-black text-purple-800">
                  {hasLoadedProgress ? completedCount : "—"} /{" "}
                  {project.tasks.length}
                </span>
              </div>
              <div
                className="mt-3 h-3 overflow-hidden rounded-full bg-purple-100"
                role="progressbar"
                aria-label={`${project.title} practice progress`}
                aria-valuemin={0}
                aria-valuemax={project.tasks.length}
                aria-valuenow={completedCount}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 transition-[width] duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-lg sm:p-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-blue-800">
                <Table2 aria-hidden="true" size={17} />
                Dataset preview
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">
                {project.dataset.name}
              </h2>
            </div>
            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-900">
              {project.dataset.rows.length} records
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full border-collapse text-left text-sm">
              <caption className="sr-only">
                Data used for the {project.title} tasks
              </caption>
              <thead className="bg-slate-900 text-white">
                <tr>
                  {project.dataset.columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="whitespace-nowrap px-4 py-3 font-bold"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {project.dataset.rows.map((row, rowIndex) => (
                  <tr key={`${project.id}-row-${rowIndex}`}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={`${project.id}-${rowIndex}-${cellIndex}`}
                        className="whitespace-nowrap px-4 py-3 font-medium text-slate-700"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="analyst-tasks-heading" className="space-y-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-purple-800">
              Analyst challenge
            </p>
            <h2
              id="analyst-tasks-heading"
              className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl"
            >
              Complete all 3 tasks
            </h2>
          </div>

          {project.tasks.map((task, taskIndex) => {
            const taskKey = getPracticeTaskKey(project.id, task.id);
            const isCompleted = completedTaskIds.includes(taskKey);
            const isHintVisible = visibleHints.includes(task.id);
            const taskFeedback = feedback[task.id];
            const inputId = `${project.id}-${task.id}-answer`;
            const hintId = `${project.id}-${task.id}-hint`;

            return (
              <article
                key={task.id}
                className="rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-lg sm:p-8"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-100 font-black text-purple-900">
                        {taskIndex + 1}
                      </span>
                      <h3 className="text-xl font-black text-slate-950 sm:text-2xl">
                        {task.title}
                      </h3>
                    </div>
                    <p className="mt-4 font-medium leading-7 text-slate-700">
                      {task.prompt}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start rounded-full bg-amber-100 px-4 py-2 text-sm font-black text-amber-950">
                    {isCompleted ? (
                      <CheckCircle2 aria-hidden="true" size={18} />
                    ) : (
                      <Circle aria-hidden="true" size={18} />
                    )}
                    {isCompleted ? "Completed" : `+${task.xpReward} XP`}
                  </div>
                </div>

                <form
                  className="mt-6"
                  onSubmit={(event) => {
                    event.preventDefault();
                    checkAnswer(task);
                  }}
                >
                  <label
                    htmlFor={inputId}
                    className="mb-2 block text-sm font-bold text-slate-800"
                  >
                    Your answer
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      id={inputId}
                      value={answers[task.id] ?? ""}
                      onChange={(event) =>
                        updateAnswer(task.id, event.target.value)
                      }
                      placeholder={task.answerPlaceholder}
                      autoComplete="off"
                      className="min-w-0 flex-1 rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 font-semibold text-slate-950 outline-none placeholder:text-slate-500 focus:border-purple-600 focus:ring-4 focus:ring-purple-100"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-700 px-5 py-3 font-bold text-white shadow-md transition hover:bg-purple-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700"
                    >
                      <CheckCircle2 aria-hidden="true" size={19} />
                      Check Answer
                    </button>
                    <button
                      type="button"
                      aria-expanded={isHintVisible}
                      aria-controls={hintId}
                      onClick={() => toggleHint(task.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-amber-300 bg-amber-50 px-5 py-3 font-bold text-amber-950 transition hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
                    >
                      <Lightbulb aria-hidden="true" size={19} />
                      {isHintVisible ? "Hide Hint" : "Hint"}
                    </button>
                  </div>
                </form>

                {isHintVisible ? (
                  <div
                    id={hintId}
                    className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 font-medium leading-6 text-amber-950"
                  >
                    <span className="font-black">Hint:</span> {task.hint}
                  </div>
                ) : null}

                {taskFeedback ? (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`mt-4 rounded-2xl border p-4 font-bold leading-6 ${
                      taskFeedback.tone === "correct"
                        ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                        : taskFeedback.tone === "incorrect"
                          ? "border-rose-300 bg-rose-50 text-rose-950"
                          : "border-amber-300 bg-amber-50 text-amber-950"
                    }`}
                  >
                    {taskFeedback.message}
                  </div>
                ) : null}
              </article>
            );
          })}
        </section>

        {completedCount === project.tasks.length ? (
          <section className="rounded-3xl border border-emerald-300 bg-gradient-to-r from-emerald-100 via-white to-yellow-100 p-7 text-center shadow-lg sm:p-9">
            <Trophy
              aria-hidden="true"
              className="mx-auto text-emerald-800"
              size={42}
            />
            <h2 className="mt-3 text-2xl font-black text-slate-950">
              Practice set complete!
            </h2>
            <p className="mt-2 font-semibold text-slate-700">
              You solved all three {project.title.toLowerCase()} tasks. Your
              progress and rewards are saved on this device.
            </p>
            <Link
              href="/practice"
              onClick={playClickSound}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 font-bold text-white shadow-md transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              <Sparkles aria-hidden="true" size={19} />
              Choose another dataset
            </Link>
          </section>
        ) : null}
      </div>
    </AppLayout>
  );
}
