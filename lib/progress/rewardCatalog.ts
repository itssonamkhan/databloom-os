import { formulas } from "@/lib/formulas";
import { sqlLessons } from "@/lib/sqlLessons";
import { pythonLessons } from "@/lib/pythonLessons";
import { statisticsLessons } from "@/lib/statisticsLessons";
import { powerBILessons } from "@/lib/powerBILessons";
import { daxLessons } from "@/lib/daxFormulas";
import { powerQueryLessons } from "@/lib/powerQueryLessons";
import { tableauLessons } from "@/lib/tableauLessons";
import { businessAnalyticsLessons } from "@/lib/businessAnalyticsLessons";
import { practiceQuestions } from "@/lib/practiceLabQuestions";
import { datasetLibrary } from "@/lib/datasetLibrary";
import { dashboardProjects } from "@/lib/dashboardProjects";
import { practiceProjects } from "@/lib/dashboardPractice";
import { portfolioProjects } from "@/lib/portfolioProjects";
import { interviewQuestions } from "@/lib/interviewQuestions";
import { achievements } from "@/lib/achievements";
import { formulaChallenges } from "@/lib/formulaChallenges";
import { studioAssessmentConfigurations } from "@/lib/studioAssessments";
import { dailyTasks } from "@/lib/dailyTasks";
import { allCareerCompletionIds, companies } from "@/lib/careerHubData";
import type { RewardDescriptor } from "@/lib/progress/rewardTypes";

export type ResolvedReward = { rewardId: string; source: string; xp: number; dailyCap: number };
type RewardItem = { id: string; xpReward: number };
const id = /^[a-z0-9][a-z0-9_-]*(?::[a-z0-9][a-z0-9_-]*)+$/;
const find = (items: readonly { id: string; xpReward: number }[], itemId: string) => items.find((item) => item.id === itemId);
function isCurrentActivityDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const target = Date.UTC(year, month - 1, day);
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Number.isFinite(target) && Math.abs(target - today) <= 86_400_000;
}
const lessonSets = new Map<string, readonly RewardItem[]>([
  ["sql", sqlLessons], ["python", pythonLessons], ["statistics", statisticsLessons],
  ["power-query", powerQueryLessons], ["tableau", tableauLessons], ["business-analytics", businessAnalyticsLessons],
]);

