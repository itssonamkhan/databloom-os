"use client";

import { useEffect, useState } from "react";

import { useProgress } from "@/context/ProgressContext";
import { getCurrentLevel } from "@/lib/levels";
import {
  getTimeGreeting,
  loadUserPreferences,
  USER_PREFERENCES_EVENT,
} from "@/lib/userPreferences";

export default function WelcomeHero() {
  const { xp } = useProgress();
  const [userName, setUserName] = useState(
    () => loadUserPreferences().userName,
  );
  const [greeting, setGreeting] = useState(() => getTimeGreeting());

  useEffect(() => {
    const syncName = () => setUserName(loadUserPreferences().userName);
    const syncGreeting = () => setGreeting(getTimeGreeting());
    const timer = window.setInterval(syncGreeting, 60_000);
    window.addEventListener(USER_PREFERENCES_EVENT, syncName);
    window.addEventListener("storage", syncName);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(USER_PREFERENCES_EVENT, syncName);
      window.removeEventListener("storage", syncName);
    };
  }, []);

  const currentLevel = getCurrentLevel(xp);

  return (
    <div className="rounded-3xl bg-white/40 backdrop-blur-xl p-8 shadow-lg border border-white/50">
      <p className="text-sm font-medium text-purple-600">
        🌸 Welcome back
      </p>

      <h1 className="mt-2 text-4xl font-bold text-gray-900">
        {greeting} {userName || "Data Learner"} 🌸
      </h1>

      <p className="mt-3 text-lg text-gray-700">
        Ready to grow your Data Analyst skills today?
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
      </div>
    </div>
  );
}
