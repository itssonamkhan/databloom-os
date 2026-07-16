import { getAchievement } from "@/lib/achievements";

const UNLOCKED_KEY = "databloom-unlocked-achievements";
const REWARDED_KEY = "databloom-rewarded-achievements";

export const ACHIEVEMENTS_UPDATED_EVENT =
  "databloom:achievements-updated";
export const ACHIEVEMENT_REWARD_EVENT = "databloom:achievement-reward";

export type AchievementRewardEventDetail = {
  id: string;
  xp: number;
};

function loadStringArray(key: string): string[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = window.localStorage.getItem(key);
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed)
      ? Array.from(new Set(parsed.filter((item): item is string => typeof item === "string")))
      : [];
  } catch {
    return [];
  }
}


export function loadUnlockedAchievements(): string[] {
  return loadStringArray(UNLOCKED_KEY);
}

export function loadRewardedAchievements(): string[] {
  return loadStringArray(REWARDED_KEY);
}



export function saveUnlockedAchievements(
  achievements: string[]
) {

  if (typeof window === "undefined") return;


  localStorage.setItem(
    UNLOCKED_KEY,
    JSON.stringify(achievements)
  );

  window.dispatchEvent(
    new CustomEvent(ACHIEVEMENTS_UPDATED_EVENT)
  );

}


export function unlockAchievement(id:string){

  if(!id || typeof window === "undefined")
    return false;

  const unlocked =
    loadUnlockedAchievements();

  const newlyUnlocked = !unlocked.includes(id);

  if (newlyUnlocked) {
    saveUnlockedAchievements([...unlocked, id]);
  }

  const achievement = getAchievement(id);
  const rewarded = loadRewardedAchievements();

  if (achievement && !rewarded.includes(id)) {
    try {
      window.localStorage.setItem(
        REWARDED_KEY,
        JSON.stringify([...rewarded, id]),
      );
      window.dispatchEvent(
        new CustomEvent<AchievementRewardEventDetail>(ACHIEVEMENT_REWARD_EVENT, {
          detail: { id, xp: achievement.reward },
        }),
      );
    } catch {
      // The achievement remains unlocked even if its reward cannot be persisted.
    }
  }

  return newlyUnlocked;

}
