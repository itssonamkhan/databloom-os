export type DailyStats = {
  lessons: number;
  minutes: number;
  xpEarned: number;
  goalsCompleted: number;
};

const STATS_KEY = "databloom-study-stats-v2";
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DAILY_METRIC = 1_000_000;

export const STUDY_STATS_UPDATED_EVENT = "databloom:study-stats-updated";

function defaultStats(): DailyStats {
  return {
    lessons: 0,
    minutes: 0,
    xpEarned: 0,
    goalsCompleted: 0,
  };
}

function safeMetric(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Math.min(Math.floor(value), MAX_DAILY_METRIC);
}

function sanitizeStats(value: unknown): DailyStats {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return defaultStats();
  }

  const stats = value as Partial<DailyStats>;
  return {
    lessons: safeMetric(stats.lessons),
    minutes: safeMetric(stats.minutes),
    xpEarned: safeMetric(stats.xpEarned),
    goalsCompleted: safeMetric(stats.goalsCompleted),
  };
}

function isLocalDateKey(value: string): boolean {
  if (!DATE_KEY.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function loadStatsByDate(): Record<string, DailyStats> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(STATS_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).flatMap(([date, stats]) =>
        isLocalDateKey(date) ? [[date, sanitizeStats(stats)]] : [],
      ),
    );
  } catch {
    return {};
  }
}

/** Returns the learner's calendar date in their local browser timezone. */
export function getLocalStudyDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function loadTodayStats(): DailyStats {
  return loadStatsByDate()[getLocalStudyDateKey()] ?? defaultStats();
}

export function saveTodayStats(stats: DailyStats) {
  if (typeof window === "undefined") return;

  const data = loadStatsByDate();
  data[getLocalStudyDateKey()] = sanitizeStats(stats);

  try {
    window.localStorage.setItem(STATS_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(STUDY_STATS_UPDATED_EVENT));
  } catch {
    // Keep the caller's in-memory learning flow usable if browser storage is unavailable.
  }
}

export function incrementStats(
  lessons: number,
  minutes: number,
  xp: number,
  goals: number,
) {
  const current = loadTodayStats();
  const next = {
    lessons: safeMetric(current.lessons + safeMetric(lessons)),
    minutes: safeMetric(current.minutes + safeMetric(minutes)),
    xpEarned: safeMetric(current.xpEarned + safeMetric(xp)),
    goalsCompleted: safeMetric(current.goalsCompleted + safeMetric(goals)),
  };

  saveTodayStats(next);
  return next;
}
