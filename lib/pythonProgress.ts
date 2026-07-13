const PYTHON_STORAGE_KEY = "databloom-python-progress-v1";

export const PYTHON_PROGRESS_EVENT = "databloom:python-progress-updated";

export type PythonProgressState = {
  completedLessonIds: string[];
  favoriteLessonIds: string[];
  completedPracticeIds: string[];
  notes: Record<string, string>;
};

export type PythonProgressArea =
  | "lesson"
  | "favorite"
  | "practice"
  | "notes";

export type PythonProgressEventDetail = {
  area: PythonProgressArea;
  lessonId: string;
  state: PythonProgressState;
};

function emptyState(): PythonProgressState {
  return {
    completedLessonIds: [],
    favoriteLessonIds: [],
    completedPracticeIds: [],
    notes: {},
  };
}

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

function uniqueStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(value.filter((item): item is string => typeof item === "string")),
  );
}

function stringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

function normalizeState(value: unknown): PythonProgressState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return emptyState();
  }

  const state = value as Partial<PythonProgressState>;

  return {
    completedLessonIds: uniqueStrings(state.completedLessonIds),
    favoriteLessonIds: uniqueStrings(state.favoriteLessonIds),
    completedPracticeIds: uniqueStrings(state.completedPracticeIds),
    notes: stringRecord(state.notes),
  };
}

export function loadPythonProgress(): PythonProgressState {
  if (!canUseStorage()) return emptyState();

  try {
    const saved = window.localStorage.getItem(PYTHON_STORAGE_KEY);
    return saved ? normalizeState(JSON.parse(saved)) : emptyState();
  } catch {
    return emptyState();
  }
}

function dispatchProgressEvent(
  area: PythonProgressArea,
  lessonId: string,
  state: PythonProgressState,
): void {
  if (typeof window === "undefined") return;

  try {
    window.dispatchEvent(
      new CustomEvent<PythonProgressEventDetail>(PYTHON_PROGRESS_EVENT, {
        detail: { area, lessonId, state },
      }),
    );
  } catch {
    // Persistence still succeeded in browsers that cannot construct the event.
  }
}

function savePythonProgress(
  state: PythonProgressState,
  area: PythonProgressArea,
  lessonId: string,
): boolean {
  if (!canUseStorage()) return false;

  try {
    window.localStorage.setItem(PYTHON_STORAGE_KEY, JSON.stringify(state));
  } catch {
    return false;
  }

  dispatchProgressEvent(area, lessonId, state);
  return true;
}

export function completePythonLesson(id: string) {
  const state = loadPythonProgress();

  if (!id || state.completedLessonIds.includes(id)) {
    return { newlyCompleted: false, state };
  }

  const next: PythonProgressState = {
    ...state,
    completedLessonIds: [...state.completedLessonIds, id],
  };

  return savePythonProgress(next, "lesson", id)
    ? { newlyCompleted: true, state: next }
    : { newlyCompleted: false, state };
}

export function completePythonPractice(id: string) {
  const state = loadPythonProgress();

  if (!id || state.completedPracticeIds.includes(id)) {
    return { newlyCompleted: false, state };
  }

  const next: PythonProgressState = {
    ...state,
    completedPracticeIds: [...state.completedPracticeIds, id],
  };

  return savePythonProgress(next, "practice", id)
    ? { newlyCompleted: true, state: next }
    : { newlyCompleted: false, state };
}

export function togglePythonFavorite(id: string): PythonProgressState {
  const state = loadPythonProgress();
  if (!id) return state;

  const favoriteLessonIds = state.favoriteLessonIds.includes(id)
    ? state.favoriteLessonIds.filter((lessonId) => lessonId !== id)
    : [...state.favoriteLessonIds, id];
  const next = { ...state, favoriteLessonIds };

  return savePythonProgress(next, "favorite", id) ? next : state;
}

export function getPythonNote(id: string): string {
  return loadPythonProgress().notes[id] ?? "";
}

export function savePythonNote(id: string, note: string): boolean {
  if (!id) return false;

  const state = loadPythonProgress();
  const notes = { ...state.notes };

  if (note.trim()) notes[id] = note;
  else delete notes[id];

  return savePythonProgress({ ...state, notes }, "notes", id);
}

export function calculatePythonProgress(
  completedCount: number,
  totalCount: number,
): number {
  if (totalCount <= 0) return 0;
  return Math.min(100, Math.round((completedCount / totalCount) * 100));
}

/**
 * Makes formatting-only differences deterministic without executing user code.
 * Python remains case-sensitive at runtime, but practice prompts intentionally
 * accept capitalization differences for beginner-friendly answer checking.
 */
export function normalizePythonAnswer(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .replace(/\s*([()[\]{},.:;])\s*/g, "$1")
    .replace(
      /\s*(\*\*|\/\/|==|!=|<=|>=|\+=|-=|\*=|\/=|%=|=|\+|-|\*|\/|%|<|>)\s*/g,
      "$1",
    )
    .replace(/;+$/, "")
    .toLowerCase();
}

export function isAcceptedPythonAnswer(
  answer: string,
  acceptedAnswers: string[],
): boolean {
  const normalized = normalizePythonAnswer(answer);
  if (!normalized) return false;

  return acceptedAnswers.some(
    (accepted) => normalizePythonAnswer(accepted) === normalized,
  );
}
