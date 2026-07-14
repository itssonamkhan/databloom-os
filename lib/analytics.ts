import { achievements, type Achievement } from "@/lib/achievements";
import { businessAnalyticsLessons } from "@/lib/businessAnalyticsLessons";
import { loadBusinessAnalyticsProgress } from "@/lib/businessAnalyticsProgress";
import { getCareerSummary, loadCareerHubState } from "@/lib/careerHub";
import { datasetLibrary } from "@/lib/datasetLibrary";
import { loadDatasetLibraryProgress } from "@/lib/datasetLibraryProgress";
import { daxLessons } from "@/lib/daxFormulas";
import { loadDashboardPracticeState, practiceProjects } from "@/lib/dashboardPractice";
import { getCompletedDashboards } from "@/lib/dashboardProgress";
import { dashboardProjects } from "@/lib/dashboardProjects";
import { formulas } from "@/lib/formulas";
import { getLearnedFormulas } from "@/lib/learnedFormulas";
import { getInterviewSummary, loadInterviewHubState } from "@/lib/interviewHub";
import { levels } from "@/lib/levels";
import { powerBILessons } from "@/lib/powerBILessons";
import { loadPowerBIProgress } from "@/lib/powerBIProgress";
import { powerQueryLessons } from "@/lib/powerQueryLessons";
import { loadPowerQueryProgress } from "@/lib/powerQueryProgress";
import { getPracticeSummary, loadPracticeLabState } from "@/lib/practiceLab";
import { practiceQuestions } from "@/lib/practiceLabQuestions";
import { pythonLessons } from "@/lib/pythonLessons";
import { loadPythonProgress } from "@/lib/pythonProgress";
import { sqlLessons } from "@/lib/sqlLessons";
import { loadSQLProgress } from "@/lib/sqlProgress";
import { loadStatisticsProgress } from "@/lib/statisticsProgress";
import { statisticsLessons } from "@/lib/statisticsLessons";
import { loadStreak, type StreakData } from "@/lib/streak";
import { loadXP } from "@/lib/storage";
import { loadUnlockedAchievements } from "@/lib/unlockedAchievements";
import { loadUserPreferences } from "@/lib/userPreferences";
import {
  loadAnalyticsHistory,
  recordAnalyticsSnapshot,
} from "@/lib/analyticsHistory";

const STUDY_STATS_STORAGE_KEY = "databloom-study-stats-v2";
const DAILY_TASKS_STORAGE_KEY = "databloom-daily-tasks";
const DAILY_TASKS_DATE_KEY = "databloom-daily-date";
const FOCUS_SESSIONS_STORAGE_KEY = "databloom-focus-sessions";

export type StudioProgressId =
  | "excel"
  | "sql"
  | "power-bi"
  | "power-query"
  | "business-analytics"
  | "datasets"
  | "python"
  | "statistics"
  | "dashboards";

export type StudioProgress = {
  id: StudioProgressId;
  name: string;
  icon: string;
  href: string;
  color: string;
  completed: number;
  total: number;
  percentage: number;
};

export type WeeklyActivity = {
  date: string;
  label: string;
  day: string;
  lessons: number;
  xp: number;
  xpEarned: number;
  practice: number;
  practiceCompleted: number;
  focusSessions: number;
  minutes: number;
  goals: number;
};

export type AnalyticsLevel = {
  name: string;
  minXP: number;
  badge: string;
};

export type AnalyticsTotals = {
  completedLessons: number;
  completedPractice: number;
  practiceSessions: number;
  practiceAccuracy: number;
  interviewQuestions: number;
  interviewMockSessions: number;
  interviewAverageScore: number;
  careerReadiness: number;
  careerTasks: number;
  careerApplications: number;
  dashboardProjects: number;
  focusSessions: number;
};

export type AchievementAnalytics = {
  unlockedCount: number;
  lockedCount: number;
  completionPercentage: number;
  unlocked: Achievement[];
};

export type ProductivityAnalytics = {
  completedDailyGoals: number;
  totalDailyGoals: number;
  plannerProgress: number | null;
  todayLessons: number;
  todayMinutes: number;
  todayGoals: number;
  focusSessions: number;
  dailyGoalMinutes: string;
  suggestedNextAction: string;
  suggestedNextHref: string;
};

