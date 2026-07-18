"use client";

import LevelUpCelebration from "@/components/effects/LevelUpCelebration";
import { useProgress } from "@/context/ProgressContext";
import { levels } from "@/lib/levels";

type LevelUpModalProps = {
  level: string;
  onClose: () => void;
};

export default function LevelUpModal({
  level,
  onClose,
}: LevelUpModalProps) {
  const { xp } = useProgress();
  const levelIndex = Math.max(
    0,
    levels.findIndex((candidate) => candidate.name === level),
  );
  const newLevel = levels[levelIndex];
  const previousLevel = levels[Math.max(0, levelIndex - 1)];

  return (
    <LevelUpCelebration
      celebration={{ previousLevel, newLevel, currentXP: xp }}
      onClose={onClose}
    />
  );
}
