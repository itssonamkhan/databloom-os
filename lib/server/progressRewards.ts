import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveReward } from "@/lib/progress/rewardCatalog";
import type { RewardDescriptor, RewardResult } from "@/lib/progress/rewardTypes";

export const MAX_REWARD_BODY_BYTES = 8 * 1024;

export function parseRewardPayload(value: unknown): RewardDescriptor | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (Object.keys(record).some((key) => !["rewardId", "source"].includes(key))) return null;
  if (typeof record.rewardId !== "string" || typeof record.source !== "string") return null;
  const reward: RewardDescriptor = { rewardId: record.rewardId, source: record.source, optimisticXP: 0 };
  return resolveReward(reward) ? reward : null;
}

export async function awardReward(
  supabase: SupabaseClient,
  userId: string,
  reward: RewardDescriptor,
): Promise<RewardResult> {
  const resolved = resolveReward(reward);
  if (!resolved) throw new Error("Invalid reward.");
  const { data, error } = await supabase.rpc("award_learner_xp", {
    p_user_id: userId,
    p_reward_id: resolved.rewardId,
    p_source: resolved.source,
    p_xp: resolved.xp,
    p_daily_cap: resolved.dailyCap,
  });
  if (error || !data) throw new Error("Reward service unavailable.");
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") throw new Error("Reward service unavailable.");
  const result = row as Record<string, unknown>;
  if (typeof result.newly_awarded !== "boolean" || typeof result.canonical_xp !== "number" || typeof result.canonical_level !== "number") {
    throw new Error("Reward service unavailable.");
  }
  return { newlyAwarded: result.newly_awarded, xp: result.canonical_xp, level: result.canonical_level };
}