export type PersonalInsight = {
  title: string;
  message: string;
  detail: string;
  actionLabel: string;
  actionHref: string;
  strongestStudio: StudioProgress | null;
  weakestStudio: StudioProgress | null;
};

export type AnalyticsSnapshot = {
  generatedAt: string;
  userName: string;
  xp: number;
  level: AnalyticsLevel;
  nextLevel: AnalyticsLevel | null;
  xpIntoLevel: number;
  xpForNextLevel: number;
  xpRemaining: number;
  xpProgressPercentage: number;
  isMaxLevel: boolean;
  streak: StreakData;
  studioProgress: StudioProgress[];
  totals: AnalyticsTotals;
  achievements: AchievementAnalytics;
  productivity: ProductivityAnalytics;
  insight: PersonalInsight;
  weeklyActivity: WeeklyActivity[];
};

type StoredDailyStats = {
  lessons: number;
  minutes: number;
  xpEarned: number;
  goalsCompleted: number;
};

type StoredDailyTask = {
  done: boolean;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && "localStorage" in window;
}

function nonNegativeNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, value)
    : 0;
}

function nonNegativeInteger(value: unknown): number {
  return Math.floor(nonNegativeNumber(value));
}

function percentage(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((completed / total) * 100)));
}

function uniqueStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(value.filter((item): item is string => typeof item === "string")),
  );
}

function countKnownIds(ids: unknown, knownIds: Iterable<string>): number {
  const known = new Set(knownIds);
  return uniqueStrings(ids).filter((id) => known.has(id)).length;
}

function readStoredJSON(key: string): unknown {
  if (!canUseStorage()) return undefined;

  try {
    const saved = window.localStorage.getItem(key);
    return saved ? JSON.parse(saved) : undefined;
  } catch {
    return undefined;
  }
}

function safeSourceRead<T>(loader: () => T, fallback: T): T {
  try {
    return loader();
  } catch {
    return fallback;
  }
}

function loadStudyStats(): Record<string, StoredDailyStats> {
  const stored = readStoredJSON(STUDY_STATS_STORAGE_KEY);
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) return {};

  const days: Record<string, StoredDailyStats> = {};

  for (const [date, value] of Object.entries(stored)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;

    const stats = value as Partial<StoredDailyStats>;
    days[date] = {
      lessons: nonNegativeInteger(stats.lessons),
      minutes: nonNegativeInteger(stats.minutes),
      xpEarned: nonNegativeInteger(stats.xpEarned),
      goalsCompleted: nonNegativeInteger(stats.goalsCompleted),
    };
  }

  return days;
}

function getLastSevenDateKeys(referenceDate = new Date()): string[] {
  const reference = new Date(referenceDate);
  reference.setHours(12, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(reference);
    date.setDate(reference.getDate() - (6 - index));
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
}

function loadWeeklyActivity(referenceDate = new Date()): WeeklyActivity[] {
  const studyStats = loadStudyStats();
  const analyticsHistory = loadAnalyticsHistory();
  const dayFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
  });

  return getLastSevenDateKeys(referenceDate).map((date) => {
    const recorded = studyStats[date];
    const observed = analyticsHistory.days[date];
    // The legacy study-stats "lessons" field is also incremented by generic
    // daily goals. Studio snapshot deltas are the only reliable lesson count.
    const lessons = observed?.lessons ?? 0;
    const xpEarned = Math.max(recorded?.xpEarned ?? 0, observed?.xpEarned ?? 0);
    const practiceCompleted = Math.max(
      0,
      observed?.practiceCompleted ?? 0,
    );
    const focusSessions = Math.max(0, observed?.focusSessions ?? 0);
    const day = dayFormatter.format(new Date(`${date}T12:00:00`));

    return {
      date,
      label: day,
      day,
      lessons,
      xp: xpEarned,
      xpEarned,
      practice: practiceCompleted,
      practiceCompleted,
      focusSessions,
      minutes: recorded?.minutes ?? 0,
      goals: recorded?.goalsCompleted ?? 0,
    };
  });
}

