"use client";

import { loadStreak, STREAK_UPDATED_EVENT } from "@/lib/streak";
import {
  getLocalStudyDateKey,
  loadTodayStats,
  STUDY_STATS_UPDATED_EVENT,
} from "@/lib/stats";
import { loadPracticeLabState, PRACTICE_LAB_EVENT } from "@/lib/practiceLab";
import { loadSQLProgress, SQL_PROGRESS_EVENT } from "@/lib/sqlProgress";
import { loadPythonProgress, PYTHON_PROGRESS_EVENT } from "@/lib/pythonProgress";
import { loadStatisticsProgress, STATISTICS_PROGRESS_EVENT } from "@/lib/statisticsProgress";
import { loadPowerBIProgress, POWER_BI_PROGRESS_EVENT } from "@/lib/powerBIProgress";
import { loadPowerQueryProgress, POWER_QUERY_PROGRESS_EVENT } from "@/lib/powerQueryProgress";
import { loadTableauProgress, TABLEAU_PROGRESS_EVENT } from "@/lib/tableauProgress";
import { loadBusinessAnalyticsProgress, BUSINESS_ANALYTICS_PROGRESS_EVENT } from "@/lib/businessAnalyticsProgress";
import { loadDatasetLibraryProgress, DATASET_LIBRARY_PROGRESS_EVENT } from "@/lib/datasetLibraryProgress";
import { loadExcelProToolkitProgress, EXCEL_PRO_TOOLKIT_EVENT } from "@/lib/excelProToolkitProgress";
import { loadUnlockedAchievements, loadRewardedAchievements, ACHIEVEMENTS_UPDATED_EVENT } from "@/lib/unlockedAchievements";
import { loadInterviewHubState, INTERVIEW_HUB_EVENT } from "@/lib/interviewHub";
import { loadPortfolioProjectProgress, PORTFOLIO_PROJECT_EVENT } from "@/lib/portfolioProjectProgress";

export const CORE_PROGRESS_EVENTS = [
  STREAK_UPDATED_EVENT, STUDY_STATS_UPDATED_EVENT, PRACTICE_LAB_EVENT,
  SQL_PROGRESS_EVENT, PYTHON_PROGRESS_EVENT, STATISTICS_PROGRESS_EVENT,
  POWER_BI_PROGRESS_EVENT, POWER_QUERY_PROGRESS_EVENT, TABLEAU_PROGRESS_EVENT,
  BUSINESS_ANALYTICS_PROGRESS_EVENT, DATASET_LIBRARY_PROGRESS_EVENT,
  EXCEL_PRO_TOOLKIT_EVENT, ACHIEVEMENTS_UPDATED_EVENT, INTERVIEW_HUB_EVENT,
  PORTFOLIO_PROJECT_EVENT, "databloom:dashboard-storage-updated", "databloom:dashboard-practice",
  "databloom:checkpoint-progress-updated", "databloom:formula-progress-updated",
] as const;

export type CoreProgressItem = {
  itemType: "lesson" | "practice" | "checkpoint" | "final_exam" | "dataset" | "dashboard" | "portfolio" | "interview_question" | "achievement" | "rewarded_item";
  itemId: string;
  completedAt: string;
  metadata: Record<string, unknown>;
};

export type CoreDailyStat = {
  studyDate: string;
  lessons: number;
  minutes: number;
  xpEarned: number;
  goalsCompleted: number;
};

export type CoreProgressSnapshot = {
  schemaVersion: 1;
  streak: { current: number; longest: number; lastStudyDate: string | null };
  items: CoreProgressItem[];
  dailyStats: CoreDailyStat[];
  revision?: number;
};

const EPOCH = "1970-01-01T00:00:00.000Z";
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const MAX_ITEMS = 1000;

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? Array.from(new Set(value.filter((item): item is string => typeof item === "string" && item.length > 0 && item.length <= 160))).slice(0, 500) : [];
}

