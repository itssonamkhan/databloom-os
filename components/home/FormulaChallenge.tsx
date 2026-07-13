"use client";

import { useState } from "react";
import { useProgress } from "@/context/ProgressContext";
import { getTodayFormulaChallenge } from "@/lib/formulaChallenges";
import XPToast from "@/components/effects/XPToast";
import {
  playClickSound,
  playSuccessSound,
  playXPSound,
} from "@/lib/sounds";

export default function FormulaChallenge() {
  const { addXP } = useProgress();

  const challenge = getTodayFormulaChallenge();

  const [completed, setCompleted] = useState(false);

  const [xpPopup, setXpPopup] = useState<number | null>(null);

  function completeChallenge() {
    playClickSound();

    if (!completed) {
      addXP(challenge.reward);

      playXPSound();

      playSuccessSound();

      setXpPopup(challenge.reward);

      setCompleted(true);
    }
  }

  return (
    <>
      {xpPopup && (
        <XPToast
          xp={xpPopup}
          onClose={() => setXpPopup(null)}
        />
      )}

      <div className="rounded-3xl bg-white/40 backdrop-blur-xl p-6 shadow-lg border border-purple-200/50">
        <div className="flex items-center gap-3">
          <div className="text-4xl">
            📚
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Formula Challenge
            </h2>

            <p className="text-gray-600">
              Daily Excel learning quest 🌸
            </p>
          </div>
        </div>

        <div className="mt-5 bg-purple-100 rounded-2xl p-4">
          <h3 className="font-bold text-gray-800">
            {challenge.title}
          </h3>

          <p className="mt-2 text-gray-700">
            {challenge.description}
          </p>

          <p className="mt-2 text-purple-700 font-semibold">
            Reward: +{challenge.reward} XP ✨
          </p>
        </div>

        <button
          onClick={completeChallenge}
          disabled={completed}
          className={`
            mt-5
            rounded-xl
            px-5
            py-2
            shadow-sm
            ${
              completed
                ? "bg-green-100 text-green-700"
                : "bg-white text-purple-700 hover:bg-purple-50"
            }
          `}
        >
          {completed
            ? "✅ Challenge Completed"
            : "Complete Challenge"}
        </button>
      </div>
    </>
  );
}