"use client";

import { useEffect, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type TodayProgress = {
  lessons: number;
  minutes: number;
  xp: number;
};

type ProgressRow = Record<string, unknown>;

const EMPTY_PROGRESS: TodayProgress = {
  lessons: 0,
  minutes: 0,
  xp: 0,
};

function readMetric(row: ProgressRow, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return Math.max(0, value);
    }
  }

  return 0;
}

function sumTodayProgress(rows: ProgressRow[]): TodayProgress {
  return rows.reduce<TodayProgress>(
    (total, row) => ({
      lessons:
        total.lessons +
        readMetric(row, ["lessons", "lesson_count", "lessons_completed"]),
      minutes:
        total.minutes +
        readMetric(row, ["minutes", "minutes_studied", "duration_minutes"]),
      xp: total.xp + readMetric(row, ["xp", "xp_earned", "xpEarned"]),
    }),
    { ...EMPTY_PROGRESS },
  );
}

export default function StudyStats() {
  const [progress, setProgress] = useState<TodayProgress>(EMPTY_PROGRESS);
  const activeUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function loadTodayProgress(user: { id: string }) {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("study_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", today);

      if (!active || activeUserIdRef.current !== user.id) return;

      if (error || !data || data.length === 0) {
        setProgress({ ...EMPTY_PROGRESS });
        return;
      }

      setProgress(sumTodayProgress(data as ProgressRow[]));
    }

    function applyAuthenticatedUser(user: { id: string } | null) {
      activeUserIdRef.current = user?.id ?? null;
      setProgress({ ...EMPTY_PROGRESS });

      if (user) {
        window.setTimeout(() => {
          void loadTodayProgress(user);
        }, 0);
      }
    }

    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (active) applyAuthenticatedUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) applyAuthenticatedUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="rounded-3xl border border-white/50 bg-white/40 p-6 shadow-lg backdrop-blur-xl">
      <h2 className="text-xl font-bold text-gray-800">
        📊 Today’s Progress
      </h2>

      <p className="mt-2 text-gray-600">
        Your learning journey today 🌸
      </p>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white/60 p-4 text-center">
          <h3 className="text-2xl font-bold text-gray-800">
            {progress.lessons}
          </h3>
          <p className="text-sm text-gray-600">Lessons</p>
        </div>

        <div className="rounded-2xl bg-white/60 p-4 text-center">
          <h3 className="text-2xl font-bold text-gray-800">
            {progress.minutes}
          </h3>
          <p className="text-sm text-gray-600">Minutes</p>
        </div>

        <div className="rounded-2xl bg-white/60 p-4 text-center">
          <h3 className="text-2xl font-bold text-gray-800">
            {progress.xp}
          </h3>
          <p className="text-sm text-gray-600">XP</p>
        </div>
      </div>
    </div>
  );
}
