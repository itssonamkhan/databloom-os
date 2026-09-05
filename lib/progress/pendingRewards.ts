"use client";

import type { RewardDescriptor } from "@/lib/progress/rewardTypes";

const PREFIX = "databloom-pending-rewards-v1:";

function key(userId: string) {
  return `${PREFIX}${userId.toLowerCase()}`;
}

function read(userId: string): RewardDescriptor[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key(userId)) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is RewardDescriptor => Boolean(item) && typeof item === "object" && typeof (item as RewardDescriptor).rewardId === "string" && typeof (item as RewardDescriptor).source === "string" && typeof (item as RewardDescriptor).optimisticXP === "number");
  } catch {
    return [];
  }
}

function write(userId: string, rewards: RewardDescriptor[]) {
  try {
    window.localStorage.setItem(key(userId), JSON.stringify(rewards.slice(-500)));
  } catch {
    // Offline progress remains in memory if storage is unavailable.
  }
}

export function loadPendingRewards(userId: string) {
  return read(userId);
}

export function enqueuePendingReward(userId: string, reward: RewardDescriptor) {
  const rewards = read(userId);
  if (!rewards.some((item) => item.rewardId === reward.rewardId)) write(userId, [...rewards, reward]);
}

export function removePendingReward(userId: string, rewardId: string) {
  write(userId, read(userId).filter((item) => item.rewardId !== rewardId));
}

/** Removes only one deleted account's retry queue. */
export function clearPendingRewards(userId: string) {
  try {
    window.localStorage.removeItem(key(userId));
  } catch {
    // Account deletion can still complete if browser storage is unavailable.
  }
}
