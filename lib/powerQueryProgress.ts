import {
  calculateLessonStudioProgress,
  createLessonStudioProgressStore,
  isAcceptedLessonStudioAnswer,
  type LessonStudioProgressState,
} from "@/lib/studioProgressStore";

const POWER_QUERY_PROGRESS_KEY = "databloom-power-query-progress-v1";

export const POWER_QUERY_PROGRESS_EVENT =
  "databloom:power-query-progress-updated";

export type PowerQueryProgressState = LessonStudioProgressState;

const store = createLessonStudioProgressStore({
  storageKey: POWER_QUERY_PROGRESS_KEY,
  eventName: POWER_QUERY_PROGRESS_EVENT,
});

export const loadPowerQueryProgress = store.load;
export const completePowerQueryLesson = store.completeLesson;
export const completePowerQueryPractice = store.completePractice;
export const togglePowerQueryFavorite = store.toggleFavorite;
export const getPowerQueryNote = store.getNote;
export const savePowerQueryNote = store.saveNote;
export const calculatePowerQueryProgress = calculateLessonStudioProgress;
export const isAcceptedPowerQueryAnswer = isAcceptedLessonStudioAnswer;
