"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";

export type XPProgressCardProps = {
  xp: number;
  currentLevelName: string;
  currentLevelMinXP: number;
  currentBadge?: string;
  nextLevelName?: string;
  nextLevelMinXP?: number | null;
};

function clampPercentage(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export default function XPProgressCard({
  xp,
  currentLevelName,
  currentLevelMinXP,
  currentBadge,
  nextLevelName,
  nextLevelMinXP,
}: XPProgressCardProps) {
  const reduceMotion = useReducedMotion();
  const isMaximumLevel =
    !nextLevelName ||
    nextLevelMinXP === null ||
    nextLevelMinXP === undefined;
  const levelSpan = isMaximumLevel
    ? 0
    : Math.max(1, nextLevelMinXP - currentLevelMinXP);
  const progress = isMaximumLevel
    ? 100
    : clampPercentage(((xp - currentLevelMinXP) / levelSpan) * 100);
  const remaining = isMaximumLevel ? 0 : Math.max(0, nextLevelMinXP - xp);

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.4 }}
      className="relative min-w-0 overflow-hidden rounded-[2rem] border border-white/80 bg-gradient-to-br from-purple-100 via-pink-50 to-sky-100 p-6 shadow-lg sm:p-7"
      aria-labelledby="analytics-xp-heading"
    >
      <div
        className="pointer-events-none absolute -right-14 -top-16 size-48 rounded-full bg-white/50 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-purple-700">
            <Sparkles size={16} aria-hidden="true" /> XP progress
          </p>
          <h2
            id="analytics-xp-heading"
            className="mt-2 break-words text-2xl font-black text-slate-950"
          >
            {currentLevelName}
          </h2>
          {currentBadge ? (
            <p className="mt-2 text-sm font-semibold text-slate-700">
              Badge: {currentBadge}
            </p>
          ) : null}
        </div>
        <div className="shrink-0 rounded-2xl bg-white/75 px-5 py-3 text-left shadow-sm sm:text-right">
          <p className="text-3xl font-black text-purple-800">
            {Math.max(0, xp).toLocaleString()}
          </p>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Total XP
          </p>
        </div>
      </div>

      <div className="relative mt-7">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-slate-700">
          <span>{progress}% through this level</span>
          <span>
            {isMaximumLevel
              ? "Maximum level reached"
              : `${remaining.toLocaleString()} XP to ${nextLevelName}`}
          </span>
        </div>
        <div
          className="mt-3 h-4 overflow-hidden rounded-full border border-white/80 bg-white/70 shadow-inner"
          role="progressbar"
          aria-label="XP toward the next level"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500"
            initial={reduceMotion ? false : { width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: reduceMotion ? 0 : 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="relative mt-5 flex flex-wrap gap-3 text-xs font-bold text-slate-700">
        <span className="rounded-full bg-white/70 px-3 py-2">
          Level starts at {currentLevelMinXP.toLocaleString()} XP
        </span>
        {isMaximumLevel ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-2 text-amber-800">
            <Crown size={14} aria-hidden="true" /> DataBloom legend
          </span>
        ) : (
          <span className="rounded-full bg-white/70 px-3 py-2">
            Next at {nextLevelMinXP.toLocaleString()} XP
          </span>
        )}
      </div>
    </motion.section>
  );
}
