const STORAGE_KEY = "databloom-favorite-formulas";

export function getFavorites(): string[] {

  if (typeof window === "undefined") {
    return [];
  }

  const saved =
    localStorage.getItem(STORAGE_KEY);

  return saved
    ? JSON.parse(saved)
    : [];

}


export function toggleFavorite(id:string){

  const favorites = getFavorites();

  const updated = favorites.includes(id)

    ? favorites.filter(
        (item)=> item !== id
      )

    : [
        ...favorites,
        id
      ];


  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updated)
  );


  window.dispatchEvent(
    new Event("favoritesUpdated")
  );


  return updated;

}