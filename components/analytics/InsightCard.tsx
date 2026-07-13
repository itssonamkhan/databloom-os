"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Lightbulb } from "lucide-react";

export type InsightCardProps = {
  title?: string;
  insight: string;
  detail?: string;
  icon?: ReactNode;
  actionLabel?: string;
  actionHref?: string;
};

export default function InsightCard({
  title = "Your personal insight",
  insight,
  detail,
  icon,
  actionLabel,
  actionHref,
}: InsightCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.4 }}
      className="relative min-w-0 overflow-hidden rounded-[2rem] border border-white/80 bg-gradient-to-br from-fuchsia-100 via-pink-50 to-amber-50 p-6 shadow-lg sm:p-7"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-white/55 blur-3xl"
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/75 text-fuchsia-700 shadow-sm">
          {icon ?? <Lightbulb size={24} aria-hidden="true" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-fuchsia-700">
            {title}
          </p>
          <p className="mt-2 break-words text-xl font-black leading-8 text-slate-950">
            {insight}
          </p>
          {detail ? (
            <p className="mt-2 text-sm leading-6 text-slate-700">{detail}</p>
          ) : null}
          {actionLabel && actionHref ? (
            <Link
              href={actionHref}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-fuchsia-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-fuchsia-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-700"
            >
              {actionLabel} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </div>
    </motion.section>
  );
}
