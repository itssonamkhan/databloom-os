import { CheckCircle2, Sparkles } from "lucide-react";

type ProgressCardProps = {
  completed: boolean;
  xpReward: number;
  onComplete: () => void;
};

export default function ProgressCard({
  completed,
  xpReward,
  onComplete,
}: ProgressCardProps) {
  const percentage = completed ? 100 : 0;

  return (
    <section className="rounded-3xl border border-purple-100 bg-white/85 p-6 shadow-lg sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-purple-700">
            Project progress
          </p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">
            {completed ? "Project completed" : "Ready to bloom?"}
          </h2>
          <p className="mt-2 text-gray-700">
            {completed
              ? `You earned ${xpReward} XP for this project.`
              : `Finish the project to earn ${xpReward} XP.`}
          </p>
        </div>

        <button
          type="button"
          onClick={onComplete}
          disabled={completed}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-100 disabled:text-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          {completed ? (
            <CheckCircle2 size={19} aria-hidden="true" />
          ) : (
            <Sparkles size={19} aria-hidden="true" />
          )}
          {completed ? "Completed" : "Mark as completed"}
        </button>
      </div>

      <div
        className="mt-6 h-4 overflow-hidden rounded-full bg-purple-100"
        role="progressbar"
        aria-label="Project completion"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 transition-[width] duration-700"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-2 text-right text-sm font-bold text-purple-800">
        {percentage}% completed
      </p>
    </section>
  );
}
