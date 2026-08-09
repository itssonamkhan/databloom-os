import {
  calculateLessonStudioProgress,
  createLessonStudioProgressStore,
  isAcceptedLessonStudioAnswer,
  type LessonStudioProgressState,
} from "@/lib/studioProgressStore";
import { powerQueryLessons } from "@/lib/powerQueryLessons";

const POWER_QUERY_PROGRESS_KEY = "databloom-power-query-progress-v1";

export const POWER_QUERY_PROGRESS_EVENT =
  "databloom:power-query-progress-updated";

export type PowerQueryProgressState = LessonStudioProgressState;

const store = createLessonStudioProgressStore({
  storageKey: POWER_QUERY_PROGRESS_KEY,
  eventName: POWER_QUERY_PROGRESS_EVENT,
});

export const loadPowerQueryProgress = store.load;

const OFFICIAL_POWER_QUERY_LESSON_IDS = new Set(
  powerQueryLessons.map((lesson) => lesson.id),
);

function getKnownPowerQueryLessonIds(ids: readonly string[]) {
  return Array.from(new Set(ids)).filter((id) =>
    OFFICIAL_POWER_QUERY_LESSON_IDS.has(id),
  );
}

export function getCompletedPowerQueryLessonIds(
  state: PowerQueryProgressState = loadPowerQueryProgress(),
) {
  return getKnownPowerQueryLessonIds(state.completedLessonIds);
}

export function getFavoritePowerQueryLessonIds(
  state: PowerQueryProgressState = loadPowerQueryProgress(),
) {
  return getKnownPowerQueryLessonIds(state.favoriteLessonIds);
}

export const completePowerQueryLesson = store.completeLesson;
export const completePowerQueryPractice = store.completePractice;
export const togglePowerQueryFavorite = store.toggleFavorite;
export const getPowerQueryNote = store.getNote;
export const savePowerQueryNote = store.saveNote;
export const calculatePowerQueryProgress = calculateLessonStudioProgress;
export const isAcceptedPowerQueryAnswer = isAcceptedLessonStudioAnswer;
