"use client";

import { useEffect, useState } from "react";

import { useProgress } from "@/context/ProgressContext";
import { getCurrentLevel } from "@/lib/levels";
import {
  getTimeGreeting,
} from "@/lib/userPreferences";
import { useUserPreferences } from "@/hooks/useUserPreferences";

export default function WelcomeHero() {
  const { xp } = useProgress();
  const preferences = useUserPreferences();
  const [greeting, setGreeting] = useState(() => getTimeGreeting());

  useEffect(() => {
    const syncGreeting = () => setGreeting(getTimeGreeting());
    const timer = window.setInterval(syncGreeting, 60_000);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const currentLevel = getCurrentLevel(xp);

  return (
    <div className="rounded-3xl bg-white/40 backdrop-blur-xl p-8 shadow-lg border border-white/50">
      <p className="text-sm font-medium text-purple-600">
        🌸 Welcome back
      </p>

      <h1 className="mt-2 text-4xl font-bold text-gray-900">
        {greeting} {preferences.userName || "Learner"} 🌸
      </h1>

      <p className="mt-3 text-lg text-gray-700">
        Ready to grow toward {preferences.careerGoal} today?
      </p>

      <div className="mt-6 flex flex-wrap gap-4">
        <div className="flex items-center gap-2 rounded-2xl bg-pink-100 px-5 py-3 font-semibold text-gray-800 shadow-sm">
          <span className="text-xl">🔥</span>
          <span>7 Day Streak</span>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-purple-100 px-5 py-3 font-semibold text-gray-800 shadow-sm">
          <span className="text-xl">⭐</span>
          <span>{currentLevel.name}</span>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-blue-100 px-5 py-3 font-semibold text-gray-800 shadow-sm">
          <span className="text-xl">⏱️</span>
          <span>{preferences.dailyGoal} min daily goal</span>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-rose-100 px-5 py-3 font-semibold text-gray-800 shadow-sm">
          <span className="text-xl">🎨</span>
          <span>{preferences.theme} theme</span>
        </div>
      </div>
    </div>
  );
}
