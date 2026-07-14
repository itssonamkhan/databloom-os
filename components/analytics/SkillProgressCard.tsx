"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import type { StudioProgress } from "@/lib/analytics";

export type SkillProgressCardProps = {
  studio: StudioProgress;
  delay?: number;
};

const studioPalette: Record<
  StudioProgress["id"],
  { bar: string; badge: string; border: string }
> = {
  excel: {
    bar: "from-emerald-500 to-teal-400",
    badge: "bg-emerald-100 text-emerald-800",
    border: "border-emerald-100",
  },
  sql: {
    bar: "from-sky-500 to-indigo-500",
    badge: "bg-sky-100 text-sky-800",
    border: "border-sky-100",
  },
  "power-bi": {
    bar: "from-amber-500 to-orange-400",
    badge: "bg-amber-100 text-amber-800",
    border: "border-amber-100",
  },
  "power-query": {
    bar: "from-teal-600 to-cyan-400",
    badge: "bg-teal-100 text-teal-800",
    border: "border-teal-100",
  },
  "business-analytics": {
    bar: "from-indigo-600 to-pink-400",
    badge: "bg-indigo-100 text-indigo-800",
    border: "border-indigo-100",
  },
  datasets: {
    bar: "from-violet-600 to-sky-400",
    badge: "bg-violet-100 text-violet-800",
    border: "border-violet-100",
  },
  python: {
    bar: "from-blue-500 to-yellow-400",
    badge: "bg-blue-100 text-blue-800",
    border: "border-blue-100",
  },
  statistics: {
    bar: "from-fuchsia-500 to-pink-500",
    badge: "bg-fuchsia-100 text-fuchsia-800",
    border: "border-fuchsia-100",
  },
  dashboards: {
    bar: "from-purple-500 to-violet-500",
    badge: "bg-purple-100 text-purple-800",
    border: "border-purple-100",
  },
};

function clampPercentage(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export default function SkillProgressCard({
  studio,
  delay = 0,
}: SkillProgressCardProps) {
  const reduceMotion = useReducedMotion();
  const palette = studioPalette[studio.id];
  const percentage = clampPercentage(studio.percentage);
  const isComplete = studio.total > 0 && studio.completed >= studio.total;

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, delay }}
      className={`min-w-0 rounded-3xl border ${palette.border} bg-white/85 p-5 shadow-md backdrop-blur-xl`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-2xl text-xl shadow-sm ${palette.badge}`}
          aria-hidden="true"
        >
          {studio.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="min-w-0 break-words font-bold text-slate-900">
              {studio.name}
            </h3>
            <span className="shrink-0 text-sm font-black text-slate-800">
              {percentage}%
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-600">
            {studio.completed} of {studio.total} completed
          </p>
        </div>
      </div>

      <div
        className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label={`${studio.name} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
      >
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${palette.bar}`}
          initial={reduceMotion ? false : { width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: reduceMotion ? 0 : 0.7, delay: delay + 0.1 }}
        />
      </div>

      {isComplete ? (
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
          <CheckCircle2 size={15} aria-hidden="true" /> Skill garden complete
        </p>
      ) : (
        <p className="mt-3 text-xs font-medium text-slate-600">
          {studio.total === 0
            ? "No lessons available yet"
            : `${Math.max(0, studio.total - studio.completed)} remaining`}
        </p>
      )}
    </motion.article>
  );
}
