import type { AnalyticsSnapshot } from "@/lib/analytics";

export const ANALYTICS_HISTORY_STORAGE_KEY =
  "databloom-analytics-history-v1";
export const ANALYTICS_UPDATED_EVENT = "databloom:analytics-updated";

export type AnalyticsHistoryDay = {
  date: string;
  lessons: number;
  xpEarned: number;
  practiceCompleted: number;
  focusSessions: number;
};

export type AnalyticsHistoryBaseline = {
  date: string;
  recordedAt: string;
  xp: number;
  completedLessons: number;
  completedPractice: number;
  focusSessions: number;
};

export type AnalyticsHistoryState = {
  version: 1;
  baseline: AnalyticsHistoryBaseline | null;
  days: Record<string, AnalyticsHistoryDay>;
};

export type AnalyticsUpdatedEventDetail = {
  snapshot: AnalyticsSnapshot;
  history: AnalyticsHistoryState;
};

const EMPTY_HISTORY: AnalyticsHistoryState = {
  version: 1,
  baseline: null,
  days: {},
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && "localStorage" in window;
}

function nonNegativeNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, value)
    : 0;
}

function validDateKey(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function localDateKey(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateKey(value: string): string {
  const parsed = new Date(value);
  return localDateKey(Number.isNaN(parsed.getTime()) ? new Date() : parsed);
}

function normalizeDay(value: unknown, fallbackDate: string): AnalyticsHistoryDay {
  const day =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Partial<AnalyticsHistoryDay>)
      : {};

  return {
    date: validDateKey(day.date) ? day.date : fallbackDate,
    lessons: nonNegativeNumber(day.lessons),
    xpEarned: nonNegativeNumber(day.xpEarned),
    practiceCompleted: nonNegativeNumber(day.practiceCompleted),
    focusSessions: nonNegativeNumber(day.focusSessions),
  };
}

function normalizeBaseline(value: unknown): AnalyticsHistoryBaseline | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const baseline = value as Partial<AnalyticsHistoryBaseline>;
  if (!validDateKey(baseline.date) || typeof baseline.recordedAt !== "string") {
    return null;
  }

  return {
    date: baseline.date,
    recordedAt: baseline.recordedAt,
    xp: nonNegativeNumber(baseline.xp),
    completedLessons: nonNegativeNumber(baseline.completedLessons),
    completedPractice: nonNegativeNumber(baseline.completedPractice),
    focusSessions: nonNegativeNumber(baseline.focusSessions),
  };
}

function normalizeHistory(value: unknown): AnalyticsHistoryState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...EMPTY_HISTORY, days: {} };
  }

  const candidate = value as Partial<AnalyticsHistoryState>;
  const days: Record<string, AnalyticsHistoryDay> = {};

  if (
    candidate.days &&
    typeof candidate.days === "object" &&
    !Array.isArray(candidate.days)
  ) {
    for (const [key, storedDay] of Object.entries(candidate.days)) {
      if (!validDateKey(key)) continue;
      days[key] = normalizeDay(storedDay, key);
    }
  }

  return {
    version: 1,
    baseline: normalizeBaseline(candidate.baseline),
    days,
  };
}

export function loadAnalyticsHistory(): AnalyticsHistoryState {
  if (!canUseStorage()) return { ...EMPTY_HISTORY, days: {} };

  try {
    const stored = window.localStorage.getItem(ANALYTICS_HISTORY_STORAGE_KEY);
    return stored
      ? normalizeHistory(JSON.parse(stored))
      : { ...EMPTY_HISTORY, days: {} };
  } catch {
    return { ...EMPTY_HISTORY, days: {} };
  }
}

function saveAnalyticsHistory(history: AnalyticsHistoryState): boolean {
  if (!canUseStorage()) return false;

  try {
    window.localStorage.setItem(
      ANALYTICS_HISTORY_STORAGE_KEY,
      JSON.stringify(history),
    );
    return true;
  } catch {
    return false;
  }
}

