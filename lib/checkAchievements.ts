import { unlockAchievement } from "@/lib/unlockedAchievements";


export function checkAchievements(
  xp:number,
  streak:number
){

  if(xp >= 500){
    unlockAchievement("xp_500");
  }



  if(xp >= 1000){
    unlockAchievement("xp_1000");
  }



  if(streak >= 7){
    unlockAchievement("streak_7");
  }



  if(streak >= 30){
    unlockAchievement("streak_30");
  }



  return true;

}
