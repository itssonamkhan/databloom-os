export type LessonStudioProgressState = {
  completedLessonIds: string[];
  favoriteLessonIds: string[];
  completedPracticeIds: string[];
  notes: Record<string, string>;
};

type StudioProgressStoreOptions = {
  storageKey: string;
  eventName: string;
};

const emptyState = (): LessonStudioProgressState => ({
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

function normalizeState(value: unknown): LessonStudioProgressState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return emptyState();
  }

  const state = value as Partial<LessonStudioProgressState>;
  return {
    completedLessonIds: uniqueStrings(state.completedLessonIds),
    favoriteLessonIds: uniqueStrings(state.favoriteLessonIds),
    completedPracticeIds: uniqueStrings(state.completedPracticeIds),
    notes: stringRecord(state.notes),
  };
}

export function createLessonStudioProgressStore({
  storageKey,
  eventName,
}: StudioProgressStoreOptions) {
  function load(): LessonStudioProgressState {
    if (!canUseStorage()) return emptyState();
    try {
      const saved = window.localStorage.getItem(storageKey);
      return saved ? normalizeState(JSON.parse(saved)) : emptyState();
    } catch {
      return emptyState();
    }
  }

  function save(state: LessonStudioProgressState, lessonId: string) {
    if (!canUseStorage()) return false;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
      window.dispatchEvent(
        new CustomEvent(eventName, { detail: { lessonId, state } }),
      );
      return true;
    } catch {
      return false;
    }
  }

  function complete(
    field: "completedLessonIds" | "completedPracticeIds",
    lessonId: string,
  ) {
    const state = load();
    if (!lessonId || state[field].includes(lessonId)) {
      return { newlyCompleted: false, state };
    }

    const next = { ...state, [field]: [...state[field], lessonId] };
    return save(next, lessonId)
      ? { newlyCompleted: true, state: next }
      : { newlyCompleted: false, state };
  }

  function toggleFavorite(lessonId: string) {
    const state = load();
    if (!lessonId) return state;
    const favoriteLessonIds = state.favoriteLessonIds.includes(lessonId)
      ? state.favoriteLessonIds.filter((id) => id !== lessonId)
      : [...state.favoriteLessonIds, lessonId];
    const next = { ...state, favoriteLessonIds };
    return save(next, lessonId) ? next : state;
  }

  function saveNote(lessonId: string, note: string) {
    if (!lessonId) return false;
    const state = load();
    const notes = { ...state.notes };
    if (note.trim()) notes[lessonId] = note;
    else delete notes[lessonId];
    return save({ ...state, notes }, lessonId);
  }

  return {
    load,
    completeLesson: (lessonId: string) =>
      complete("completedLessonIds", lessonId),
    completePractice: (lessonId: string) =>
      complete("completedPracticeIds", lessonId),
    toggleFavorite,
    getNote: (lessonId: string) => load().notes[lessonId] ?? "",
    saveNote,
  };
}

export function calculateLessonStudioProgress(completed: number, total: number) {
  return total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
}

export function isAcceptedLessonStudioAnswer(
  answer: string,
  correctAnswer: string,
) {
  return answer.trim().toLocaleLowerCase() === correctAnswer.trim().toLocaleLowerCase();
}