function snapshotBaseline(snapshot: AnalyticsSnapshot): AnalyticsHistoryBaseline {
  return {
    date: dateKey(snapshot.generatedAt),
    recordedAt: snapshot.generatedAt,
    xp: nonNegativeNumber(snapshot.xp),
    completedLessons: nonNegativeNumber(snapshot.totals.completedLessons),
    completedPractice: nonNegativeNumber(snapshot.totals.completedPractice),
    focusSessions: nonNegativeNumber(snapshot.totals.focusSessions),
  };
}

function trimHistoryDays(
  days: Record<string, AnalyticsHistoryDay>,
): Record<string, AnalyticsHistoryDay> {
  return Object.fromEntries(
    Object.entries(days)
      .sort(([left], [right]) => left.localeCompare(right))
      .slice(-90),
  );
}

function dispatchAnalyticsUpdate(
  snapshot: AnalyticsSnapshot,
  history: AnalyticsHistoryState,
): void {
  if (typeof window === "undefined") return;

  try {
    window.dispatchEvent(
      new CustomEvent<AnalyticsUpdatedEventDetail>(ANALYTICS_UPDATED_EVENT, {
        detail: { snapshot, history },
      }),
    );
  } catch {
    // The analytics snapshot is still persisted when CustomEvent is unavailable.
  }
}

/**
 * Records only increases observed between two snapshots taken on the same date.
 * The first observation (and the first observation on a new date) is a zero
 * baseline, so activity is never guessed or attributed to the wrong day.
 */
export function recordAnalyticsSnapshot(
  snapshot: AnalyticsSnapshot,
): AnalyticsHistoryState {
  const current = loadAnalyticsHistory();
  const baseline = snapshotBaseline(snapshot);
  const existingDay =
    current.days[baseline.date] ?? normalizeDay(undefined, baseline.date);
  const previous = current.baseline;

  const sameDate = previous?.date === baseline.date;
  const nextDay: AnalyticsHistoryDay = {
    ...existingDay,
    lessons:
      existingDay.lessons +
      (sameDate
        ? Math.max(0, baseline.completedLessons - previous.completedLessons)
        : 0),
    xpEarned:
      existingDay.xpEarned +
      (sameDate ? Math.max(0, baseline.xp - previous.xp) : 0),
    practiceCompleted:
      existingDay.practiceCompleted +
      (sameDate
        ? Math.max(0, baseline.completedPractice - previous.completedPractice)
        : 0),
    focusSessions:
      existingDay.focusSessions +
      (sameDate
        ? Math.max(0, baseline.focusSessions - previous.focusSessions)
        : 0),
  };

  // Keep same-day baselines monotonic. A reset, malformed read, or removed
  // lesson must not make restored progress look like brand-new activity.
  const nextBaseline =
    sameDate && previous
      ? {
          ...baseline,
          xp: Math.max(previous.xp, baseline.xp),
          completedLessons: Math.max(
            previous.completedLessons,
            baseline.completedLessons,
          ),
          completedPractice: Math.max(
            previous.completedPractice,
            baseline.completedPractice,
          ),
          focusSessions: Math.max(
            previous.focusSessions,
            baseline.focusSessions,
          ),
        }
      : baseline;

  const next: AnalyticsHistoryState = {
    version: 1,
    baseline: nextBaseline,
    days: trimHistoryDays({ ...current.days, [baseline.date]: nextDay }),
  };

  if (saveAnalyticsHistory(next)) {
    dispatchAnalyticsUpdate(snapshot, next);
    return next;
  }

  return current;
}

export function getAnalyticsHistoryDay(date: string): AnalyticsHistoryDay {
  const history = loadAnalyticsHistory();
  return history.days[date] ?? normalizeDay(undefined, date);
}

export function subscribeToAnalyticsHistory(
  listener: (event: Event) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  window.addEventListener(ANALYTICS_UPDATED_EVENT, listener);
  return () => window.removeEventListener(ANALYTICS_UPDATED_EVENT, listener);
}
