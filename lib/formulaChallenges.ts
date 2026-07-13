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



export function getTodayFormulaChallenge(){

  const today = new Date().getDate();


  return formulaChallenges[
    today % formulaChallenges.length
  ];

}