"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type AnalyticsStatCardTone =
  | "purple"
  | "pink"
  | "blue"
  | "green"
  | "amber"
  | "orange";

export type AnalyticsStatCardProps = {
  label: string;
  value: string | number;
  detail?: string;
  icon?: ReactNode;
  tone?: AnalyticsStatCardTone;
  delay?: number;
};

const toneStyles: Record<
  AnalyticsStatCardTone,
  { glow: string; icon: string; value: string }
> = {
  purple: {
    glow: "from-purple-100/90 to-fuchsia-50/80",
    icon: "bg-purple-100 text-purple-700",
    value: "text-purple-800",
  },
  pink: {
    glow: "from-pink-100/90 to-rose-50/80",
    icon: "bg-pink-100 text-pink-700",
    value: "text-pink-800",
  },
  blue: {
    glow: "from-sky-100/90 to-indigo-50/80",
    icon: "bg-sky-100 text-sky-700",
    value: "text-sky-800",
  },
  green: {
    glow: "from-emerald-100/90 to-teal-50/80",
    icon: "bg-emerald-100 text-emerald-700",
    value: "text-emerald-800",
  },
  amber: {
    glow: "from-amber-100/90 to-yellow-50/80",
    icon: "bg-amber-100 text-amber-700",
    value: "text-amber-800",
  },
  orange: {
    glow: "from-orange-100/90 to-rose-50/80",
    icon: "bg-orange-100 text-orange-700",
    value: "text-orange-800",
  },
};

export default function AnalyticsStatCard({
  label,
  value,
  detail,
  icon,
  tone = "purple",
  delay = 0,
}: AnalyticsStatCardProps) {
  const reduceMotion = useReducedMotion();
  const styles = toneStyles[tone];

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, delay }}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      className={`relative min-w-0 overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br ${styles.glow} p-5 shadow-md backdrop-blur-xl`}
      aria-label={`${label}: ${value}`}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-white/45 blur-2xl"
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-700">{label}</p>
          <p className={`mt-2 break-words text-2xl font-black ${styles.value}`}>
            {value}
          </p>
        </div>
        {icon ? (
          <div
            className={`flex size-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ${styles.icon}`}
            aria-hidden="true"
          >
            {icon}
          </div>
        ) : null}
      </div>
      {detail ? (
        <p className="relative mt-3 text-xs font-medium leading-5 text-slate-600">
          {detail}
        </p>
      ) : null}
    </motion.article>
  );
}
