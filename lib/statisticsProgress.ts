const STATISTICS_STORAGE_KEY = "databloom-statistics-progress-v1";

export const STATISTICS_PROGRESS_EVENT =
  "databloom:statistics-progress-updated";

export type StatisticsProgressState = {
  completedLessonIds: string[];
  favoriteLessonIds: string[];
  completedPracticeIds: string[];
  notes: Record<string, string>;
};

const emptyState = (): StatisticsProgressState => ({
  completedLessonIds: [],
  favoriteLessonIds: [],
  completedPracticeIds: [],
  notes: {},
});

function canUseStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
}

function strings(value: unknown) {
  return Array.isArray(value)
    ? Array.from(new Set(value.filter((item): item is string => typeof item === "string")))
    : [];
}

function normalize(value: unknown): StatisticsProgressState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return emptyState();
  const state = value as Partial<StatisticsProgressState>;
  const notes =
    state.notes && typeof state.notes === "object" && !Array.isArray(state.notes)
      ? Object.fromEntries(
          Object.entries(state.notes).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
          ),
        )
      : {};
  return {
    completedLessonIds: strings(state.completedLessonIds),
    favoriteLessonIds: strings(state.favoriteLessonIds),
    completedPracticeIds: strings(state.completedPracticeIds),
    notes,
  };
}

export function loadStatisticsProgress(): StatisticsProgressState {
  if (!canUseStorage()) return emptyState();
  try {
    const saved = window.localStorage.getItem(STATISTICS_STORAGE_KEY);
    return saved ? normalize(JSON.parse(saved)) : emptyState();
  } catch {
    return emptyState();
  }
}

function save(state: StatisticsProgressState, lessonId: string) {
  if (!canUseStorage()) return false;
  try {
    window.localStorage.setItem(STATISTICS_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(
      new CustomEvent(STATISTICS_PROGRESS_EVENT, { detail: { lessonId, state } }),
    );
    return true;
  } catch {
    return false;
  }
}

export function completeStatisticsLesson(id: string) {
  const state = loadStatisticsProgress();
  if (!id || state.completedLessonIds.includes(id)) return { newlyCompleted: false, state };
  const next = { ...state, completedLessonIds: [...state.completedLessonIds, id] };
  return save(next, id)
    ? { newlyCompleted: true, state: next }
    : { newlyCompleted: false, state };
}

export function completeStatisticsPractice(id: string) {
  const state = loadStatisticsProgress();
  if (!id || state.completedPracticeIds.includes(id)) return { newlyCompleted: false, state };
  const next = { ...state, completedPracticeIds: [...state.completedPracticeIds, id] };
  return save(next, id)
    ? { newlyCompleted: true, state: next }
    : { newlyCompleted: false, state };
}

export function toggleStatisticsFavorite(id: string) {
  const state = loadStatisticsProgress();
  if (!id) return state;
  const favoriteLessonIds = state.favoriteLessonIds.includes(id)
    ? state.favoriteLessonIds.filter((lessonId) => lessonId !== id)
    : [...state.favoriteLessonIds, id];
  const next = { ...state, favoriteLessonIds };
  return save(next, id) ? next : state;
}

export function getStatisticsNote(id: string) {
  return loadStatisticsProgress().notes[id] ?? "";
}

export function saveStatisticsNote(id: string, note: string) {
  if (!id) return false;
  const state = loadStatisticsProgress();
  const notes = { ...state.notes };
  if (note.trim()) notes[id] = note;
  else delete notes[id];
  return save({ ...state, notes }, id);
}

export function calculateStatisticsProgress(completed: number, total: number) {
  return total <= 0 ? 0 : Math.min(100, Math.round((completed / total) * 100));
}

export function normalizeStatisticsAnswer(value: string) {
  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[,₹$]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*=\s*/g, "=")
    .replace(/\s*%\s*/g, "%")
    .replace(/[.;]+$/, "");
}

export function isAcceptedStatisticsAnswer(
  answer: string,
  acceptedAnswers: string[],
) {
  const normalized = normalizeStatisticsAnswer(answer);
  return (
    Boolean(normalized) &&
    acceptedAnswers.some(
      (accepted) => normalizeStatisticsAnswer(accepted) === normalized,
    )
  );
}
