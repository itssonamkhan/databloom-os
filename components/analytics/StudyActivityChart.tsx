"use client";

import { useReducedMotion } from "framer-motion";
import { Clock3 } from "lucide-react";
import {
  Area,
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

export type StudyActivityChartProps = {
  data: WeeklyActivity[];
  title?: string;
};

export default function StudyActivityChart({
  data,
  title = "Study rhythm",
}: StudyActivityChartProps) {
  const reduceMotion = useReducedMotion();
  const chartData = data.map((day) => ({
    ...day,
    learningActivities: day.lessons + day.practice + day.focusSessions,
  }));
  const isEmpty =
    chartData.length === 0 ||
    chartData.every(
      (day) =>
        day.minutes === 0 && day.learningActivities === 0 && day.goals === 0,
    );
  const totalMinutes = chartData.reduce((total, day) => total + day.minutes, 0);

  return (
    <section className="min-w-0 rounded-[2rem] border border-sky-100 bg-white/85 p-5 shadow-lg backdrop-blur-xl sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
          <Clock3 size={20} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Real recorded minutes, learning activities, and finished goals.
          </p>
        </div>
      </div>

      {isEmpty ? (
        <EmptyAnalyticsState
          className="mt-5 min-h-72"
          title="Your study rhythm is just beginning"
          description="Recorded study time, learning activities, and completed goals will grow here."
        />
      ) : (
        <>
          <p className="sr-only">
            {totalMinutes} study minutes have been recorded during this seven-day
            period.
          </p>
          <div
            className="mt-5 h-80 w-full min-w-0 overflow-hidden"
            role="img"
            aria-label="Seven-day study activity chart"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 12, right: 4, bottom: 4, left: -18 }}
                accessibilityLayer
              >
                <defs>
                  <linearGradient id="analyticsMinutesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e0f2fe" strokeDasharray="4 4" vertical={false} />
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
                  yAxisId="activity"
                  orientation="right"
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#7e22ce", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    border: "1px solid #bae6fd",
                    borderRadius: "16px",
                    backgroundColor: "rgba(255,255,255,0.96)",
                    boxShadow: "0 12px 30px rgba(3,105,161,0.1)",
                    color: "#0f172a",
                  }}
                  cursor={{ fill: "#f0f9ff" }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ color: "#334155", fontSize: "12px", paddingTop: "12px" }}
                />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  name="Minutes"
                  stroke="#0284c7"
                  strokeWidth={3}
                  fill="url(#analyticsMinutesGradient)"
                  isAnimationActive={!reduceMotion}
                />
                <Bar
                  yAxisId="activity"
                  dataKey="learningActivities"
                  name="Activities"
                  fill="#8b5cf6"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={24}
                  isAnimationActive={!reduceMotion}
                />
                <Line
                  yAxisId="activity"
                  type="monotone"
                  dataKey="goals"
                  name="Goals"
                  stroke="#ec4899"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#ec4899", strokeWidth: 0 }}
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
