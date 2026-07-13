const FAVORITE_KEY = "databloom-favorite-formulas";
const LEARNED_KEY = "databloom-learned-formulas";


export function loadFavorites(): string[] {

  if(typeof window === "undefined"){
    return [];
  }

  const saved =
    localStorage.getItem(FAVORITE_KEY);

  return saved
    ? JSON.parse(saved)
    : [];

}



export function toggleFavorite(id:string){

  const favorites =
    loadFavorites();


  const updated =
    favorites.includes(id)

    ?

    favorites.filter(
      item => item !== id
    )

    :

    [...favorites,id];


  localStorage.setItem(
    FAVORITE_KEY,
    JSON.stringify(updated)
  );


  return updated;

}





export function loadLearned(): string[] {

  if(typeof window === "undefined"){
    return [];
  }


  const saved =
    localStorage.getItem(LEARNED_KEY);


  return saved
    ? JSON.parse(saved)
    : [];

}





export function markLearned(id:string){

  const learned =
    loadLearned();


  if(!learned.includes(id)){

    learned.push(id);

  }


  localStorage.setItem(
    LEARNED_KEY,
    JSON.stringify(learned)
  );


  return learned;

}