const SQL_STORAGE_KEY = "databloom-sql-progress-v1";

export const SQL_PROGRESS_EVENT = "databloom:sql-progress-updated";

export type SQLProgressState = {
  completedLessonIds: string[];
  favoriteLessonIds: string[];
  completedPracticeIds: string[];
  notes: Record<string, string>;
};

const EMPTY_STATE: SQLProgressState = {
  completedLessonIds: [],
  favoriteLessonIds: [],
  completedPracticeIds: [],
  notes: {},
};

function canUseStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
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

function normalizeState(value: unknown): SQLProgressState {
  if (!value || typeof value !== "object") return { ...EMPTY_STATE };
  const state = value as Partial<SQLProgressState>;
  return {
    completedLessonIds: uniqueStrings(state.completedLessonIds),
    favoriteLessonIds: uniqueStrings(state.favoriteLessonIds),
    completedPracticeIds: uniqueStrings(state.completedPracticeIds),
    notes: stringRecord(state.notes),
  };
}

export function loadSQLProgress(): SQLProgressState {
  if (!canUseStorage()) return { ...EMPTY_STATE };
  try {
    const saved = window.localStorage.getItem(SQL_STORAGE_KEY);
    return saved ? normalizeState(JSON.parse(saved)) : { ...EMPTY_STATE };
  } catch {
    return { ...EMPTY_STATE };
  }
}

function saveSQLProgress(state: SQLProgressState, lessonId: string) {
  if (!canUseStorage()) return false;
  try {
    window.localStorage.setItem(SQL_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(
      new CustomEvent(SQL_PROGRESS_EVENT, { detail: { lessonId, state } }),
    );
    return true;
  } catch {
    return false;
  }
}

export function completeSQLLesson(id: string) {
  const state = loadSQLProgress();
  if (!id || state.completedLessonIds.includes(id)) {
    return { newlyCompleted: false, state };
  }
  const next = {
    ...state,
    completedLessonIds: [...state.completedLessonIds, id],
  };
  return saveSQLProgress(next, id)
    ? { newlyCompleted: true, state: next }
    : { newlyCompleted: false, state };
}

export function completeSQLPractice(id: string) {
  const state = loadSQLProgress();
  if (!id || state.completedPracticeIds.includes(id)) {
    return { newlyCompleted: false, state };
  }
  const next = {
    ...state,
    completedPracticeIds: [...state.completedPracticeIds, id],
  };
  return saveSQLProgress(next, id)
    ? { newlyCompleted: true, state: next }
    : { newlyCompleted: false, state };
}

export function toggleSQLFavorite(id: string) {
  const state = loadSQLProgress();
  if (!id) return state;
  const favoriteLessonIds = state.favoriteLessonIds.includes(id)
    ? state.favoriteLessonIds.filter((lessonId) => lessonId !== id)
    : [...state.favoriteLessonIds, id];
  const next = { ...state, favoriteLessonIds };
  return saveSQLProgress(next, id) ? next : state;
}

export function getSQLNote(id: string) {
  return loadSQLProgress().notes[id] ?? "";
}

export function saveSQLNote(id: string, note: string) {
  if (!id) return false;
  const state = loadSQLProgress();
  const notes = { ...state.notes };
  if (note.trim()) notes[id] = note;
  else delete notes[id];
  return saveSQLProgress({ ...state, notes }, id);
}

export function calculateSQLProgress(completedCount: number, totalCount: number) {
  if (totalCount <= 0) return 0;
  return Math.min(100, Math.round((completedCount / totalCount) * 100));
}

export function normalizeSQLAnswer(value: string) {
  return value
    .trim()
    .replace(/;+\s*$/, "")
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s*=\s*/g, " = ")
    .replace(/\s*<>\s*/g, " <> ")
    .replace(/\s*!=\s*/g, " != ")
    .replace(/\s*>\s*/g, " > ")
    .replace(/\s*<\s*/g, " < ")
    .toLowerCase();
}

export function isAcceptedSQLAnswer(answer: string, acceptedAnswers: string[]) {
  const normalized = normalizeSQLAnswer(answer);
  return acceptedAnswers.some(
    (accepted) => normalizeSQLAnswer(accepted) === normalized,
  );
}
