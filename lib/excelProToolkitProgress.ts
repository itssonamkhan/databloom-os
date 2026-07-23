export const EXCEL_PRO_TOOLKIT_STORAGE_KEY =
  "databloom-excel-pro-toolkit-v1";
export const EXCEL_PRO_TOOLKIT_EVENT =
  "databloom:excel-pro-toolkit-updated";

export type ExcelProToolkitProgress = {
  version: 1;
  favoriteIds: string[];
  learnedIds: string[];
};

const emptyProgress = (): ExcelProToolkitProgress => ({
  version: 1,
  favoriteIds: [],
  learnedIds: [],
});

function uniqueStrings(value: unknown) {
  return Array.isArray(value)
    ? Array.from(
        new Set(
          value.filter((item): item is string => typeof item === "string"),
        ),
      )
    : [];
}

function normalizeProgress(value: unknown): ExcelProToolkitProgress {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return emptyProgress();
  }
  const progress = value as Partial<ExcelProToolkitProgress>;
  return {
    version: 1,
    favoriteIds: uniqueStrings(progress.favoriteIds),
    learnedIds: uniqueStrings(progress.learnedIds),
  };
}

export function loadExcelProToolkitProgress(): ExcelProToolkitProgress {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const stored = window.localStorage.getItem(
      EXCEL_PRO_TOOLKIT_STORAGE_KEY,
    );
    return stored ? normalizeProgress(JSON.parse(stored)) : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

function saveExcelProToolkitProgress(progress: ExcelProToolkitProgress) {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(
      EXCEL_PRO_TOOLKIT_STORAGE_KEY,
      JSON.stringify(progress),
    );
    window.dispatchEvent(
      new CustomEvent(EXCEL_PRO_TOOLKIT_EVENT, { detail: { progress } }),
    );
    return true;
  } catch {
    return false;
  }
}

export function toggleExcelToolkitFavorite(id: string) {
  const progress = loadExcelProToolkitProgress();
  if (!id) return progress;
  const favoriteIds = progress.favoriteIds.includes(id)
    ? progress.favoriteIds.filter((itemId) => itemId !== id)
    : [...progress.favoriteIds, id];
  const next = { ...progress, favoriteIds };
  return saveExcelProToolkitProgress(next) ? next : progress;
}

export function toggleExcelToolkitLearned(id: string) {
  const progress = loadExcelProToolkitProgress();
  if (!id) return progress;
  const learnedIds = progress.learnedIds.includes(id)
    ? progress.learnedIds.filter((itemId) => itemId !== id)
    : [...progress.learnedIds, id];
  const next = { ...progress, learnedIds };
  return saveExcelProToolkitProgress(next) ? next : progress;
}
