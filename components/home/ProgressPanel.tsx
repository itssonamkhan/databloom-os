"use client";

import { useProgress } from "@/context/ProgressContext";
import { getCurrentLevel, levels } from "@/lib/levels";
import LevelUpModal from "@/components/effects/LevelUpModal";

export default function ProgressPanel() {
  const {
    xp,
    levelUp,
    currentLevelName,
    dismissLevelUp,
  } = useProgress();

  const currentLevel = getCurrentLevel(xp);

  const currentIndex = levels.findIndex(
    (level) => level.name === currentLevel.name
  );

  const nextLevel = levels[currentIndex + 1];

  const progress = nextLevel
    ? ((xp - currentLevel.minXP) /
        (nextLevel.minXP - currentLevel.minXP)) *
      100
    : 100;

  return (
    <>
      {levelUp && (
        <LevelUpModal
          level={currentLevelName}
          onClose={dismissLevelUp}
        />
      )}

      <div className="rounded-3xl bg-white/40 backdrop-blur-xl p-6 shadow-lg border border-white/50">

        <h2 className="text-xl font-bold text-gray-800">
          {currentLevel.name}
        </h2>

        <p className="mt-2 text-gray-600">
          Your Data Analyst journey is blooming 🌸
        </p>

        <div className="mt-5">

          <div className="flex justify-between text-sm text-gray-700">

            <span>XP Progress</span>

            <span>{xp} XP</span>

          </div>

          <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-200">

            <div
              className="h-3 rounded-full bg-purple-400 transition-all duration-700"
              style={{
                width: `${Math.min(progress, 100)}%`,
              }}
            />

          </div>

        </div>

        <div className="mt-5 rounded-2xl bg-pink-100 p-3 text-gray-700">

          🏆 Badge:

          <span className="ml-1 font-semibold">

            {currentLevel.badge}

          </span>

        </div>

        <div className="mt-3 rounded-2xl bg-purple-100 p-3 text-gray-700">

          {nextLevel ? (
            <>
              🌱 Next:

              <span className="ml-1 font-semibold">

                {nextLevel.name}

              </span>
            </>
          ) : (
            "👑 Maximum DataBloom Level Reached"
          )}

        </div>

      </div>
    </>
  );
}
