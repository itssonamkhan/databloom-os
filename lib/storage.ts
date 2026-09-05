const XP_KEY = "databloom-xp";
const LAST_CELEBRATED_LEVEL_KEY = "databloom-last-celebrated-level";

const DEFAULT_XP = 0;

function normalizeXP(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : DEFAULT_XP;
}

export function saveXP(xp: number) {
  if (typeof window === "undefined") return;

  localStorage.setItem(XP_KEY, JSON.stringify(normalizeXP(xp)));
}

export function loadXP(): number {
  if (typeof window === "undefined") return DEFAULT_XP;

  let savedXP: string | null;
  try {
    savedXP = localStorage.getItem(XP_KEY);
  } catch {
    return DEFAULT_XP;
  }

  if (!savedXP) return DEFAULT_XP;

  try {
    return normalizeXP(JSON.parse(savedXP));
  } catch {
    return DEFAULT_XP;
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
