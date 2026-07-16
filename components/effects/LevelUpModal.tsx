"use client";

import { useEffect } from "react";
import { playLevelUpSound } from "@/lib/sounds";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { getBuddyPresentation } from "@/lib/userPreferences";

type LevelUpModalProps = {
  level: string;
  onClose: () => void;
};

export default function LevelUpModal({
  level,
  onClose,
}: LevelUpModalProps) {
  const preferences = useUserPreferences();
  const buddy = getBuddyPresentation(preferences);
  useEffect(() => {
    playLevelUpSound();

    const timer = setTimeout(() => {
      onClose();
    }, 4500);

    return () => clearTimeout(timer);
  }, [onClose]);

  function getMochiMessage() {
    switch (level) {
      case "🌸 Sakura Seedling":
        return "🐰 Every expert starts as a tiny sprout. Keep blooming!";
      case "🌱 Little Data Sprout":
        return "🌱 You're growing stronger every single day!";
      case "🐰 Excel Bunny":
        return `${buddy.emoji} ${buddy.name} loves your Excel skills!`;
      case "🍓 Formula Fairy":
        return "✨ Your formulas are becoming magical!";
      case "🌷 Data Gardener":
        return "🌿 You're growing a beautiful data garden!";
      case "🦋 Dashboard Butterfly":
        return "🦋 Your dashboards are taking flight!";
      case "🌙 Analytics Dreamer":
        return "🌙 You're beginning to think like an analyst!";
      case "☁️ Data Cloud Walker":
        return "☁️ You're reaching new heights!";
      case "🌺 Insight Blossom":
        return "🌺 Your insights are blooming beautifully!";
      case "👑 DataBloom Master":
        return "👑 Welcome to the legendary DataBloom Masters!";
      default:
        return `${buddy.emoji} ${buddy.name} is so proud of you!`;
    }
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="relative w-[90%] max-w-md rounded-3xl border border-pink-200 bg-white/90 p-8 shadow-2xl backdrop-blur-xl animate-[bounce_0.8s]">

        <div className="absolute -top-5 left-8 text-3xl animate-bounce">
          🌸
        </div>

        <div className="absolute -top-4 right-10 text-2xl animate-bounce">
          ✨
        </div>

        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-xl animate-ping">
          💖
        </div>

        <div className="absolute bottom-5 left-6 text-xl animate-bounce">
          🌷
        </div>

        <div className="absolute bottom-5 right-6 text-xl animate-bounce">
          ⭐
        </div>

        <div className="text-center">

          <div className="mb-4 text-7xl animate-bounce">
            🎉
          </div>

          <h2 className="text-3xl font-bold text-purple-700">
            Level Up!
          </h2>

          <p className="mt-3 text-gray-700">
            You reached a brand new milestone!
          </p>

          <div className="mt-5 rounded-2xl bg-pink-100 p-4 shadow">
            <div className="text-2xl font-bold">
              {level}
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-yellow-100 p-4">
            <p className="font-semibold text-yellow-700">
              🏆 New Achievement Unlocked
            </p>

            <p className="mt-2 text-gray-700">
              Keep completing daily quests to unlock even more rewards!
            </p>
          </div>

          <div className="mt-5 rounded-2xl bg-purple-100 p-4 text-purple-700 font-medium">
            {getMochiMessage()}
          </div>

          <button
            onClick={onClose}
            className="mt-7 rounded-xl bg-purple-500 px-6 py-3 text-white transition hover:bg-purple-600 active:scale-95"
          >
            Continue Growing 🌱
          </button>
        </div>
      </div>
    </div>
  );
}
