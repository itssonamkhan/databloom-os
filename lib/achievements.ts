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
  {
    id: "practice_starter",
    title: "🧪 Practice Seedling",
    description: "Complete your first Practice Lab session.",
    reward: 25,
  },
  {
    id: "practice_perfect",
    title: "🎯 Perfect Practice",
    description: "Complete a Practice Lab session with 100% first-try accuracy.",
    reward: 50,
  },
  {
    id: "practice_explorer",
    title: "🌈 Skill Explorer",
    description: "Solve Practice Lab challenges across four skill categories.",
    reward: 75,
  },
  {
    id: "interview_starter",
    title: "🎤 Interview Starter",
    description: "Learn your first Interview Hub question.",
    reward: 25,
  },
  {
    id: "mock_interviewer",
    title: "⏱️ Mock Interviewer",
    description: "Complete your first mock interview.",
    reward: 50,
  },
  {
    id: "interview_ready",
    title: "💬 Interview Ready",
    description: "Learn 50 Interview Hub questions.",
    reward: 100,
  },
  {
    id: "portfolio_ready",
    title: "📄 Application Ready",
    description: "Complete every resume and portfolio review check.",
    reward: 75,
  },
];

export function getAchievement(id: string) {
  return achievements.find((item) => item.id === id);
}
