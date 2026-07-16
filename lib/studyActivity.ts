import { incrementStats, type DailyStats } from "@/lib/stats";
import { registerStudyDay, type StreakData } from "@/lib/streak";

export const STUDY_ACTIVITY_EVENT = "databloom:study-activity";

export type StudyActivityKind = "lesson" | "practice" | "task" | "study";

export type StudyActivity = {
  kind: StudyActivityKind;
  source: string;
  minutes?: number;
  xp?: number;
  goals?: number;
};

export type StudyActivityResult = {
  stats: DailyStats;
  streak: StreakData;
};

/**
 * Registers a completion that its owning module has already verified as new.
 * XP remains owned by the caller so this helper can never duplicate rewards.
 */
export function registerStudyActivity(
  activity: StudyActivity,
): StudyActivityResult {
  const stats = incrementStats(
    activity.kind === "lesson" ? 1 : 0,
    Math.max(0, Math.round(activity.minutes ?? 0)),
    Math.max(0, Math.round(activity.xp ?? 0)),
    Math.max(0, Math.round(activity.goals ?? (activity.kind === "task" ? 1 : 0))),
  );
  const streak = registerStudyDay();

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(STUDY_ACTIVITY_EVENT, { detail: activity }),
    );
  }

  return { stats, streak };
}