function safeMeta(value: unknown): Record<string, unknown> {
  const input = record(value);
  const output: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(input)) {
    if (!/^[a-zA-Z][a-zA-Z0-9_]{0,40}$/.test(key) || /note|answer|message|resume|email|password|token|secret|ip|useragent|phone|address|reflection/i.test(key)) continue;
    if (typeof item === "string" && item.length <= 160) output[key] = item;
    else if (typeof item === "number" && Number.isFinite(item) && item >= 0) output[key] = item;
    else if (typeof item === "boolean") output[key] = item;
  }
  return output;
}

function add(items: CoreProgressItem[], itemType: CoreProgressItem["itemType"], itemId: string, metadata: Record<string, unknown> = {}) {
  if (items.length >= MAX_ITEMS || !/^[a-z0-9][a-z0-9_-]*(?::[a-z0-9][a-z0-9_-]*)+$/.test(itemId)) return;
  if (items.some((item) => item.itemType === itemType && item.itemId === itemId)) return;
  items.push({ itemType, itemId, completedAt: EPOCH, metadata: safeMeta(metadata) });
}

function addArrays(items: CoreProgressItem[], type: CoreProgressItem["itemType"], prefix: string, completed: unknown, practice: unknown) {
  for (const id of strings(completed)) add(items, type, `${prefix}:lesson:${id}`);
  for (const id of strings(practice)) add(items, "practice", `${prefix}:practice:${id}`);
}

function readUnknown(key: string): unknown {
  try { const raw = window.localStorage.getItem(key); return raw ? JSON.parse(raw) : undefined; } catch { return undefined; }
}

function readJson(key: string): Record<string, unknown> { return record(readUnknown(key)); }

