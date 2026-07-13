export const levels = [
  {
    name: "🌸 Sakura Seedling",
    minXP: 0,
    badge: "🌱 Tiny Bloom",
  },

  {
    name: "🌱 Little Data Sprout",
    minXP: 100,
    badge: "🍃 Growing Learner",
  },

  {
    name: "🐰 Study Bunny",
    minXP: 250,
    badge: "🥕 Curious Explorer",
  },

  {
    name: "🌷 Bloom Bud",
    minXP: 500,
    badge: "✨ First Bloom",
  },

  {
    name: "📚 Formula Friend",
    minXP: 850,
    badge: "🧠 Skill Collector",
  },

  {
    name: "☁️ Data Explorer",
    minXP: 1250,
    badge: "🗺️ Learning Adventurer",
  },

  {
    name: "🌼 Spreadsheet Wizard",
    minXP: 1700,
    badge: "📊 Excel Enchanter",
  },

  {
    name: "💎 Dashboard Creator",
    minXP: 2250,
    badge: "🎨 Visual Storyteller",
  },

  {
    name: "🚀 Data Analyst",
    minXP: 2900,
    badge: "🔎 Insight Finder",
  },

  {
    name: "👑 DataBloom Master",
    minXP: 3700,
    badge: "🏆 Garden Champion",
  },

  {
    name: "⭐ Garden Legend",
    minXP: 4600,
    badge: "🌸 Blooming Expert",
  },

  {
    name: "🌈 Insight Creator",
    minXP: 5600,
    badge: "💡 Story Builder",
  },

  {
    name: "🦋 Data Alchemist",
    minXP: 6700,
    badge: "✨ Pattern Magician",
  },

  {
    name: "🌙 Analytics Sage",
    minXP: 7900,
    badge: "🔮 Insight Sage",
  },

  {
    name: "👑 Bloom Queen",
    minXP: 9200,
    badge: "💖 Ultimate DataBloom",
  },
];

export function getCurrentLevel(xp: number) {
  let currentLevel = levels[0];

  for (const level of levels) {
    if (xp >= level.minXP) {
      currentLevel = level;
    }
  }

  return currentLevel;
}