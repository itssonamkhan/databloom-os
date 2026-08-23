"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Activity, UserPlus, Users, UserRoundCheck } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AnalyticsStatCard from "@/components/analytics/AnalyticsStatCard";

const PERIODS = ["7d", "30d", "90d"] as const;
type Period = (typeof PERIODS)[number];

type VisitorTrend = {
  date: string;
  visitors: number;
};

type VisitorSummary = {
  period: Period;
  totalVisitors: number;
  activeVisitors: number;
  newVisitors: number;
  returningVisitors: number;
  visitorsOverTime: VisitorTrend[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isVisitorSummary(value: unknown, period: Period): value is VisitorSummary {
  if (
    !isRecord(value) ||
    value.period !== period ||
    !isNonNegativeInteger(value.totalVisitors) ||
    !isNonNegativeInteger(value.activeVisitors) ||
    !isNonNegativeInteger(value.newVisitors) ||
    !isNonNegativeInteger(value.returningVisitors) ||
    !Array.isArray(value.visitorsOverTime)
  ) {
    return false;
  }

  return value.visitorsOverTime.every(
    (entry) =>
      isRecord(entry) &&
      typeof entry.date === "string" &&
      isNonNegativeInteger(entry.visitors),
  );
}

function periodLabel(period: Period) {
  return period === "7d" ? "7 days" : period === "30d" ? "30 days" : "90 days";
}

function formatDate(value: string) {
  return new Date(value + "T00:00:00.000Z").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function errorMessage() {
  return "Visitor analytics are temporarily unavailable. Please try again shortly.";
}

export default function VisitorOverview() {
  const reduceMotion = useReducedMotion();
  const [period, setPeriod] = useState<Period>("30d");
  const [summary, setSummary] = useState<VisitorSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSummary() {
      setLoading(true);
      setErrorStatus(null);

      try {
        const response = await fetch("/api/analytics/summary?period=" + period, {
          cache: "no-store",
          signal: controller.signal,
        });
        const payload: unknown = await response.json().catch(() => null);

        if (!response.ok) {
          setSummary(null);
          if (response.status === 401 || response.status === 403) {
            setAccessDenied(true);
            return;
          }
          setAccessDenied(false);
          setErrorStatus(response.status);
          return;
        }

        if (!isVisitorSummary(payload, period)) {
          setSummary(null);
          setErrorStatus(null);
          return;
        }

        setAccessDenied(false);
        setSummary(payload);
      } catch {
        if (!controller.signal.aborted) {
          setSummary(null);
          setErrorStatus(null);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadSummary();
    return () => controller.abort();
  }, [period, retryKey]);

  const trend = summary?.visitorsOverTime ?? [];

  // Keep the private section out of the document while authorization is
  // pending; unauthorized users must never see a placeholder for it.
  if (accessDenied || (loading && !summary)) return null;

  return (
    <section
      aria-labelledby="visitor-overview-heading"
      className="min-w-0 rounded-[2rem] border border-[var(--databloom-border)] bg-[var(--databloom-card)] p-5 shadow-lg backdrop-blur-xl sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--databloom-accent-soft)] text-[var(--databloom-text-accent)]">
            <Users size={20} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2
              id="visitor-overview-heading"
              className="text-2xl font-black text-[var(--databloom-text-primary)]"
            >
              Visitor Overview
            </h2>
            <p className="mt-1 text-sm font-medium leading-6 text-[var(--databloom-text-secondary)]">
              Aggregate site-wide reach from recorded page views.
            </p>
          </div>
        </div>

        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Visitor overview period"
        >
          {PERIODS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={period === option}
              onClick={() => setPeriod(option)}
              className={"min-h-11 rounded-xl border px-4 py-2 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--databloom-focus)] " + (
                period === option
                  ? "border-transparent bg-[var(--databloom-action)] text-[var(--databloom-text-on-accent)] shadow-sm"
                  : "border-[var(--databloom-border)] bg-[var(--databloom-glass)] text-[var(--databloom-text-secondary)] hover:bg-[var(--databloom-accent-soft)]"
              )}
            >
              {periodLabel(option)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div
          className="mt-5 grid min-h-48 place-items-center rounded-3xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] p-6 text-center font-bold text-[var(--databloom-text-secondary)]"
          role="status"
          aria-live="polite"
        >
          Loading visitor overview…
        </div>
      ) : errorStatus !== null || !summary ? (
        <div
          className="mt-5 rounded-3xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] p-6 text-center"
          role="alert"
        >
          <p className="font-bold text-[var(--databloom-text-primary)]">
            {errorMessage()}
          </p>
          <button
            type="button"
            onClick={() => setRetryKey((value) => value + 1)}
            className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--databloom-action)] px-4 py-2 font-black text-[var(--databloom-text-on-accent)] shadow-sm transition hover:bg-[var(--databloom-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--databloom-focus)]"
          >
            <Activity size={17} aria-hidden="true" /> Try again
          </button>
        </div>
      ) : (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AnalyticsStatCard
              label="Total Visitors"
              value={summary.totalVisitors.toLocaleString()}
              detail="All retained page-view visitors"
              icon={<Users size={21} />}
              tone="purple"
            />
            <AnalyticsStatCard
              label="Active Visitors"
              value={summary.activeVisitors.toLocaleString()}
              detail={"Unique visitors in the last " + periodLabel(period)}
              icon={<Activity size={21} />}
              tone="blue"
            />
            <AnalyticsStatCard
              label="New Visitors"
              value={summary.newVisitors.toLocaleString()}
              detail={"First seen in the last " + periodLabel(period)}
              icon={<UserPlus size={21} />}
              tone="green"
            />
            <AnalyticsStatCard
              label="Returning Visitors"
              value={summary.returningVisitors.toLocaleString()}
              detail={"Seen before the selected " + periodLabel(period)}
              icon={<UserRoundCheck size={21} />}
              tone="pink"
            />
          </div>

          <div className="mt-6 min-w-0 rounded-3xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-[var(--databloom-text-primary)]">
                  Visitors over time
                </h3>
                <p className="mt-1 text-sm font-medium text-[var(--databloom-text-secondary)]">
                  Daily unique visitors over the selected {periodLabel(period).toLowerCase()}.
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-[var(--databloom-accent-soft)] px-3 py-1 text-xs font-black text-[var(--databloom-text-accent)]">
                {periodLabel(period)}
              </span>
            </div>

            {trend.length === 0 ? (
              <p className="mt-5 rounded-2xl border border-[var(--databloom-border)] p-6 text-center text-sm font-semibold text-[var(--databloom-text-secondary)]">
                No visitor activity was recorded during this period.
              </p>
            ) : (
              <>
                <p className="sr-only">
                  Daily visitor trend for {periodLabel(period)}.{" "}
                  {trend.reduce((total, day) => total + day.visitors, 0).toLocaleString()} total daily visitor observations.
                </p>
                <div
                  className="mt-4 h-72 w-full min-w-0 overflow-hidden"
                  role="img"
                  aria-label={"Daily unique visitors for the selected " + periodLabel(period).toLowerCase()}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={trend}
                      margin={{ top: 12, right: 4, bottom: 4, left: -18 }}
                      accessibilityLayer
                    >
                      <defs>
                        <linearGradient id="visitorOverviewGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--databloom-accent)" stopOpacity={0.42} />
                          <stop offset="95%" stopColor="var(--databloom-accent)" stopOpacity={0.04} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        stroke="var(--databloom-border)"
                        strokeDasharray="4 4"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "var(--databloom-text-secondary)",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                        tickFormatter={formatDate}
                        minTickGap={24}
                      />
                      <YAxis
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "var(--databloom-text-muted)", fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          border: "1px solid var(--databloom-border)",
                          borderRadius: "16px",
                          backgroundColor: "var(--databloom-card)",
                          color: "var(--databloom-text-surface)",
                          boxShadow:
                            "0 12px 30px color-mix(in srgb, var(--databloom-accent) 14%, transparent)",
                        }}
                        labelFormatter={(value) => formatDate(String(value))}
                        labelStyle={{ color: "var(--databloom-text-secondary)" }}
                        itemStyle={{ color: "var(--databloom-text-primary)" }}
                        cursor={{ fill: "var(--databloom-accent-soft)" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="visitors"
                        name="Visitors"
                        stroke="var(--databloom-accent)"
                        strokeWidth={3}
                        fill="url(#visitorOverviewGradient)"
                        isAnimationActive={!reduceMotion}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}