export function extractCoreProgressSnapshot(): CoreProgressSnapshot {
  if (typeof window === "undefined") return { schemaVersion: 1, streak: { current: 0, longest: 0, lastStudyDate: null }, items: [], dailyStats: [] };
  const items: CoreProgressItem[] = [];
  for (const id of strings(readUnknown("databloom-learned-formulas"))) add(items, "lesson", `formula:lesson:${id}`);
  const sql = loadSQLProgress(); addArrays(items, "lesson", "sql", sql.completedLessonIds, sql.completedPracticeIds);
  const python = loadPythonProgress(); addArrays(items, "lesson", "python", python.completedLessonIds, python.completedPracticeIds);
  const statistics = loadStatisticsProgress(); addArrays(items, "lesson", "statistics", statistics.completedLessonIds, statistics.completedPracticeIds);
  const powerQuery = loadPowerQueryProgress(); addArrays(items, "lesson", "power-query", powerQuery.completedLessonIds, powerQuery.completedPracticeIds);
  const tableau = loadTableauProgress(); addArrays(items, "lesson", "tableau", tableau.completedLessonIds, tableau.completedPracticeIds);
  const business = loadBusinessAnalyticsProgress(); addArrays(items, "lesson", "business-analytics", business.completedLessonIds, business.completedPracticeIds);
  const dataset = loadDatasetLibraryProgress(); for (const id of strings(dataset.completedLessonIds)) add(items, "dataset", `dataset:item:${id}`);
  const powerBI = loadPowerBIProgress();
  for (const id of strings(powerBI.completedLessonIds)) add(items, "lesson", `power-bi:lesson:${id}`);
  for (const id of strings(powerBI.completedDAXIds)) add(items, "lesson", `power-bi:dax:${id}`);
  for (const id of strings(powerBI.completedPracticeIds)) add(items, "practice", `power-bi:practice:${id}`);
  const toolkit = loadExcelProToolkitProgress(); for (const id of strings(toolkit.learnedIds)) add(items, "lesson", `excel:toolkit:${id}`);
  const practice = loadPracticeLabState();
  for (const id of strings(practice.completedQuestionIds)) add(items, "practice", `practice-lab:question:${id}`);
  for (const id of strings(practice.rewardedQuestionIds)) add(items, "rewarded_item", `practice-lab:question:${id}`);
  const checkpoint = readJson("databloom-checkpoint-progress-v1");
  for (const [key, value] of Object.entries(record(checkpoint.completions))) {
    const [studioId, checkpointId] = key.split(":");
    const completion = record(value);
    if (studioId && checkpointId) add(items, "checkpoint", `checkpoint:${studioId}:${checkpointId}`, { bestScore: bounded(completion.bestScore), latestPassedScore: bounded(completion.latestPassedScore), completedAt: typeof completion.completedAt === "string" ? completion.completedAt : EPOCH, xpAwarded: completion.xpAwarded === true });
  }
  for (const [studioId, value] of Object.entries(record(checkpoint.masteryResults))) {
    const mastery = record(value);
    add(items, "final_exam", `final-exam:${studioId}:result`, { finalExamId: typeof mastery.finalExamId === "string" ? mastery.finalExamId : "", officialMasteryScore: bounded(mastery.officialMasteryScore), completedAt: typeof mastery.completedAt === "string" ? mastery.completedAt : EPOCH, updatedAt: typeof mastery.updatedAt === "string" ? mastery.updatedAt : EPOCH, studioCompleted: mastery.studioCompleted === true, xpAwarded: mastery.xpAwarded === true });
  }
  const dashboards = readUnknown("dashboard_progress");
  for (const id of strings(dashboards)) add(items, "dashboard", `dashboard:project:${id}`);
  const dashboardPractice = readJson("databloom-dashboard-practice-v1");
  for (const id of strings(dashboardPractice.completedTaskIds)) add(items, "practice", `dashboard:practice:${id}`);
  for (const id of strings(dashboardPractice.rewardedTaskIds)) add(items, "rewarded_item", `dashboard:practice:${id}`);
  const portfolio = loadPortfolioProjectProgress();
  for (const id of strings(portfolio.completedProjectIds)) add(items, "portfolio", `portfolio:project:${id}`);
  for (const id of strings(portfolio.rewardedProjectIds)) add(items, "rewarded_item", `portfolio:project:${id}`);
  const interview = loadInterviewHubState();
  for (const id of strings(interview.learnedQuestionIds)) add(items, "interview_question", `interview:question:${id}`);
  for (const id of strings(interview.rewardedQuestionIds)) add(items, "rewarded_item", `interview:question:${id}`);
  for (const id of strings(loadUnlockedAchievements())) add(items, "achievement", `achievement:${id}`);
  for (const id of strings(loadRewardedAchievements())) add(items, "rewarded_item", `achievement:${id}`);
  for (const id of strings(readUnknown("databloom-formula-challenge-completions-v1"))) add(items, "rewarded_item", `formula-challenge:date:${id}`);
  const daily = readJson("databloom-study-stats-v2");
  const dailyStats = Object.entries(daily).filter(([date, value]) => DATE_KEY.test(date) && record(value)).slice(-366).map(([studyDate, value]) => ({
    studyDate, lessons: bounded(record(value).lessons), minutes: bounded(record(value).minutes), xpEarned: bounded(record(value).xpEarned), goalsCompleted: bounded(record(value).goalsCompleted),
  }));
  const today = loadTodayStats();
  const todayDate = getLocalStudyDateKey();
  if (!dailyStats.some((item) => item.studyDate === todayDate)) dailyStats.push({ studyDate: todayDate, lessons: bounded(today.lessons), minutes: bounded(today.minutes), xpEarned: bounded(today.xpEarned), goalsCompleted: bounded(today.goalsCompleted) });
  return { schemaVersion: 1, streak: sanitizeStreak(loadStreak()), items, dailyStats: dailyStats.slice(0, 366) };
}

