const XP_KEY = "databloom-xp";
const LAST_CELEBRATED_LEVEL_KEY = "databloom-last-celebrated-level";

export function saveXP(xp: number) {
  if (typeof window === "undefined") return;

  localStorage.setItem(XP_KEY, JSON.stringify(xp));
}

export function loadXP(): number {
  if (typeof window === "undefined") return 240;

  const savedXP = localStorage.getItem(XP_KEY);

  if (!savedXP) return 240;

  try {
    return JSON.parse(savedXP);
  } catch {
    return 240;
  }
}

export function clearXP() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(XP_KEY);
}

export function saveLastCelebratedLevel(levelName: string) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(LAST_CELEBRATED_LEVEL_KEY, levelName);
  } catch {
    // Level changes still work if browser storage is unavailable.
  }
}

export function loadLastCelebratedLevel(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(LAST_CELEBRATED_LEVEL_KEY);
  } catch {
    return null;
  }
}
