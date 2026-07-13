export const progressData = {
  xp: 240,
  level: "🌸 Sakura Level 1",
  nextLevelXP: 500,
  streak: 7,
};


export function getLevel(xp:number){

  if(xp >= 1500){
    return "🏰 Data Analyst";
  }

  if(xp >= 1000){
    return "📊 Dashboard Queen";
  }

  if(xp >= 700){
    return "✨ Formula Wizard";
  }

  if(xp >= 500){
    return "🧚 Excel Fairy";
  }

  return "🌸 Sakura Level 1";

}