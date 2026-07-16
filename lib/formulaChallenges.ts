export const formulaChallenges = [

  {
    title: "✨ Master SUM Formula",
    description: "Practice adding values using SUM()",
    reward: 30,
  },


  {
    title: "🔍 Learn VLOOKUP",
    description: "Find information from tables",
    reward: 40,
  },


  {
    title: "📊 Try COUNTIF",
    description: "Count data based on conditions",
    reward: 30,
  },


  {
    title: "🌸 Explore IF Formula",
    description: "Create logical decisions in Excel",
    reward: 40,
  },


  {
    title: "🧮 Practice XLOOKUP",
    description: "Use modern lookup techniques",
    reward: 50,
  },


  {
    title: "📈 Build a Formula Combo",
    description: "Combine multiple Excel functions",
    reward: 60,
  },

];

export const FORMULA_CHALLENGE_STORAGE_KEY =
  "databloom-formula-challenge-completions-v1";

function todayKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadCompletedChallengeDates() {
  if (typeof window === "undefined") return [];
  try {
    const saved = window.localStorage.getItem(FORMULA_CHALLENGE_STORAGE_KEY);
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function isTodayFormulaChallengeCompleted() {
  return loadCompletedChallengeDates().includes(todayKey());
}

export function completeTodayFormulaChallenge() {
  if (typeof window === "undefined") return false;
  const dates = loadCompletedChallengeDates();
  const today = todayKey();
  if (dates.includes(today)) return false;
  try {
    window.localStorage.setItem(
      FORMULA_CHALLENGE_STORAGE_KEY,
      JSON.stringify([...dates, today].slice(-90)),
    );
    return true;
  } catch {
    return false;
  }
}



export function getTodayFormulaChallenge(){

  const today = new Date().getDate();


  return formulaChallenges[
    today % formulaChallenges.length
  ];

}
