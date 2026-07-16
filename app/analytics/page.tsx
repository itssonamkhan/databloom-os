"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Award,
  BarChart3,
  BookCheck,
  CalendarCheck2,
  CalendarDays,
  Download,
  Flame,
  Gauge,
  LayoutDashboard,
  NotebookPen,
  RefreshCw,
  Sparkles,
  Target,
  TimerReset,
  Trophy,
  Zap,
} from "lucide-react";

import AnalyticsStatCard from "@/components/analytics/AnalyticsStatCard";
import EmptyAnalyticsState from "@/components/analytics/EmptyAnalyticsState";
import InsightCard from "@/components/analytics/InsightCard";
import LearningDistributionChart from "@/components/analytics/LearningDistributionChart";
import SkillProgressCard from "@/components/analytics/SkillProgressCard";
import StudyActivityChart from "@/components/analytics/StudyActivityChart";
import WeeklyActivityChart from "@/components/analytics/WeeklyActivityChart";
import XPProgressCard from "@/components/analytics/XPProgressCard";
import AppLayout from "@/components/layout/AppLayout";
import {
  downloadAnalyticsSummary,
  loadAnalyticsSnapshot,
  refreshAnalyticsSnapshot,
} from "@/lib/analytics";
import {
  ANALYTICS_HISTORY_STORAGE_KEY,
  ANALYTICS_UPDATED_EVENT,
} from "@/lib/analyticsHistory";
import { playClickSound } from "@/lib/sounds";

