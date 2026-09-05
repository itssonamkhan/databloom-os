"use client";

import { useEffect, useState } from "react";

import { loadTodayStats, STUDY_STATS_UPDATED_EVENT } from "@/lib/stats";

type TodayProgress = {
  lessons: number;
  minutes: number;
  xp: number;
};

const EMPTY_PROGRESS: TodayProgress = {
  lessons: 0,
  minutes: 0,
  xp: 0,
};

function readTodayProgress(): TodayProgress {
  const stats = loadTodayStats();
  return {
    lessons: stats.lessons,
    minutes: stats.minutes,
    xp: stats.xpEarned,
  };
}

export default function StudyStats() {
  const [progress, setProgress] = useState<TodayProgress>(EMPTY_PROGRESS);

  useEffect(() => {
    const refresh = () => setProgress(readTodayProgress());
    refresh();
    window.addEventListener(STUDY_STATS_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(STUDY_STATS_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <div className="rounded-3xl border border-white/50 bg-white/40 p-6 shadow-lg backdrop-blur-xl">
      <h2 className="text-xl font-bold text-gray-800">
        📊 Today’s Progress
      </h2>

      <p className="mt-2 text-gray-600">
        Your learning journey today 🌸
      </p>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white/60 p-4 text-center">
          <h3 className="text-2xl font-bold text-gray-800">
            {progress.lessons}
          </h3>
          <p className="text-sm text-gray-600">Lessons</p>
        </div>

        <div className="rounded-2xl bg-white/60 p-4 text-center">
          <h3 className="text-2xl font-bold text-gray-800">
            {progress.minutes}
          </h3>
          <p className="text-sm text-gray-600">Minutes</p>
        </div>

        <div className="rounded-2xl bg-white/60 p-4 text-center">
          <h3 className="text-2xl font-bold text-gray-800">
            {progress.xp}
          </h3>
          <p className="text-sm text-gray-600">XP</p>
        </div>
      </div>
    </div>
  );
}