function loadTodayDailyTasks(): StoredDailyTask[] {
  if (!canUseStorage()) return [];

  try {
    if (
      window.localStorage.getItem(DAILY_TASKS_DATE_KEY) !==
      new Date().toDateString()
    ) {
      return [];
    }

    const stored = readStoredJSON(DAILY_TASKS_STORAGE_KEY);
    if (!Array.isArray(stored)) return [];

    return stored
      .filter(
        (task): task is Record<string, unknown> =>
          Boolean(task) && typeof task === "object" && !Array.isArray(task),
      )
      .map((task) => ({ done: task.done === true }));
  } catch {
    return [];
  }
}

function loadFocusSessions(): number {
  if (!canUseStorage()) return 0;

  try {
    const value = Number(
      window.localStorage.getItem(FOCUS_SESSIONS_STORAGE_KEY) ?? "0",
    );
    return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  } catch {
    return 0;
  }
}

function getStudioProgress(): StudioProgress[] {
  let learnedFormulaIds: string[] = [];

  try {
    learnedFormulaIds = uniqueStrings(getLearnedFormulas());
  } catch {
    learnedFormulaIds = [];
  }

  const sql = loadSQLProgress();
  const powerBI = loadPowerBIProgress();
  const powerQuery = loadPowerQueryProgress();
  const businessAnalytics = loadBusinessAnalyticsProgress();
  const datasets = loadDatasetLibraryProgress();
  const python = loadPythonProgress();
  const statistics = loadStatisticsProgress();

  const definitions: Array<Omit<StudioProgress, "percentage">> = [
    {
      id: "excel",
      name: "Formula Studio",
      icon: "📗",
      href: "/formula-studio",
      color: "#10b981",
      completed: countKnownIds(
        learnedFormulaIds,
        formulas.map((formula) => formula.id),
      ),
      total: formulas.length,
    },
    {
      id: "sql",
      name: "SQL Studio",
      icon: "🗄️",
      href: "/sql-studio",
      color: "#0ea5e9",
      completed: countKnownIds(
        sql.completedLessonIds,
        sqlLessons.map((lesson) => lesson.id),
      ),
      total: sqlLessons.length,
    },
    {
      id: "power-bi",
      name: "Power BI + DAX",
      icon: "📊",
      href: "/power-bi-studio",
      color: "#f59e0b",
      completed:
        countKnownIds(
          powerBI.completedLessonIds,
          powerBILessons.map((lesson) => lesson.id),
        ) +
        countKnownIds(
          powerBI.completedDAXIds,
          daxLessons.map((lesson) => lesson.id),
        ),
      total: powerBILessons.length + daxLessons.length,
    },
    {
      id: "power-query",
      name: "Power Query Studio",
      icon: "🧹",
      href: "/power-query-studio",
      color: "#0f766e",
      completed: countKnownIds(
        powerQuery.completedLessonIds,
        powerQueryLessons.map((lesson) => lesson.id),
      ),
      total: powerQueryLessons.length,
    },
    {
      id: "business-analytics",
      name: "Business Analytics Studio",
      icon: "💼",
      href: "/business-analytics-studio",
      color: "#4f46e5",
      completed: countKnownIds(
        businessAnalytics.completedLessonIds,
        businessAnalyticsLessons.map((lesson) => lesson.id),
      ),
      total: businessAnalyticsLessons.length,
    },
    {
      id: "datasets",
      name: "Dataset Library",
      icon: "🗂️",
      href: "/dataset-library",
      color: "#7c3aed",
      completed: countKnownIds(
        datasets.completedLessonIds,
        datasetLibrary.map((dataset) => dataset.id),
      ),
      total: datasetLibrary.length,
    },
    {
      id: "python",
      name: "Python Studio",
      icon: "🐍",
      href: "/python-studio",
      color: "#3b82f6",
      completed: countKnownIds(
        python.completedLessonIds,
        pythonLessons.map((lesson) => lesson.id),
      ),
      total: pythonLessons.length,
    },
    {
      id: "statistics",
      name: "Statistics Studio",
      icon: "📐",
      href: "/statistics-studio",
      color: "#d946ef",
      completed: countKnownIds(
        statistics.completedLessonIds,
        statisticsLessons.map((lesson) => lesson.id),
      ),
      total: statisticsLessons.length,
    },
    {
      id: "dashboards",
      name: "Dashboard Projects",
      icon: "🎨",
      href: "/dashboard",
      color: "#8b5cf6",
      completed: countKnownIds(
        getCompletedDashboards(),
        dashboardProjects.map((project) => project.id),
      ),
      total: dashboardProjects.length,
    },
  ];

  return definitions.map((studio) => ({
    ...studio,
    percentage: percentage(studio.completed, studio.total),
  }));
}

