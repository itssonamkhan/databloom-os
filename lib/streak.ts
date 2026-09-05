import { unlockAchievement } from "@/lib/unlockedAchievements";


const STREAK_KEY = "databloom-streak";

export const STREAK_UPDATED_EVENT = "databloom:streak-updated";


export type StreakData = {
  current: number;
  longest: number;
  lastStudyDate: string | null;
};

const EMPTY_STREAK: StreakData = {
  current: 0,
  longest: 0,
  lastStudyDate: null,
};

function isDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function normalizeStreak(value: unknown): StreakData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...EMPTY_STREAK };
  }

  const candidate = value as Partial<StreakData>;
  const current = candidate.current;
  const longest = candidate.longest;
  const lastStudyDate = candidate.lastStudyDate;

  if (
    typeof current !== "number" ||
    !Number.isFinite(current) ||
    current < 0 ||
    !Number.isInteger(current) ||
    typeof longest !== "number" ||
    !Number.isFinite(longest) ||
    longest < 0 ||
    !Number.isInteger(longest) ||
    longest < current ||
    (lastStudyDate !== null && !isDateKey(lastStudyDate))
  ) {
    return { ...EMPTY_STREAK };
  }

  return { current, longest, lastStudyDate };
}



function today() {
  const date = new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}



function yesterday() {

  const date = new Date();

  date.setDate(
    date.getDate() - 1
  );

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

}




export function loadStreak(): StreakData {

  if(typeof window === "undefined"){

    return { ...EMPTY_STREAK };

  }



  let saved: string | null;
  try {
    saved = localStorage.getItem(STREAK_KEY);
  } catch {
    return { ...EMPTY_STREAK };
  }



  if(!saved){

    return { ...EMPTY_STREAK };

  }



  try{

    return normalizeStreak(JSON.parse(saved));

  }

  catch{

    return { ...EMPTY_STREAK };

  }

}





export function saveStreak(
  data:StreakData
){

  if(typeof window==="undefined")
    return;



  const safeData = normalizeStreak(data);

  localStorage.setItem(
    STREAK_KEY,
    JSON.stringify(safeData)
  );

  window.dispatchEvent(
    new CustomEvent(STREAK_UPDATED_EVENT, { detail: safeData })
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