function bounded(value: unknown) { return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.min(Math.floor(value), 1_000_000) : 0; }
function sanitizeStreak(value: ReturnType<typeof loadStreak>) { return { current: bounded(value.current), longest: Math.max(bounded(value.longest), bounded(value.current)), lastStudyDate: typeof value.lastStudyDate === "string" && DATE_KEY.test(value.lastStudyDate) ? value.lastStudyDate : null }; }

function writeJson(key: string, value: unknown) { try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* keep local state on storage failure */ } }
function mergeStrings(existing: unknown, incoming: string[] = []) { return Array.from(new Set([...strings(existing), ...incoming])).slice(0, 500); }

/** Applies only allowlisted cloud fields; notes, answers, histories and other personal fields remain local. */
export function applyCoreProgressSnapshot(snapshot: { items?: CoreProgressItem[]; dailyStats?: CoreDailyStat[]; streak?: CoreProgressSnapshot["streak"] }) {
  if (typeof window === "undefined") return;
  const items = Array.isArray(snapshot.items) ? snapshot.items : [];
  const rewarded = new Map<string, string[]>();
  const completed = new Map<string, string[]>();
  const checkpointItems: CoreProgressItem[] = [];
  const addReward = (key: string, id: string) => rewarded.set(key, mergeStrings(rewarded.get(key), [id]));
  const addCompleted = (key: string, id: string) => completed.set(key, mergeStrings(completed.get(key), [id]));
  const byPrefix = new Map<string, { lessons: string[]; practices: string[]; dax: string[]; rewarded: string[] }>();
  const addPrefix = (prefix: string, kind: "lessons" | "practices" | "dax" | "rewarded", id: string) => { const current = byPrefix.get(prefix) ?? { lessons: [], practices: [], dax: [], rewarded: [] }; current[kind].push(id); byPrefix.set(prefix, current); };
  for (const item of items) {
    const parts = item.itemId.split(":");
    if (item.itemType === "checkpoint" || item.itemType === "final_exam") checkpointItems.push(item);
    if (item.itemType === "rewarded_item") {
      if (parts[0] === "portfolio" && parts[1] === "project") addReward("portfolio", parts.slice(2).join(":"));
      else if (parts[0] === "interview" && parts[1] === "question") addReward("interview", parts.slice(2).join(":"));
      else if (parts[0] === "achievement") addReward("achievement", parts.slice(1).join(":"));
      else if (parts[0] === "formula-challenge" && parts[1] === "date") addReward("formula-challenge", parts.slice(2).join(":"));
    } else if (parts[0] === "dashboard" && parts[1] === "project" && item.itemType === "dashboard") addCompleted("dashboard", parts.slice(2).join(":"));
    else if (parts[0] === "portfolio" && parts[1] === "project" && item.itemType === "portfolio") addCompleted("portfolio", parts.slice(2).join(":"));
    else if (parts[0] === "interview" && parts[1] === "question" && item.itemType === "interview_question") addCompleted("interview", parts.slice(2).join(":"));
    else if (parts[0] === "achievement" && item.itemType === "achievement") addCompleted("achievement", parts.slice(1).join(":"));
    const kind = item.itemType === "rewarded_item" ? "rewarded" : undefined;
    if (parts[0] === "practice-lab" && parts[1] === "question") addPrefix("practice-lab", kind ?? "practices", parts.slice(2).join(":"));
    else if (parts[0] === "formula" && parts[1] === "lesson" && item.itemType === "lesson") addCompleted("formula", parts.slice(2).join(":"));
    else if (["sql", "python", "statistics", "power-query", "tableau", "business-analytics"].includes(parts[0]) && parts[1]) { if (item.itemType !== "rewarded_item") addPrefix(parts[0], parts[1] === "practice" ? "practices" : "lessons", parts.slice(2).join(":")); }
    else if (parts[0] === "power-bi" && parts[1]) { if (item.itemType !== "rewarded_item") addPrefix("power-bi", parts[1] === "practice" ? "practices" : parts[1] === "dax" ? "dax" : "lessons", parts.slice(2).join(":")); }
    else if (parts[0] === "dataset" && parts[1] === "item") { const state = readJson("databloom-dataset-library-progress-v1"); writeJson("databloom-dataset-library-progress-v1", { ...state, completedLessonIds: mergeStrings(state.completedLessonIds, [parts.slice(2).join(":")]) }); }
    else if (parts[0] === "excel" && parts[1] === "toolkit") { const state = readJson("databloom-excel-pro-toolkit-v1"); writeJson("databloom-excel-pro-toolkit-v1", { ...state, version: 1, learnedIds: mergeStrings(state.learnedIds, [parts.slice(2).join(":")]) }); }
  }
  for (const [prefix, values] of byPrefix) {
    const key = ({ sql: "databloom-sql-progress-v1", python: "databloom-python-progress-v1", statistics: "databloom-statistics-progress-v1", "power-query": "databloom-power-query-progress-v1", tableau: "databloom-tableau-progress-v1", "business-analytics": "databloom-business-analytics-progress-v1" } as Record<string, string>)[prefix];
    if (key) { const state = readJson(key); writeJson(key, { ...state, completedLessonIds: mergeStrings(state.completedLessonIds, values.lessons), completedPracticeIds: mergeStrings(state.completedPracticeIds, values.practices) }); }
    if (prefix === "power-bi") { const state = readJson("databloom-power-bi-progress-v1"); writeJson("databloom-power-bi-progress-v1", { ...state, completedLessonIds: mergeStrings(state.completedLessonIds, values.lessons), completedDAXIds: mergeStrings(state.completedDAXIds, values.dax), completedPracticeIds: mergeStrings(state.completedPracticeIds, values.practices) }); }
    if (prefix === "practice-lab") { const state = readJson("databloom-practice-lab-v1"); writeJson("databloom-practice-lab-v1", { ...state, completedQuestionIds: mergeStrings(state.completedQuestionIds, values.practices), rewardedQuestionIds: mergeStrings(state.rewardedQuestionIds, values.rewarded) }); }
  }
  if (rewarded.has("portfolio")) { const state = readJson("databloom-portfolio-project-progress-v1"); writeJson("databloom-portfolio-project-progress-v1", { ...state, rewardedProjectIds: mergeStrings(state.rewardedProjectIds, rewarded.get("portfolio")) }); }
  if (rewarded.has("interview")) { const state = readJson("databloom-interview-hub-v1"); writeJson("databloom-interview-hub-v1", { ...state, rewardedQuestionIds: mergeStrings(state.rewardedQuestionIds, rewarded.get("interview")) }); }
  if (rewarded.has("achievement")) { try { window.localStorage.setItem("databloom-rewarded-achievements", JSON.stringify(mergeStrings(readUnknown("databloom-rewarded-achievements"), rewarded.get("achievement") ?? []))); } catch { /* keep local state on storage failure */ } }
  if (rewarded.has("formula-challenge")) { try { window.localStorage.setItem("databloom-formula-challenge-completions-v1", JSON.stringify(mergeStrings(readUnknown("databloom-formula-challenge-completions-v1"), rewarded.get("formula-challenge") ?? []))); } catch { /* keep local state on storage failure */ } }
  if (completed.has("dashboard")) { writeJson("dashboard_progress", mergeStrings(readUnknown("dashboard_progress"), completed.get("dashboard"))); }
  if (completed.has("formula")) { try { window.localStorage.setItem("databloom-learned-formulas", JSON.stringify(mergeStrings(readUnknown("databloom-learned-formulas"), completed.get("formula") ?? []))); } catch { /* keep local state on storage failure */ } }
  if (completed.has("portfolio")) { const state = readJson("databloom-portfolio-project-progress-v1"); writeJson("databloom-portfolio-project-progress-v1", { ...state, completedProjectIds: mergeStrings(state.completedProjectIds, completed.get("portfolio")) }); }
  if (completed.has("interview")) { const state = readJson("databloom-interview-hub-v1"); writeJson("databloom-interview-hub-v1", { ...state, learnedQuestionIds: mergeStrings(state.learnedQuestionIds, completed.get("interview")) }); }
  if (completed.has("achievement")) { try { window.localStorage.setItem("databloom-unlocked-achievements", JSON.stringify(mergeStrings(readUnknown("databloom-unlocked-achievements"), completed.get("achievement") ?? []))); } catch { /* keep local state on storage failure */ } }
  if (checkpointItems.length > 0) {
    const state = readJson("databloom-checkpoint-progress-v1");
    const completions = record(state.completions);
    const masteryResults = record(state.masteryResults);
    for (const item of checkpointItems) {
      const parts = item.itemId.split(":");
      const meta = safeMeta(item.metadata);
      if (item.itemType === "checkpoint" && parts[1] && parts[2]) completions[`${parts[1]}:${parts.slice(2).join(":")}`] = { studioId: parts[1], checkpointId: parts.slice(2).join(":"), bestScore: bounded(meta.bestScore), latestPassedScore: bounded(meta.latestPassedScore), completedAt: typeof meta.completedAt === "string" ? meta.completedAt : EPOCH, xpAwarded: meta.xpAwarded === true };
      if (item.itemType === "final_exam" && parts[1]) masteryResults[parts[1]] = { ...(masteryResults[parts[1]] as Record<string, unknown> | undefined), studioId: parts[1], finalExamId: typeof meta.finalExamId === "string" ? meta.finalExamId : parts[2] ?? "", officialMasteryScore: bounded(meta.officialMasteryScore), completedAt: typeof meta.completedAt === "string" ? meta.completedAt : EPOCH, updatedAt: typeof meta.updatedAt === "string" ? meta.updatedAt : EPOCH, studioCompleted: meta.studioCompleted === true, xpAwarded: meta.xpAwarded === true };
    }
    writeJson("databloom-checkpoint-progress-v1", { ...state, completions, masteryResults });
  }
  const dailyByDate = new Map<string, CoreDailyStat>();
  for (const [date, value] of Object.entries(readJson("databloom-study-stats-v2"))) if (DATE_KEY.test(date)) { const item = record(value); dailyByDate.set(date, { studyDate: date, lessons: bounded(item.lessons), minutes: bounded(item.minutes), xpEarned: bounded(item.xpEarned), goalsCompleted: bounded(item.goalsCompleted) }); }
  for (const item of Array.isArray(snapshot.dailyStats) ? snapshot.dailyStats : []) { const previous = dailyByDate.get(item.studyDate); dailyByDate.set(item.studyDate, previous ? { studyDate: item.studyDate, lessons: Math.max(previous.lessons, item.lessons), minutes: Math.max(previous.minutes, item.minutes), xpEarned: Math.max(previous.xpEarned, item.xpEarned), goalsCompleted: Math.max(previous.goalsCompleted, item.goalsCompleted) } : item); }
  writeJson("databloom-study-stats-v2", Object.fromEntries(Array.from(dailyByDate, ([date, value]) => [date, { lessons: value.lessons, minutes: value.minutes, xpEarned: value.xpEarned, goalsCompleted: value.goalsCompleted }] ).slice(-366)));
  if (snapshot.streak) { const existing = sanitizeStreak(loadStreak()); const incoming = sanitizeStreak(snapshot.streak); const latest = (incoming.lastStudyDate ?? "") >= (existing.lastStudyDate ?? "") ? incoming : existing; writeJson("databloom-streak", { current: latest.current, longest: Math.max(existing.longest, incoming.longest), lastStudyDate: latest.lastStudyDate }); }
  for (const eventName of CORE_PROGRESS_EVENTS) window.dispatchEvent(new CustomEvent(eventName));
}
