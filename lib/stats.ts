export type DailyStats = {
  lessons: number;
  minutes: number;
  xpEarned: number;
  goalsCompleted: number;
};


const STATS_KEY = "databloom-study-stats-v2";


function getTodayKey() {

  return new Date()
    .toISOString()
    .split("T")[0];

}



function defaultStats(): DailyStats {

  return {
    lessons: 0,
    minutes: 0,
    xpEarned: 0,
    goalsCompleted: 0,
  };

}




export function loadTodayStats(): DailyStats {


  if(typeof window === "undefined"){

    return defaultStats();

  }



  const saved =
    localStorage.getItem(STATS_KEY);



  if(!saved){

    return defaultStats();

  }



  try {


    const data =
      JSON.parse(saved);



    const today =
      getTodayKey();



    return (
      data[today]
      ||
      defaultStats()
    );


  }

  catch {

    return defaultStats();

  }


}





export function saveTodayStats(
  stats: DailyStats
){


  if(typeof window==="undefined")
    return;



  const saved =
    localStorage.getItem(STATS_KEY);



  let data: Record<string, DailyStats> = {};



  if(saved){

    try{

      data = JSON.parse(saved);

    }

    catch{

      data = {};

    }

  }



  data[getTodayKey()] = stats;



  localStorage.setItem(
    STATS_KEY,
    JSON.stringify(data)
  );


}





export function incrementStats(
  lessons:number,
  minutes:number,
  xp:number,
  goals:number
){


  const current =
    loadTodayStats();



  current.lessons += lessons;

  current.minutes += minutes;

  current.xpEarned += xp;

  current.goalsCompleted += goals;



  saveTodayStats(current);



  return current;

}
