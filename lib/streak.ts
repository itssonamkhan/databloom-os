import { unlockAchievement } from "@/lib/unlockedAchievements";


const STREAK_KEY = "databloom-streak";

export const STREAK_UPDATED_EVENT = "databloom:streak-updated";


export type StreakData = {
  current: number;
  longest: number;
  lastStudyDate: string | null;
};



function today() {
  return new Date()
    .toISOString()
    .split("T")[0];
}



function yesterday() {

  const date = new Date();

  date.setDate(
    date.getDate() - 1
  );

  return date
    .toISOString()
    .split("T")[0];

}




export function loadStreak(): StreakData {

  if(typeof window === "undefined"){

    return {
      current:0,
      longest:0,
      lastStudyDate:null,
    };

  }



  const saved =
    localStorage.getItem(STREAK_KEY);



  if(!saved){

    return {
      current:0,
      longest:0,
      lastStudyDate:null,
    };

  }



  try{

    return JSON.parse(saved);

  }

  catch{

    return {
      current:0,
      longest:0,
      lastStudyDate:null,
    };

  }

}





export function saveStreak(
  data:StreakData
){

  if(typeof window==="undefined")
    return;



  localStorage.setItem(
    STREAK_KEY,
    JSON.stringify(data)
  );

  window.dispatchEvent(
    new CustomEvent(STREAK_UPDATED_EVENT, { detail: data })
  );

}





function checkStreakAchievements(
  streak:number
){
  if(
    streak >= 7
  ){
    unlockAchievement("streak_7");

  }



  if(
    streak >= 30
  ){
    unlockAchievement("streak_30");

  }

}





export function registerStudyDay(){

  const streak =
    loadStreak();



  const todayDate =
    today();



  if(
    streak.lastStudyDate === todayDate
  ){

    return streak;

  }




  if(
    streak.lastStudyDate === yesterday()
  ){

    streak.current += 1;

  }

  else{

    streak.current = 1;

  }



  streak.lastStudyDate =
    todayDate;



  if(
    streak.current > streak.longest
  ){

    streak.longest =
      streak.current;

  }




  saveStreak(streak);



  // automatic achievement check
  checkStreakAchievements(
    streak.current
  );



  return streak;

}
