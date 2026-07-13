const UNLOCKED_KEY = "databloom-unlocked-achievements";

export const ACHIEVEMENTS_UPDATED_EVENT =
  "databloom:achievements-updated";


export function loadUnlockedAchievements(): string[] {

  if (typeof window === "undefined") {
    return [];
  }


  const saved =
    localStorage.getItem(UNLOCKED_KEY);


  if (!saved) {
    return [];
  }


  try {

    return JSON.parse(saved);

  } catch {

    return [];

  }

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

  if(unlocked.includes(id))
    return false;

  saveUnlockedAchievements([
    ...unlocked,
    id,
  ]);

  return true;

}