function getCompletedPracticeCount(): number {
  const sql = loadSQLProgress();
  const powerBI = loadPowerBIProgress();
  const powerQuery = loadPowerQueryProgress();
  const businessAnalytics = loadBusinessAnalyticsProgress();
  const python = loadPythonProgress();
  const statistics = loadStatisticsProgress();
  const dashboards = loadDashboardPracticeState();
  const dashboardTaskIds = practiceProjects.flatMap((project) =>
    project.tasks.map((task) => `${project.id}:${task.id}`),
  );
  const practiceLab = loadPracticeLabState();

  return (
    countKnownIds(
      sql.completedPracticeIds,
      sqlLessons.map((lesson) => lesson.id),
    ) +
    countKnownIds(
      powerBI.completedPracticeIds,
      [...powerBILessons, ...daxLessons].map((lesson) => lesson.id),
    ) +
    countKnownIds(
      powerQuery.completedPracticeIds,
      powerQueryLessons.map((lesson) => lesson.id),
    ) +
    countKnownIds(
      businessAnalytics.completedPracticeIds,
      businessAnalyticsLessons.map((lesson) => lesson.id),
    ) +
    countKnownIds(
      python.completedPracticeIds,
      pythonLessons.map((lesson) => lesson.id),
    ) +
    countKnownIds(
      statistics.completedPracticeIds,
      statisticsLessons.map((lesson) => lesson.id),
    ) +
    countKnownIds(dashboards.completedTaskIds, dashboardTaskIds) +
    countKnownIds(
      practiceLab.completedQuestionIds,
      practiceQuestions.map((question) => question.id),
    )
  );
}

function getLevelProgress(xp: number) {
  let levelIndex = 0;

  levels.forEach((candidate, index) => {
    if (xp >= candidate.minXP) levelIndex = index;
  });

  const level = levels[levelIndex];
  const nextLevel = levels[levelIndex + 1] ?? null;
  const xpIntoLevel = Math.max(0, xp - level.minXP);
  const xpForNextLevel = nextLevel
    ? Math.max(1, nextLevel.minXP - level.minXP)
    : 0;
  const xpRemaining = nextLevel ? Math.max(0, nextLevel.minXP - xp) : 0;

  return {
    level,
    nextLevel,
    xpIntoLevel,
    xpForNextLevel,
    xpRemaining,
    xpProgressPercentage: nextLevel
      ? percentage(xpIntoLevel, xpForNextLevel)
      : 100,
    isMaxLevel: nextLevel === null,
  };
}

function normalizeStreak(value: unknown): StreakData {
  const streak =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Partial<StreakData>)
      : {};

  return {
    current: nonNegativeInteger(streak.current),
    longest: nonNegativeInteger(streak.longest),
    lastStudyDate:
      typeof streak.lastStudyDate === "string" ? streak.lastStudyDate : null,
  };
}

function getAchievementAnalytics(): AchievementAnalytics {
  let unlockedIds: string[] = [];

  try {
    unlockedIds = uniqueStrings(loadUnlockedAchievements());
  } catch {
    unlockedIds = [];
  }

  const unlockedSet = new Set(unlockedIds);
  const unlocked = achievements.filter((achievement) =>
    unlockedSet.has(achievement.id),
  );

  return {
    unlockedCount: unlocked.length,
    lockedCount: Math.max(0, achievements.length - unlocked.length),
    completionPercentage: percentage(unlocked.length, achievements.length),
    unlocked,
  };
}

