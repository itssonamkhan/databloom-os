"use client";

import { useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";

import { useProgress } from "@/context/ProgressContext";
import {
  DASHBOARD_PRACTICE_EVENT,
  DASHBOARD_PRACTICE_STORAGE_KEY,
} from "@/lib/dashboardPractice";
import { DASHBOARD_STORAGE_EVENT } from "@/lib/dashboardProgress";
import {
  INTERVIEW_HUB_EVENT,
  INTERVIEW_HUB_STORAGE_KEY,
} from "@/lib/interviewHub";
import { POWER_BI_PROGRESS_EVENT } from "@/lib/powerBIProgress";
import {
  PRACTICE_LAB_EVENT,
  PRACTICE_LAB_STORAGE_KEY,
} from "@/lib/practiceLab";
import { PYTHON_PROGRESS_EVENT } from "@/lib/pythonProgress";
import { SQL_PROGRESS_EVENT } from "@/lib/sqlProgress";
import { STATISTICS_PROGRESS_EVENT } from "@/lib/statisticsProgress";
import { ACHIEVEMENTS_UPDATED_EVENT } from "@/lib/unlockedAchievements";
import { USER_PREFERENCES_EVENT } from "@/lib/userPreferences";

const progressEvents = [
  SQL_PROGRESS_EVENT,
  POWER_BI_PROGRESS_EVENT,
  PYTHON_PROGRESS_EVENT,
  STATISTICS_PROGRESS_EVENT,
  DASHBOARD_STORAGE_EVENT,
  DASHBOARD_PRACTICE_EVENT,
  PRACTICE_LAB_EVENT,
  INTERVIEW_HUB_EVENT,
  ACHIEVEMENTS_UPDATED_EVENT,
  USER_PREFERENCES_EVENT,
] as const;

const trackedStorageKeys = new Set([
  "databloom-xp",
  "databloom-streak",
  "databloom-study-stats-v2",
  "databloom-learned-formulas",
  "databloom-sql-progress-v1",
  "databloom-power-bi-progress-v1",
  "databloom-python-progress-v1",
  "databloom-statistics-progress-v1",
  "dashboard_progress",
  DASHBOARD_PRACTICE_STORAGE_KEY,
  PRACTICE_LAB_STORAGE_KEY,
  INTERVIEW_HUB_STORAGE_KEY,
  "databloom-unlocked-achievements",
  "databloom-daily-tasks",
  "databloom-daily-date",
  "databloom-focus-sessions",
  "userName",
  "dailyGoal",
]);

/**
 * Keeps the optional Analytics history baseline alive across every app route.
 * It only reads existing progress and writes analytics snapshots; rewards and
 * completion state remain owned by their original modules.
 */
export default function AnalyticsHistoryTracker() {
  const pathname = usePathname();
  const { xp } = useProgress();

  const record = useCallback(() => {
    // Keep the lesson libraries out of the shared initial bundle. The helper
    // is cached after its first background load.
    void import("@/lib/analytics")
      .then(({ refreshAnalyticsSnapshot }) => {
        refreshAnalyticsSnapshot();
      })
      .catch(() => {
        // Analytics remains optional if a background chunk cannot be loaded.
      });
  }, []);

  useEffect(() => {
    progressEvents.forEach((eventName) => {
      window.addEventListener(eventName, record);
    });

    function handleStorage(event: StorageEvent) {
      if (event.key === null || trackedStorageKeys.has(event.key)) {
        record();
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") record();
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", record);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const interval = window.setInterval(record, 60_000);

    return () => {
      progressEvents.forEach((eventName) => {
        window.removeEventListener(eventName, record);
      });
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", record);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearInterval(interval);
    };
  }, [record]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(record);
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, record, xp]);

  return null;
}
