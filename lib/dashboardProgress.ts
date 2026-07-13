const COMPLETED_STORAGE_KEY = "dashboard_progress";
const FAVORITES_STORAGE_KEY = "databloom-dashboard-favorites";
const NOTES_STORAGE_KEY = "databloom-dashboard-notes";

export const DASHBOARD_STORAGE_EVENT =
  "databloom:dashboard-storage-updated";

export type DashboardStorageArea = "completed" | "favorites" | "notes";

export type DashboardStorageEventDetail = {
  area: DashboardStorageArea;
  projectId: string;
};

function canUseBrowserStorage(): boolean {
  return typeof window !== "undefined" && "localStorage" in window;
}

function readStoredValue(key: string): unknown {
  if (!canUseBrowserStorage()) return undefined;

  try {
    const saved = window.localStorage.getItem(key);
    return saved ? JSON.parse(saved) : undefined;
  } catch {
    return undefined;
  }
}

function readStringArray(key: string): string[] {
  const value = readStoredValue(key);

  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(value.filter((item): item is string => typeof item === "string")),
  );
}

function writeStoredValue(key: string, value: unknown): boolean {
  if (!canUseBrowserStorage()) return false;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function dispatchStorageUpdate(
  area: DashboardStorageArea,
  projectId: string,
): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<DashboardStorageEventDetail>(DASHBOARD_STORAGE_EVENT, {
      detail: { area, projectId },
    }),
  );
}

/**
 * Returns dashboard IDs saved by the original Dashboard Studio implementation.
 * The legacy storage key is intentionally retained for backwards compatibility.
 */
export function getCompletedDashboards(): string[] {
  return readStringArray(COMPLETED_STORAGE_KEY);
}

export function isDashboardCompleted(id: string): boolean {
  return getCompletedDashboards().includes(id);
}

/**
 * Atomically checks and records a dashboard completion in the current browser
 * task. `true` means this call persisted a new completion and XP may be awarded.
 */
export function completeDashboard(id: string): boolean {
  if (!id || !canUseBrowserStorage()) return false;

  const completed = getCompletedDashboards();

  if (completed.includes(id)) return false;

  if (!writeStoredValue(COMPLETED_STORAGE_KEY, [...completed, id])) {
    return false;
  }

  dispatchStorageUpdate("completed", id);
  return true;
}

export function getFavoriteDashboards(): string[] {
  return readStringArray(FAVORITES_STORAGE_KEY);
}

export function isDashboardFavorite(id: string): boolean {
  return getFavoriteDashboards().includes(id);
}

export function toggleFavoriteDashboard(id: string): string[] {
  const favorites = getFavoriteDashboards();

  if (!id || !canUseBrowserStorage()) return favorites;

  const updated = favorites.includes(id)
    ? favorites.filter((favoriteId) => favoriteId !== id)
    : [...favorites, id];

  if (!writeStoredValue(FAVORITES_STORAGE_KEY, updated)) return favorites;

  dispatchStorageUpdate("favorites", id);
  return updated;
}

export function getDashboardNotes(): Record<string, string> {
  const value = readStoredValue(NOTES_STORAGE_KEY);

  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

export function getDashboardNote(id: string): string {
  return getDashboardNotes()[id] ?? "";
}

export function saveDashboardNote(id: string, note: string): boolean {
  if (!id || !canUseBrowserStorage()) return false;

  const notes = getDashboardNotes();

  if (note) {
    notes[id] = note;
  } else {
    delete notes[id];
  }

  if (!writeStoredValue(NOTES_STORAGE_KEY, notes)) return false;

  dispatchStorageUpdate("notes", id);
  return true;
}
