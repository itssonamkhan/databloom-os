"use client";

import Link from "next/link";
import { useState } from "react";

import XPToast from "@/components/effects/XPToast";
import { useProgress } from "@/context/ProgressContext";
import { useMochiAssistant } from "@/hooks/useMochiAssistant";
import {
  playClickSound,
  playSuccessSound,
  playXPSound,
} from "@/lib/sounds";

export default function MochiMission() {
  const { addXP } = useProgress();
  const { assistant, completeMission } = useMochiAssistant();
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
          <div className="text-5xl" aria-hidden="true">🐰</div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Mochi Mission</h2>
            <p className="text-gray-600">Daily challenge from Mochi 🌸</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-yellow-100 p-4">
          <h3 className="font-bold text-gray-800">🎯 {mission.title}</h3>
          <p className="mt-2 text-gray-600">{mission.description}</p>
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