function chooseStudios(studios: StudioProgress[]) {
  const withProgress = studios.filter((studio) => studio.completed > 0);
  const incomplete = studios.filter(
    (studio) => studio.total > 0 && studio.completed < studio.total,
  );

  const strongestStudio = withProgress.length
    ? [...withProgress].sort(
        (left, right) =>
          right.percentage - left.percentage ||
          right.completed - left.completed ||
          studios.indexOf(left) - studios.indexOf(right),
      )[0]
    : null;
  const weakestStudio = incomplete.length
    ? [...incomplete].sort(
        (left, right) =>
          left.percentage - right.percentage ||
          left.completed - right.completed ||
          studios.indexOf(left) - studios.indexOf(right),
      )[0]
    : null;

  return { strongestStudio, weakestStudio };
}

function getInsight(
  studios: StudioProgress[],
  xpRemaining: number,
  nextLevel: AnalyticsLevel | null,
  completedDailyGoals: number,
  totalDailyGoals: number,
): PersonalInsight {
  const { strongestStudio, weakestStudio } = chooseStudios(studios);
  const hasIncompleteDailyGoal =
    totalDailyGoals > 0 && completedDailyGoals < totalDailyGoals;
  const allStudiosComplete = studios.every(
    (studio) => studio.total > 0 && studio.completed >= studio.total,
  );

  let actionLabel = "Open Formula Studio";
  let actionHref = "/formula-studio";

  if (hasIncompleteDailyGoal) {
    actionLabel = "Continue today’s goals";
    actionHref = "/";
  } else if (weakestStudio) {
    actionLabel = `Continue ${weakestStudio.name}`;
    actionHref = weakestStudio.href;
  } else if (allStudiosComplete) {
    actionLabel = "Keep sharp in Practice Lab";
    actionHref = "/practice-lab";
  }

  const title = strongestStudio
    ? `${strongestStudio.icon} ${strongestStudio.name} is blooming`
    : "🌱 Your learning garden is ready";
  const message = strongestStudio
    ? `${strongestStudio.name} is currently your strongest studio at ${strongestStudio.percentage}% complete.`
    : "Complete your first lesson to reveal your strongest skill and learning pattern.";

  let detail = "Your next completed lesson will start shaping this insight.";
  if (hasIncompleteDailyGoal) {
    detail = `You have ${totalDailyGoals - completedDailyGoals} daily goal${
      totalDailyGoals - completedDailyGoals === 1 ? "" : "s"
    } left today.`;
  } else if (nextLevel) {
    detail = `You are ${xpRemaining.toLocaleString()} XP away from ${nextLevel.name}.`;
  } else if (allStudiosComplete) {
    detail = "You have completed every currently available studio lesson.";
  }

  return {
    title,
    message,
    detail,
    actionLabel,
    actionHref,
    strongestStudio,
    weakestStudio,
  };
}

