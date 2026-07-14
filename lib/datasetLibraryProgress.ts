import {
  calculateLessonStudioProgress,
  createLessonStudioProgressStore,
  type LessonStudioProgressState,
} from "@/lib/studioProgressStore";

const DATASET_LIBRARY_PROGRESS_KEY = "databloom-dataset-library-progress-v1";

export const DATASET_LIBRARY_PROGRESS_EVENT =
  "databloom:dataset-library-progress-updated";

export type DatasetLibraryProgressState = LessonStudioProgressState;

const store = createLessonStudioProgressStore({
  storageKey: DATASET_LIBRARY_PROGRESS_KEY,
  eventName: DATASET_LIBRARY_PROGRESS_EVENT,
});

export const loadDatasetLibraryProgress = store.load;
export const completeDatasetLibraryItem = store.completeLesson;
export const toggleDatasetLibraryFavorite = store.toggleFavorite;
export const getDatasetLibraryNote = store.getNote;
export const saveDatasetLibraryNote = store.saveNote;
export const calculateDatasetLibraryProgress = calculateLessonStudioProgress;
