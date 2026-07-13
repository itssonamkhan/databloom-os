export type Achievement = {
  id: string;
  title: string;
  description: string;
  reward: number;
};

export const achievements: Achievement[] = [
  {
    id: "first_formula",
    title: "📚 First Formula Learned",
    description: "Learn your first Excel formula.",
    reward: 30,
  },

  {
    id: "focus_master",
    title: "🎯 Focus Master",
    description: "Complete all daily goals.",
    reward: 20,
  },

  {
    id: "mochi_friend",
    title: "🐰 Mochi Friendship Lv.1",
    description: "Chat with Mochi for the first time.",
    reward: 20,
  },

  {
    id: "xp_500",
    title: "🌸 Blooming Learner",
    description: "Reach 500 XP.",
    reward: 50,
  },

  {
    id: "xp_1000",
    title: "✨ Formula Wizard",
    description: "Reach 1000 XP.",
    reward: 100,
  },

  {
    id: "streak_7",
    title: "🔥 7 Day Streak",
    description: "Study for 7 consecutive days.",
    reward: 50,
  },

  {
    id: "streak_30",
    title: "🏆 30 Day Streak",
    description: "Study for 30 consecutive days.",
    reward: 150,
  },

  {
    id: "dashboard_builder",
    title: "📊 Dashboard Builder",
    description: "Create your first dashboard.",
    reward: 40,
  },

  {
    id: "challenge_master",
    title: "⚡ Challenge Master",
    description: "Complete your first Formula Challenge.",
    reward: 40,
  },
  {
    id: "statistics_starter",
    title: "📐 Statistics Seedling",
    description: "Complete your first Statistics Studio lesson.",
    reward: 25,
  },
  {
    id: "statistics_practitioner",
    title: "📊 Statistics Practitioner",
    description: "Complete 10 Statistics Studio lessons.",
    reward: 75,
  },
];

export function getAchievement(id: string) {
  return achievements.find((item) => item.id === id);
}