export function resolveReward(reward: RewardDescriptor): ResolvedReward | null {
  if (!reward || !id.test(reward.rewardId) || reward.rewardId.length > 200 || !reward.source || reward.source.length > 120) return null;
  const parts = reward.rewardId.split(":");
  const [prefix, kind, itemId] = parts;
  if (prefix === "formula" && kind === "lesson" && formulas.some((item) => item.id === itemId)) return { rewardId: reward.rewardId, source: "formula-lesson", xp: 20, dailyCap: 1000 };
  const lessons = lessonSets.get(prefix);
  if (lessons && (kind === "lesson" || kind === "practice") && itemId) {
    const lesson = find(lessons, itemId);
    if (lesson) return { rewardId: reward.rewardId, source: `${prefix}-${kind}`, xp: kind === "practice" ? Math.max(10, Math.floor(lesson.xpReward / 2)) : lesson.xpReward, dailyCap: 1000 };
  }
  if (prefix === "power-bi" && (kind === "lesson" || kind === "dax" || kind === "practice") && itemId) {
    const lesson = find([...powerBILessons, ...daxLessons], itemId);
    if (lesson) return { rewardId: reward.rewardId, source: `power-bi-${kind}`, xp: kind === "practice" ? Math.max(10, Math.floor(lesson.xpReward / 2)) : lesson.xpReward, dailyCap: 1000 };
  }
  if (prefix === "practice-lab" && kind === "question" && itemId) { const question = find(practiceQuestions, itemId); if (question) return { rewardId: reward.rewardId, source: "practice-lab", xp: question.xpReward, dailyCap: 1000 }; }
  if (prefix === "dataset" && kind === "item" && itemId) { const item = find(datasetLibrary, itemId); if (item) return { rewardId: reward.rewardId, source: "dataset", xp: item.xpReward, dailyCap: 1000 }; }
  if (prefix === "dashboard" && kind === "project" && itemId) { const item = find(dashboardProjects, itemId); if (item) return { rewardId: reward.rewardId, source: "dashboard", xp: item.xpReward, dailyCap: 1000 }; }
  if (prefix === "dashboard-practice" && parts[1] && parts[2]) { const project = practiceProjects.find((item) => item.id === parts[1]); const task = project?.tasks.find((item) => item.id === parts[2]); if (task) return { rewardId: reward.rewardId, source: "dashboard-practice", xp: task.xpReward, dailyCap: 1000 }; }
  if (prefix === "portfolio" && kind === "project" && itemId) { const item = find(portfolioProjects, itemId); if (item) return { rewardId: reward.rewardId, source: "portfolio", xp: item.xpReward, dailyCap: 1000 }; }
  if (prefix === "interview-question" && parts[1]) { const item = find(interviewQuestions, parts.slice(1).join(":")); if (item) return { rewardId: reward.rewardId, source: "interview-question", xp: item.xpReward, dailyCap: 1000 }; }
  if (prefix === "achievement" && kind) { const item = achievements.find((entry) => entry.id === kind); if (item) return { rewardId: reward.rewardId, source: "achievement", xp: item.reward, dailyCap: 1000 }; }
  if (prefix === "checkpoint" && parts[1] && parts[2]) { const config = studioAssessmentConfigurations.find((entry) => entry.studioId === parts[1]); if (config?.checkpoints.some((entry) => entry.id === parts.slice(2).join(":"))) return { rewardId: reward.rewardId, source: "checkpoint", xp: 50, dailyCap: 1000 }; }
  if (prefix === "final-exam" && parts[1] && parts[2]) { const config = studioAssessmentConfigurations.find((entry) => entry.studioId === parts[1]); if (config?.finalExam.id === parts.slice(2).join(":")) return { rewardId: reward.rewardId, source: "final-exam", xp: 150, dailyCap: 1000 }; }
  if (prefix === "formula-challenge" && kind === "date" && /^\d{4}-\d{2}-\d{2}$/.test(itemId ?? "") && isCurrentActivityDate(itemId!)) { const day = Number(itemId!.slice(-2)); return { rewardId: reward.rewardId, source: "formula-challenge", xp: formulaChallenges[day % formulaChallenges.length].reward, dailyCap: 1 }; }
  if (prefix === "planner" && kind === "milestone" && ["first-task-completed", "five-tasks-completed", "ten-tasks-completed"].includes(itemId ?? "")) { const xp = itemId === "first-task-completed" ? 25 : itemId === "five-tasks-completed" ? 50 : 75; return { rewardId: reward.rewardId, source: "planner", xp, dailyCap: 3 }; }
  if (prefix === "smart-notes" && kind === "milestone" && itemId === "first-note-completed") return { rewardId: reward.rewardId, source: "smart-notes", xp: 20, dailyCap: 3 };
  if (prefix === "smart-notes" && kind === "milestone" && itemId === "first-note-created") return { rewardId: reward.rewardId, source: "smart-notes", xp: 15, dailyCap: 3 };
  if (prefix === "smart-notes" && kind === "milestone" && itemId === "first-collection-created") return { rewardId: reward.rewardId, source: "smart-notes", xp: 15, dailyCap: 3 };
  if (prefix === "flashcard" && kind === "card" && itemId) return { rewardId: reward.rewardId, source: "flashcard", xp: 5, dailyCap: 50 };
  if (prefix === "career" && kind === "completion" && parts.slice(2).join(":") && allCareerCompletionIds.includes(parts.slice(2).join(":") as (typeof allCareerCompletionIds)[number])) return { rewardId: reward.rewardId, source: "career", xp: 10, dailyCap: 1000 };
  if (prefix === "career" && kind === "completion" && parts[2] === "company" && parts[3] && /^\d+$/.test(parts[4] ?? "") && companies.some((company) => company.slug === parts[3]) && Number(parts[4]) >= 1 && Number(parts[4]) <= 6) return { rewardId: reward.rewardId, source: "career", xp: 10, dailyCap: 1000 };
  if (prefix === "career" && kind === "certification" && itemId) {
    const certificationReward = parts[2];
    if (["added", "completed", "added-completed", "roadmap"].includes(certificationReward ?? "") && parts.length >= 4) {
      const xp = certificationReward === "added" ? 20 : certificationReward === "completed" ? 50 : certificationReward === "added-completed" ? 70 : 40;
      return { rewardId: reward.rewardId, source: "career-certification", xp, dailyCap: 3 };
    }
  }
  if (prefix === "daily-goal" && parts[1] && parts[2]) {
    const goal = dailyTasks.find((task) => task.text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === parts.slice(2).join("-"));
    if (goal && /^\d{4}-\d{2}-\d{2}$/.test(parts[1]) && isCurrentActivityDate(parts[1])) return { rewardId: reward.rewardId, source: "daily-goal", xp: goal.xp, dailyCap: 4 };
  }
  if (prefix === "mochi-mission" && parts[1] && parts[2] && /^\d{4}-\d{2}-\d{2}$/.test(parts[1]) && isCurrentActivityDate(parts[1]) && ["sql-lesson", "formula-review", "python-lesson", "statistics-practice", "power-bi-lesson", "dashboard-practice", "analytics-checkin"].includes(parts.slice(2).join(":"))) return { rewardId: reward.rewardId, source: "mochi-mission", xp: 20, dailyCap: 1 };
  return null;
}
