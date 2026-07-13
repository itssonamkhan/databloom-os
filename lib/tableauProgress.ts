const TABLEAU_PROGRESS_KEY = "databloom-tableau-progress-v1";

export const TABLEAU_PROGRESS_EVENT = "databloom:tableau-progress-updated";

export type TableauProgressState = {
  completedLessonIds: string[];
  favoriteLessonIds: string[];
  completedPracticeIds: string[];
  notes: Record<string, string>;
};

const emptyState = (): TableauProgressState => ({
  completedLessonIds: [],
  favoriteLessonIds: [],
  completedPracticeIds: [],
  notes: {},
});

function canUseStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
}

function uniqueStrings(value: unknown) {
  return Array.isArray(value)
    ? Array.from(
        new Set(value.filter((item): item is string => typeof item === "string")),
      )
    : [];
}

function stringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

function normalizeState(value: unknown): TableauProgressState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return emptyState();
  }
  const state = value as Partial<TableauProgressState>;
  return {
    completedLessonIds: uniqueStrings(state.completedLessonIds),
    favoriteLessonIds: uniqueStrings(state.favoriteLessonIds),
    completedPracticeIds: uniqueStrings(state.completedPracticeIds),
    notes: stringRecord(state.notes),
  };
}

export function loadTableauProgress(): TableauProgressState {
  if (!canUseStorage()) return emptyState();
  try {
    const saved = window.localStorage.getItem(TABLEAU_PROGRESS_KEY);
    return saved ? normalizeState(JSON.parse(saved)) : emptyState();
  } catch {
    return emptyState();
  }
}

function saveTableauProgress(
  state: TableauProgressState,
  lessonId: string,
) {
  if (!canUseStorage()) return false;
  try {
    window.localStorage.setItem(TABLEAU_PROGRESS_KEY, JSON.stringify(state));
    window.dispatchEvent(
      new CustomEvent(TABLEAU_PROGRESS_EVENT, { detail: { lessonId, state } }),
    );
    return true;
  } catch {
    return false;
  }
}

export function completeTableauLesson(id: string) {
  const state = loadTableauProgress();
  if (!id || state.completedLessonIds.includes(id)) {
    return { newlyCompleted: false, state };
  }
  const next = {
    ...state,
    completedLessonIds: [...state.completedLessonIds, id],
  };
  return saveTableauProgress(next, id)
    ? { newlyCompleted: true, state: next }
    : { newlyCompleted: false, state };
}

export function completeTableauPractice(id: string) {
  const state = loadTableauProgress();
  if (!id || state.completedPracticeIds.includes(id)) {
    return { newlyCompleted: false, state };
  }
  const next = {
    ...state,
    completedPracticeIds: [...state.completedPracticeIds, id],
  };
  return saveTableauProgress(next, id)
    ? { newlyCompleted: true, state: next }
    : { newlyCompleted: false, state };
}

export function toggleTableauFavorite(id: string) {
  const state = loadTableauProgress();
  if (!id) return state;
  const favoriteLessonIds = state.favoriteLessonIds.includes(id)
    ? state.favoriteLessonIds.filter((lessonId) => lessonId !== id)
    : [...state.favoriteLessonIds, id];
  const next = { ...state, favoriteLessonIds };
  return saveTableauProgress(next, id) ? next : state;
}

export function getTableauNote(id: string) {
  return loadTableauProgress().notes[id] ?? "";
}

export function saveTableauNote(id: string, note: string) {
  if (!id) return false;
  const state = loadTableauProgress();
  const notes = { ...state.notes };
  if (note.trim()) notes[id] = note;
  else delete notes[id];
  return saveTableauProgress({ ...state, notes }, id);
}

export function calculateTableauProgress(completed: number, total: number) {
  return total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
}

export function isAcceptedTableauAnswer(answer: string, correctAnswer: string) {
  return answer.trim().toLocaleLowerCase() === correctAnswer.trim().toLocaleLowerCase();
}