function dateFromKey(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatDateRange(dates: string[]) {
  if (dates.length === 0) return "Last 7 days";

  const first = dateFromKey(dates[0]);
  const last = dateFromKey(dates[dates.length - 1]);
  const firstLabel = first.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const lastLabel = last.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return `${firstLabel} – ${lastLabel}`;
}

export default function AnalyticsPage() {
  const [snapshot, setSnapshot] = useState(loadAnalyticsSnapshot);
  const [statusMessage, setStatusMessage] = useState("");

  const syncOnly = useCallback(() => {
    setSnapshot(loadAnalyticsSnapshot());
  }, []);

  useEffect(() => {
    window.addEventListener(ANALYTICS_UPDATED_EVENT, syncOnly);

    function handleStorage(event: StorageEvent) {
      if (event.key === null || event.key === ANALYTICS_HISTORY_STORAGE_KEY) {
        syncOnly();
      }
    }

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(ANALYTICS_UPDATED_EVENT, syncOnly);
      window.removeEventListener("storage", handleStorage);
    };
  }, [syncOnly]);

  function handleRefresh() {
    playClickSound();
    setSnapshot(refreshAnalyticsSnapshot());
    setStatusMessage(
      `Analytics refreshed at ${new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}.`,
    );
  }

  function handleExport() {
    playClickSound();
    const latestSnapshot = refreshAnalyticsSnapshot();
    setSnapshot(latestSnapshot);
    const downloaded = downloadAnalyticsSummary(latestSnapshot);
    setStatusMessage(
      downloaded
        ? "Analytics summary exported as JSON."
        : "The analytics summary could not be exported in this browser.",
    );
  }

  const dateRange = formatDateRange(
    snapshot.weeklyActivity.map((activity) => activity.date),
  );
  const productivity = snapshot.productivity;
  const dailyGoalLabel =
    productivity.totalDailyGoals > 0
      ? `${productivity.completedDailyGoals} / ${productivity.totalDailyGoals}`
      : "0 / 0";

  return (
    <AppLayout>
      <div className="min-w-0 space-y-8 overflow-x-hidden">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-gradient-to-br from-purple-100 via-pink-100 to-sky-100 p-6 shadow-lg sm:p-8 lg:p-10">
          <div
            className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-white/50 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-sm font-bold text-purple-800 shadow-sm">
                <Sparkles size={16} aria-hidden="true" /> Your learning garden
              </p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-purple-800 sm:text-5xl">
                📈 Analytics Studio
              </h1>
              <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-slate-700 sm:text-lg">
                {snapshot.userName}, here is how your DataBloom journey is growing.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/80 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-700">
                <CalendarDays size={17} className="text-purple-700" aria-hidden="true" />
                {dateRange}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-purple-200 bg-white/85 px-5 py-3 text-sm font-bold text-purple-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700 motion-reduce:transform-none"
              >
                <RefreshCw size={18} aria-hidden="true" /> Refresh Analytics
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-purple-700 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-purple-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-800 motion-reduce:transform-none"
              >
                <Download size={18} aria-hidden="true" /> Export Summary
              </button>
            </div>
          </div>
          <p className="sr-only" aria-live="polite">
            {statusMessage}
          </p>
        </header>

        <section aria-labelledby="overview-heading">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-purple-100 text-purple-700">
              <Gauge size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 id="overview-heading" className="text-2xl font-black text-slate-950">
                Learning overview
              </h2>
              <p className="text-sm font-medium text-slate-600">
                Live totals from your saved DataBloom progress.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <AnalyticsStatCard
              label="Total XP"
              value={snapshot.xp.toLocaleString()}
              detail="Lifetime learning rewards"
              icon={<Zap size={21} />}
              tone="purple"
            />
            <AnalyticsStatCard
              label="Current level"
              value={snapshot.level.name}
              detail={snapshot.level.badge}
              icon={<Trophy size={21} />}
              tone="pink"
              delay={0.03}
            />
            <AnalyticsStatCard
              label="XP to next level"
              value={snapshot.isMaxLevel ? "Max" : snapshot.xpRemaining.toLocaleString()}
              detail={
                snapshot.nextLevel
                  ? `Next: ${snapshot.nextLevel.name}`
                  : "Maximum level reached"
              }
              icon={<Gauge size={21} />}
              tone="blue"
              delay={0.06}
            />
            <AnalyticsStatCard
              label="Current streak"
              value={`${snapshot.streak.current} days`}
              detail={
                snapshot.streak.lastStudyDate
                  ? `Last study: ${snapshot.streak.lastStudyDate}`
                  : "No study day recorded yet"
              }
              icon={<Flame size={21} />}
              tone="orange"
              delay={0.09}
            />
            <AnalyticsStatCard
              label="Longest streak"
              value={`${snapshot.streak.longest} days`}
              detail="Your personal best"
              icon={<Trophy size={21} />}
              tone="amber"
              delay={0.12}
            />
            <AnalyticsStatCard
              label="Completed lessons"
              value={snapshot.totals.completedLessons}
              detail="Across eight learning paths"
              icon={<BookCheck size={21} />}
              tone="green"
              delay={0.15}
            />
            <AnalyticsStatCard
              label="Practice tasks"
              value={snapshot.totals.completedPractice}
              detail="Completed once across Practice Lab"
              icon={<Target size={21} />}
              tone="blue"
              delay={0.18}
            />
            <AnalyticsStatCard
              label="Practice accuracy"
              value={`${snapshot.totals.practiceAccuracy}%`}
              detail={`${snapshot.totals.practiceSessions} saved session${
                snapshot.totals.practiceSessions === 1 ? "" : "s"
              }`}
              icon={<Target size={21} />}
              tone="green"
              delay={0.2}
            />
            <AnalyticsStatCard
              label="Interview readiness"
              value={`${snapshot.totals.interviewAverageScore}%`}
              detail={`${snapshot.totals.interviewQuestions} learned · ${snapshot.totals.interviewMockSessions} mocks`}
              icon={<Target size={21} />}
              tone="purple"
              delay={0.205}
            />
            <AnalyticsStatCard
              label="Career readiness"
              value={`${snapshot.totals.careerReadiness}%`}
              detail={`${snapshot.totals.careerTasks} tasks · ${snapshot.totals.careerApplications} applications`}
              icon={<Target size={21} />}
              tone="green"
              delay={0.208}
            />
            <AnalyticsStatCard
              label="Smart Notes"
              value={snapshot.totals.notesCreated}
              detail={`${snapshot.totals.notesCompleted} completed · ${snapshot.totals.noteFavorites} favorites`}
              icon={<NotebookPen size={21} />}
              tone="purple"
              delay={0.209}
            />
            <AnalyticsStatCard
              label="Notes writing time"
              value={`${snapshot.totals.notesWritingMinutes} min`}
              detail={`${snapshot.totals.noteCollections} study collections`}
              icon={<TimerReset size={21} />}
              tone="blue"
              delay={0.21}
            />
            <AnalyticsStatCard
              label="Dashboard projects"
              value={snapshot.totals.dashboardProjects}
              detail="Completed portfolio projects"
              icon={<LayoutDashboard size={21} />}
              tone="purple"
              delay={0.21}
            />
            <AnalyticsStatCard
              label="Focus sessions"
              value={snapshot.totals.focusSessions}
              detail="Completed study timers"
              icon={<TimerReset size={21} />}
              tone="green"
              delay={0.24}
            />
            <AnalyticsStatCard
              label="Achievements"
              value={`${snapshot.achievements.unlockedCount} / ${
                snapshot.achievements.unlockedCount + snapshot.achievements.lockedCount
              }`}
              detail={`${snapshot.achievements.completionPercentage}% unlocked`}
              icon={<Award size={21} />}
              tone="pink"
              delay={0.27}
            />
          </div>

          <Link
            href="/practice-lab"
            onClick={playClickSound}
            className="mt-5 inline-flex min-h-12 items-center justify-center rounded-2xl border border-fuchsia-200 bg-fuchsia-50 px-5 font-black text-fuchsia-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-fuchsia-100 hover:shadow-md"
          >
            🧩 Open Practice Lab
          </Link>
          <Link
            href="/smart-notes"
            onClick={playClickSound}
            className="ml-3 mt-5 inline-flex min-h-12 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50 px-5 font-black text-violet-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-100 hover:shadow-md"
          >
            📝 Open Smart Notes
          </Link>
        </section>

        <section aria-labelledby="skills-heading">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
              <BarChart3 size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 id="skills-heading" className="text-2xl font-black text-slate-950">
                Skill progress
              </h2>
              <p className="text-sm font-medium text-slate-600">
                Completion is calculated from each studio’s existing lesson library.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {snapshot.studioProgress.map((studio, index) => (
              <SkillProgressCard
                key={studio.id}
                studio={studio}
                delay={index * 0.04}
              />
            ))}
          </div>
        </section>

        <div className="grid min-w-0 gap-6 xl:grid-cols-2">
          <XPProgressCard
            xp={snapshot.xp}
            currentLevelName={snapshot.level.name}
            currentLevelMinXP={snapshot.level.minXP}
            currentBadge={snapshot.level.badge}
            nextLevelName={snapshot.nextLevel?.name}
            nextLevelMinXP={snapshot.nextLevel?.minXP ?? null}
          />
          <InsightCard
            title={snapshot.insight.title}
            insight={snapshot.insight.message}
            detail={snapshot.insight.detail}
            actionLabel={snapshot.insight.actionLabel}
            actionHref={snapshot.insight.actionHref}
          />
        </div>

        <section aria-labelledby="activity-heading">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-sky-100 text-sky-700">
              <BarChart3 size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 id="activity-heading" className="text-2xl font-black text-slate-950">
                Weekly analytics
              </h2>
              <p className="text-sm font-medium text-slate-600">
                Honest seven-day history from recorded activity and safe future snapshots.
              </p>
            </div>
          </div>
          <div className="grid min-w-0 gap-6 xl:grid-cols-2">
            <WeeklyActivityChart data={snapshot.weeklyActivity} />
            <LearningDistributionChart data={snapshot.studioProgress} />
          </div>
          <div className="mt-6 min-w-0">
            <StudyActivityChart data={snapshot.weeklyActivity} />
          </div>
        </section>

        <section
          aria-labelledby="achievements-heading"
          className="rounded-[2rem] border border-amber-100 bg-white/85 p-5 shadow-lg backdrop-blur-xl sm:p-7"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-700">
                <Award size={22} aria-hidden="true" />
              </div>
              <div>
                <h2 id="achievements-heading" className="text-2xl font-black text-slate-950">
                  Achievement analytics
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {snapshot.achievements.unlockedCount} unlocked, {snapshot.achievements.lockedCount} still waiting to bloom.
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-amber-50 px-5 py-3 text-center">
              <p className="text-3xl font-black text-amber-800">
                {snapshot.achievements.completionPercentage}%
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Badge collection
              </p>
            </div>
          </div>

          <div
            className="mt-5 h-3 overflow-hidden rounded-full bg-amber-100"
            role="progressbar"
            aria-label="Achievement completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={snapshot.achievements.completionPercentage}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-pink-500 transition-[width] duration-700 motion-reduce:transition-none"
              style={{ width: `${snapshot.achievements.completionPercentage}%` }}
            />
          </div>

          {snapshot.achievements.unlocked.length === 0 ? (
            <EmptyAnalyticsState
              className="mt-6 min-h-48"
              title="Your first badge is waiting"
              description="Complete learning milestones to add unlocked achievements here."
            />
          ) : (
            <div className="mt-6">
              <h3 className="font-bold text-slate-900">Currently unlocked badges</h3>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {snapshot.achievements.unlocked.map((achievement) => (
                  <li
                    key={achievement.id}
                    className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-pink-50 p-4"
                  >
                    <p className="font-bold text-slate-900">{achievement.title}</p>
                    <p className="mt-1 text-sm leading-5 text-slate-600">
                      {achievement.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section aria-labelledby="productivity-heading">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-pink-100 text-pink-700">
              <CalendarCheck2 size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 id="productivity-heading" className="text-2xl font-black text-slate-950">
                Productivity insights
              </h2>
              <p className="text-sm font-medium text-slate-600">
                Today’s real saved goals, study time, and next step.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <AnalyticsStatCard
              label="Daily goals"
              value={dailyGoalLabel}
              detail={
                productivity.totalDailyGoals > 0
                  ? "Completed today"
                  : "Open Home to create today’s goals"
              }
              icon={<Target size={21} />}
              tone="pink"
            />
            <AnalyticsStatCard
              label="Focus sessions"
              value={productivity.focusSessions}
              detail="Cumulative completed timers"
              icon={<TimerReset size={21} />}
              tone="green"
            />
            <AnalyticsStatCard
              label="Planner progress"
              value={
                productivity.plannerProgress === null
                  ? "Not tracked"
                  : `${productivity.plannerProgress}%`
              }
              detail="Planner has no saved completion data yet"
              icon={<CalendarDays size={21} />}
              tone="purple"
            />
            <AnalyticsStatCard
              label="Today’s lessons"
              value={productivity.todayLessons}
              detail="Recorded lesson completions"
              icon={<BookCheck size={21} />}
              tone="blue"
            />
            <AnalyticsStatCard
              label="Today’s minutes"
              value={productivity.todayMinutes}
              detail={`Daily target: ${productivity.dailyGoalMinutes} minutes`}
              icon={<TimerReset size={21} />}
              tone="amber"
            />
          </div>

          <Link
            href={productivity.suggestedNextHref}
            onClick={playClickSound}
            className="mt-5 flex min-h-20 w-full flex-col justify-center rounded-3xl border border-purple-100 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 px-5 py-4 text-left shadow-md transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700 motion-reduce:transform-none sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <span>
              <span className="block text-xs font-bold uppercase tracking-[0.14em] text-purple-700">
                Suggested next action
              </span>
              <span className="mt-1 block text-lg font-black text-slate-950">
                {productivity.suggestedNextAction}
              </span>
            </span>
            <span className="mt-2 font-bold text-purple-800 sm:mt-0">Continue →</span>
          </Link>
        </section>

        <footer className="rounded-2xl border border-white/80 bg-white/65 px-4 py-3 text-center text-xs font-medium text-slate-600">
          Last read from this browser at{" "}
          {new Date(snapshot.generatedAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          . Analytics never changes XP or lesson completion.
        </footer>
      </div>
    </AppLayout>
  );
}
