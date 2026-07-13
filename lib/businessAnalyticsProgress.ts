import {
  calculateLessonStudioProgress,
  createLessonStudioProgressStore,
  isAcceptedLessonStudioAnswer,
  type LessonStudioProgressState,
} from "@/lib/studioProgressStore";

const BUSINESS_ANALYTICS_PROGRESS_KEY =
  "databloom-business-analytics-progress-v1";

export const BUSINESS_ANALYTICS_PROGRESS_EVENT =
  "databloom:business-analytics-progress-updated";

export type BusinessAnalyticsProgressState = LessonStudioProgressState;

const store = createLessonStudioProgressStore({
  storageKey: BUSINESS_ANALYTICS_PROGRESS_KEY,
  eventName: BUSINESS_ANALYTICS_PROGRESS_EVENT,
});

export const loadBusinessAnalyticsProgress = store.load;
export const completeBusinessAnalyticsLesson = store.completeLesson;
export const completeBusinessAnalyticsPractice = store.completePractice;
export const toggleBusinessAnalyticsFavorite = store.toggleFavorite;
export const getBusinessAnalyticsNote = store.getNote;
export const saveBusinessAnalyticsNote = store.saveNote;
export const calculateBusinessAnalyticsProgress = calculateLessonStudioProgress;
export const isAcceptedBusinessAnalyticsAnswer = isAcceptedLessonStudioAnswer;
