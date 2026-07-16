"use client";

import { useReducedMotion } from "framer-motion";
import { PieChart as PieChartIcon } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import EmptyAnalyticsState from "@/components/analytics/EmptyAnalyticsState";
import type { StudioProgress } from "@/lib/analytics";

export type LearningDistributionChartProps = {
  data: StudioProgress[];
  title?: string;
};

const studioColors: Record<StudioProgress["id"], string> = {
  excel: "#10b981",
  sql: "#3b82f6",
  "power-bi": "#f59e0b",
  "power-query": "#0f766e",
  "business-analytics": "#4f46e5",
  datasets: "#7c3aed",
  python: "#6366f1",
  statistics: "#ec4899",
  tableau: "#2563eb",
  dashboards: "#8b5cf6",
};

export default function LearningDistributionChart({
  data,
  title = "Learning distribution",
}: LearningDistributionChartProps) {
  const reduceMotion = useReducedMotion();
  const chartData = data.filter((studio) => studio.completed > 0);
  const totalCompleted = chartData.reduce(
    (total, studio) => total + studio.completed,
    0,
  );

  return (
    <section className="min-w-0 rounded-[2rem] border border-pink-100 bg-white/85 p-5 shadow-lg backdrop-blur-xl sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-pink-100 text-pink-700">
          <PieChartIcon size={20} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Where your completed learning is blooming.
          </p>
        </div>
      </div>

      {totalCompleted === 0 ? (
        <EmptyAnalyticsState
          className="mt-5 min-h-72"
          title="No completed learning yet"
          description="Complete your first lesson or dashboard project to reveal your learning mix."
        />
      ) : (
        <>
          <p className="sr-only">
            {totalCompleted} total completed items across {chartData.length} learning
            studios.
          </p>
          <div
            className="relative mt-4 h-64 w-full min-w-0 overflow-hidden"
            role="img"
            aria-label="Donut chart of completed learning by studio"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart accessibilityLayer>
                <Pie
                  data={chartData}
                  dataKey="completed"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={3}
                  stroke="#ffffff"
                  strokeWidth={3}
                  isAnimationActive={!reduceMotion}
                >
                  {chartData.map((studio) => (
                    <Cell key={studio.id} fill={studioColors[studio.id]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    border: "1px solid #fbcfe8",
                    borderRadius: "16px",
                    backgroundColor: "rgba(255,255,255,0.96)",
                    boxShadow: "0 12px 30px rgba(157,23,77,0.1)",
                    color: "#0f172a",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
              <span className="text-2xl font-black text-slate-950">{totalCompleted}</span>
              <span className="text-xs font-semibold text-slate-600">completed</span>
            </div>
          </div>

          <ul className="mt-2 grid gap-2 sm:grid-cols-2" aria-label="Learning distribution details">
            {chartData.map((studio) => {
              const share = Math.round((studio.completed / totalCompleted) * 100);
              return (
                <li
                  key={studio.id}
                  className="flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-slate-50/80 px-3 py-2 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2 font-semibold text-slate-700">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: studioColors[studio.id] }}
                      aria-hidden="true"
                    />
                    <span className="truncate">{studio.name}</span>
                  </span>
                  <span className="shrink-0 font-black text-slate-900">{share}%</span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
