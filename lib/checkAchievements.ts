import {
  saveUnlockedAchievements,
  loadUnlockedAchievements,
} from "@/lib/unlockedAchievements";


export function checkAchievements(
  xp:number,
  streak:number
){

  const unlocked =
    loadUnlockedAchievements();


  const newUnlocks = [
    ...unlocked,
  ];



  function unlock(id:string){

    if(!newUnlocks.includes(id)){
      newUnlocks.push(id);
    }

  }



  if(xp >= 500){
    unlock("xp_500");
  }



  if(xp >= 1000){
    unlock("xp_1000");
  }



  if(streak >= 7){
    unlock("streak_7");
  }



  if(streak >= 30){
    unlock("streak_30");
  }



  saveUnlockedAchievements(
    newUnlocks
  );


  return newUnlocks;

}