export type RewardDescriptor = {
  rewardId: string;
  source: string;
  optimisticXP: number;
};

export type RewardResult = {
  newlyAwarded: boolean;
  xp: number;
  level: number;
};
