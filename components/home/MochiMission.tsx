"use client";

import Link from "next/link";
import { useState } from "react";

import XPToast from "@/components/effects/XPToast";
import { useProgress } from "@/context/ProgressContext";
import { useMochiAssistant } from "@/hooks/useMochiAssistant";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import {
  getBuddyPresentation,
  personalizeBuddyText,
} from "@/lib/userPreferences";
import {
  playClickSound,
  playSuccessSound,
  playXPSound,
} from "@/lib/sounds";

export default function MochiMission() {
  const { addXP } = useProgress();
  const { assistant, completeMission } = useMochiAssistant();
  const preferences = useUserPreferences();
  const buddy = getBuddyPresentation(preferences);
  const [xpPopup, setXpPopup] = useState<number | null>(null);

  const { mission, missionCompleted } = assistant;

  function handleComplete() {
    playClickSound();
    if (missionCompleted) return;

    addXP(mission.reward);
    completeMission();
    playXPSound();
    playSuccessSound();
    setXpPopup(mission.reward);
  }

  return (
    <>
      {xpPopup && <XPToast xp={xpPopup} onClose={() => setXpPopup(null)} />}

      <div className="rounded-3xl border border-yellow-200/50 bg-white/40 p-6 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="text-5xl" aria-hidden="true">{buddy.emoji}</div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{buddy.name} Mission</h2>
            <p className="text-gray-600">Daily challenge from {buddy.name} 🌸</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-yellow-100 p-4">
          <h3 className="font-bold text-gray-800">🎯 {personalizeBuddyText(mission.title, preferences)}</h3>
          <p className="mt-2 text-gray-600">{personalizeBuddyText(mission.description, preferences)}</p>
          <p className="mt-2 font-semibold text-purple-700">
            Reward: +{mission.reward} XP ✨
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={mission.href}
            onClick={playClickSound}
            className="rounded-xl bg-white px-5 py-2 font-semibold text-purple-700 shadow-sm transition-colors hover:bg-purple-50"
          >
            Open mission
          </Link>
          <button
            type="button"
            onClick={handleComplete}
            disabled={missionCompleted}
            className={`rounded-xl px-5 py-2 font-semibold shadow-sm transition-colors ${
              missionCompleted
                ? "bg-green-100 text-green-700"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            {missionCompleted ? "✅ Mission Completed" : "Complete Mission"}
          </button>
        </div>
      </div>
    </>
  );
}
