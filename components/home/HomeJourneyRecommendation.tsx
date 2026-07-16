"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import type { StudioProgress } from "@/lib/analytics";
import { loadAnalyticsSnapshot } from "@/lib/analytics";
import { ANALYTICS_UPDATED_EVENT } from "@/lib/analyticsHistory";
import { playClickSound } from "@/lib/sounds";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { careerGoalStudyOrder } from "@/lib/userPreferences";

export default function HomeJourneyRecommendation() {
  const preferences = useUserPreferences();
  const [recommendation, setRecommendation] = useState<StudioProgress | null>(null);

  useEffect(() => {
    const sync = () => {
      const snapshot = loadAnalyticsSnapshot();
      const ordered = careerGoalStudyOrder[preferences.careerGoal]
        .map((id) => snapshot.studioProgress.find((studio) => studio.id === id))
        .filter((studio): studio is StudioProgress => Boolean(studio));
      setRecommendation(ordered.find((studio) => studio.percentage < 100) ?? ordered.at(-1) ?? null);
    };
    sync();
    window.addEventListener(ANALYTICS_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(ANALYTICS_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [preferences.careerGoal]);

  if (!recommendation) return null;

  return (
    <Link
      href={recommendation.href}
      onClick={playClickSound}
      className="mt-7 flex flex-col gap-4 rounded-3xl border border-purple-200 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 p-5 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700 sm:flex-row sm:items-center sm:justify-between sm:p-6"
    >
      <span className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-2xl shadow-sm" aria-hidden="true">{recommendation.icon}</span>
        <span>
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-purple-700"><Sparkles size={15} /> Continue your journey</span>
          <span className="mt-1 block text-xl font-black text-slate-950">{recommendation.name}</span>
          <span className="mt-1 block text-sm font-bold text-purple-700">Prioritized for your {preferences.careerGoal} goal</span>
          <span className="mt-1 block text-sm font-semibold text-slate-600">{recommendation.completed} of {recommendation.total} completed · {recommendation.percentage}% saved progress</span>
        </span>
      </span>
      <span className="inline-flex items-center gap-2 font-black text-purple-800">Continue <ArrowRight size={18} /></span>
    </Link>
  );
}
