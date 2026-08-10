import {
  calculateLessonStudioProgress,
  createLessonStudioProgressStore,
  isAcceptedLessonStudioAnswer,
  type LessonStudioProgressState,
} from "@/lib/studioProgressStore";
import { businessAnalyticsLessons } from "@/lib/businessAnalyticsLessons";

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

const OFFICIAL_BUSINESS_ANALYTICS_LESSON_IDS = new Set(
  businessAnalyticsLessons.map((lesson) => lesson.id),
);

function getKnownBusinessAnalyticsLessonIds(ids: readonly string[]) {
  return Array.from(new Set(ids)).filter((id) =>
    OFFICIAL_BUSINESS_ANALYTICS_LESSON_IDS.has(id),
  );
}

export function getCompletedBusinessAnalyticsLessonIds(
  state: BusinessAnalyticsProgressState = loadBusinessAnalyticsProgress(),
) {
  return getKnownBusinessAnalyticsLessonIds(state.completedLessonIds);
}

export function getFavoriteBusinessAnalyticsLessonIds(
  state: BusinessAnalyticsProgressState = loadBusinessAnalyticsProgress(),
) {
  return getKnownBusinessAnalyticsLessonIds(state.favoriteLessonIds);
}

export const completeBusinessAnalyticsLesson = store.completeLesson;
export const completeBusinessAnalyticsPractice = store.completePractice;
export const toggleBusinessAnalyticsFavorite = store.toggleFavorite;
export const getBusinessAnalyticsNote = store.getNote;
export const saveBusinessAnalyticsNote = store.saveNote;
export const calculateBusinessAnalyticsProgress = calculateLessonStudioProgress;
export const isAcceptedBusinessAnalyticsAnswer = isAcceptedLessonStudioAnswer;
