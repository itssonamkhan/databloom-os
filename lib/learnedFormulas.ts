const STORAGE_KEY = "databloom-learned-formulas";

export const FORMULA_PROGRESS_EVENT = "databloom:formula-progress-updated";


export function getLearnedFormulas(): string[] {

  if (typeof window === "undefined") {
    return [];
  }

  const saved =
    localStorage.getItem(STORAGE_KEY);

  return saved
    ? JSON.parse(saved)
    : [];

}



export function markFormulaLearned(
  id:string
){

  const current =
    getLearnedFormulas();


  if(!current.includes(id)){

    const updated = [
      ...current,
      id
    ];


    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );

    window.dispatchEvent(new CustomEvent(FORMULA_PROGRESS_EVENT, { detail: { id } }));


    return updated;

  }


  return current;

}
