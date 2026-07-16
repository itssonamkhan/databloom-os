import { areTodayDailyGoalsComplete } from "@/lib/dailyTasks";
import { getCompletedDashboards } from "@/lib/dashboardProgress";
import { isTodayFormulaChallengeCompleted } from "@/lib/formulaChallenges";
import { getLearnedFormulas } from "@/lib/learnedFormulas";
import { loadMochiData } from "@/lib/mochi";
import { unlockAchievement } from "@/lib/unlockedAchievements";

/** Repairs legacy progress by reconciling achievement definitions with their real stores. */
export function reconcileCoreAchievements() {
  if (getLearnedFormulas().length > 0) unlockAchievement("first_formula");
  if (areTodayDailyGoalsComplete()) unlockAchievement("focus_master");
  if (loadMochiData().interactions > 0) unlockAchievement("mochi_friend");
  if (getCompletedDashboards().length > 0) unlockAchievement("dashboard_builder");
  if (isTodayFormulaChallengeCompleted()) unlockAchievement("challenge_master");
}
