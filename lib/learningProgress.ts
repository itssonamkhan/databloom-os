const STORAGE_KEY = "databloom-learning-progress";


export type LearningProgress = {
  excel: number;
  sql: number;
  powerbi: number;
  python: number;
};


const defaultProgress: LearningProgress = {
  excel: 0,
  sql: 0,
  powerbi: 0,
  python: 0,
};



export function getLearningProgress(): LearningProgress {

  if(typeof window === "undefined"){
    return defaultProgress;
  }


  const saved =
    localStorage.getItem(STORAGE_KEY);


  return saved
    ? JSON.parse(saved)
    : defaultProgress;

}



export function updateLearningProgress(
  skill:keyof LearningProgress,
  value:number
){

  const current =
    getLearningProgress();


  const updated = {

    ...current,

    [skill]: value

  };


  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updated)
  );


  return updated;

}