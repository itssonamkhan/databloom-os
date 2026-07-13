"use client";

import { useReducedMotion } from "framer-motion";
import { Activity } from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import EmptyAnalyticsState from "@/components/analytics/EmptyAnalyticsState";
import type { WeeklyActivity } from "@/lib/analytics";

export type WeeklyActivityChartProps = {
  data: WeeklyActivity[];
  title?: string;
};

const tooltipStyle = {
  border: "1px solid #e9d5ff",
  borderRadius: "16px",
  backgroundColor: "rgba(255,255,255,0.96)",
  boxShadow: "0 12px 30px rgba(88,28,135,0.12)",
  color: "#0f172a",
};

export default function WeeklyActivityChart({
  data,
  title = "Weekly activity",
}: WeeklyActivityChartProps) {
  const reduceMotion = useReducedMotion();
  const isEmpty =
    data.length === 0 ||
    data.every(
      (day) =>
        day.lessons === 0 &&
        day.xp === 0 &&
        day.practice === 0 &&
        day.focusSessions === 0,
    );

  const totals = data.reduce(
    (sum, day) => ({
      lessons: sum.lessons + day.lessons,
      xp: sum.xp + day.xp,
      practice: sum.practice + day.practice,
      focus: sum.focus + day.focusSessions,
    }),
    { lessons: 0, xp: 0, practice: 0, focus: 0 },
  );

  return (
    <section className="min-w-0 rounded-[2rem] border border-purple-100 bg-white/85 p-5 shadow-lg backdrop-blur-xl sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
          <Activity size={20} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Lessons, practice, focus sessions, and XP from the last seven days.
          </p>
        </div>
      </div>

      {isEmpty ? (
        <EmptyAnalyticsState
          className="mt-5 min-h-72"
          title="No weekly activity recorded yet"
          description="New learning activity will appear here as you complete lessons, practice, and focus sessions."
        />
      ) : (
        <>
          <p className="sr-only">
            This week: {totals.lessons} lessons, {totals.practice} practice
            tasks, {totals.focus} focus sessions, and {totals.xp} XP.
          </p>
          <div
            className="mt-5 h-80 w-full min-w-0 overflow-hidden"
            role="img"
            aria-label="Seven-day activity chart"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{ top: 12, right: 4, bottom: 4, left: -18 }}
                accessibilityLayer
              >
                <CartesianGrid stroke="#ede9fe" strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#475569", fontSize: 12, fontWeight: 600 }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <YAxis
                  yAxisId="xp"
                  orientation="right"
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#7e22ce", fontSize: 11 }}
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#faf5ff" }} />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ color: "#334155", fontSize: "12px", paddingTop: "12px" }}
                />
                <Bar
                  dataKey="lessons"
                  name="Lessons"
                  fill="#8b5cf6"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={16}
                  isAnimationActive={!reduceMotion}
                />
                <Bar
                  dataKey="practice"
                  name="Practice"
                  fill="#ec4899"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={16}
                  isAnimationActive={!reduceMotion}
                />
                <Bar
                  dataKey="focusSessions"
                  name="Focus"
                  fill="#14b8a6"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={16}
                  isAnimationActive={!reduceMotion}
                />
                <Line
                  yAxisId="xp"
                  type="monotone"
                  dataKey="xp"
                  name="XP"
                  stroke="#c026d3"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "#c026d3", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={!reduceMotion}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </section>
  );
}
