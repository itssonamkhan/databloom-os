const XP_KEY = "databloom-xp";

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