function buildAnalyticsSnapshot(): AnalyticsSnapshot {
  const generatedAt = new Date().toISOString();
  const preferences = loadUserPreferences();
  const parsedXP = safeSourceRead(loadXP, 0);
  const xp = nonNegativeInteger(parsedXP);
  const levelProgress = getLevelProgress(xp);
  const streak = normalizeStreak(
    safeSourceRead(loadStreak, {
      current: 0,
      longest: 0,
      lastStudyDate: null,
    }),
  );
  const studioProgress = getStudioProgress();
  const completedLessons = studioProgress
    .filter((studio) => studio.id !== "dashboards")
    .reduce((total, studio) => total + studio.completed, 0);
  const dashboardProjectsCompleted =
    studioProgress.find((studio) => studio.id === "dashboards")?.completed ?? 0;
  const completedPractice = getCompletedPracticeCount();
  const practiceSummary = getPracticeSummary(loadPracticeLabState());
  const interviewSummary = getInterviewSummary(loadInterviewHubState());
  const careerSummary = getCareerSummary(loadCareerHubState());
  const focusSessions = loadFocusSessions();
  const achievementAnalytics = getAchievementAnalytics();
  const weeklyActivity = loadWeeklyActivity(new Date(generatedAt));
  const todayDate = getLastSevenDateKeys(new Date(generatedAt)).at(-1) ?? "";
  const todayActivity = weeklyActivity.find((day) => day.date === todayDate);
  const dailyTasks = loadTodayDailyTasks();
  const completedDailyGoals = dailyTasks.filter((task) => task.done).length;
  const totalDailyGoals = dailyTasks.length;
  const insight = getInsight(
    studioProgress,
    levelProgress.xpRemaining,
    levelProgress.nextLevel,
    completedDailyGoals,
    totalDailyGoals,
  );

  return {
    generatedAt,
    userName: preferences.userName || "Data learner",
    xp,
    ...levelProgress,
    streak,
    studioProgress,
    totals: {
      completedLessons,
      completedPractice,
      practiceSessions: practiceSummary.sessions,
      practiceAccuracy: practiceSummary.averageAccuracy,
      interviewQuestions: interviewSummary.learned,
      interviewMockSessions: interviewSummary.sessions,
      interviewAverageScore: interviewSummary.averageScore,
      careerReadiness: careerSummary.readiness,
      careerTasks: careerSummary.completedTasks,
      careerApplications: careerSummary.applications,
      dashboardProjects: dashboardProjectsCompleted,
      focusSessions,
    },
    achievements: achievementAnalytics,
    productivity: {
      completedDailyGoals,
      totalDailyGoals,
      plannerProgress: null,
      todayLessons: todayActivity?.lessons ?? 0,
      todayMinutes: todayActivity?.minutes ?? 0,
      todayGoals: Math.max(todayActivity?.goals ?? 0, completedDailyGoals),
      focusSessions,
      dailyGoalMinutes: preferences.dailyGoal,
      suggestedNextAction: insight.actionLabel,
      suggestedNextHref: insight.actionHref,
    },
    insight,
    weeklyActivity,
  };
}

export function loadAnalyticsSnapshot(): AnalyticsSnapshot {
  return buildAnalyticsSnapshot();
}

/**
 * Re-reads every existing progress source, records only safe same-day deltas,
 * and then rebuilds the snapshot so the charts include the latest history.
 */
export function refreshAnalyticsSnapshot(): AnalyticsSnapshot {
  const snapshot = buildAnalyticsSnapshot();
  recordAnalyticsSnapshot(snapshot);
  return buildAnalyticsSnapshot();
}

export function exportAnalyticsSummary(snapshot: AnalyticsSnapshot) {
  return {
    generatedAt: snapshot.generatedAt,
    userName: snapshot.userName,
    xp: snapshot.xp,
    level: snapshot.level.name,
    nextLevel: snapshot.nextLevel?.name ?? null,
    xpRemaining: snapshot.xpRemaining,
    streak: snapshot.streak,
    achievements: {
      unlocked: snapshot.achievements.unlockedCount,
      total: achievements.length,
      badges: snapshot.achievements.unlocked.map((achievement) => ({
        id: achievement.id,
        title: achievement.title,
      })),
    },
    studioProgress: snapshot.studioProgress.map((studio) => ({
      id: studio.id,
      name: studio.name,
      completed: studio.completed,
      total: studio.total,
      percentage: studio.percentage,
    })),
    completedLessons: snapshot.totals.completedLessons,
    completedPractice: snapshot.totals.completedPractice,
    dashboardProjects: snapshot.totals.dashboardProjects,
    focusSessions: snapshot.totals.focusSessions,
  };
}

export function createAnalyticsSummaryBlob(snapshot: AnalyticsSnapshot): Blob {
  return new Blob([JSON.stringify(exportAnalyticsSummary(snapshot), null, 2)], {
    type: "application/json;charset=utf-8",
  });
}

export function downloadAnalyticsSummary(snapshot: AnalyticsSnapshot): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  try {
    const url = window.URL.createObjectURL(createAnalyticsSummaryBlob(snapshot));
    const link = document.createElement("a");
    link.href = url;
    link.download = `databloom-analytics-${snapshot.generatedAt.slice(0, 10)}.json`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
    return true;
  } catch {
    return false;
  }
}
