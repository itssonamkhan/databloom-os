"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { getCurrentLevel } from "@/lib/levels";
import { loadXP, saveXP } from "@/lib/storage";
import { checkAchievements } from "@/lib/checkAchievements";


type ProgressContextType = {
  xp: number;
  addXP: (amount: number) => void;

  levelUp: boolean;
  currentLevelName: string;
  dismissLevelUp: () => void;
};


const ProgressContext =
  createContext<ProgressContextType | undefined>(
    undefined
  );



export function ProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {


  const [mounted,setMounted] =
    useState(false);


  const [xp,setXP] =
    useState(240);


  const [levelUp,setLevelUp] =
    useState(false);



  const [currentLevelName,setCurrentLevelName] =
    useState(
      getCurrentLevel(240).name
    );




  useEffect(()=>{

    const savedXP =
      loadXP();


    setXP(savedXP);


    setCurrentLevelName(
      getCurrentLevel(savedXP).name
    );


    setMounted(true);


  },[]);




  useEffect(()=>{

    if(!mounted) return;


    saveXP(xp);


  },[xp,mounted]);






  function addXP(amount:number){


    setXP((currentXP)=>{


      const newXP =
        currentXP + amount;



      const previousLevel =
        getCurrentLevel(currentXP);



      const newLevel =
        getCurrentLevel(newXP);



      if(
        previousLevel.name !== newLevel.name
      ){

        setCurrentLevelName(
          newLevel.name
        );


        setLevelUp(true);

      }




      // Automatic achievement check
      checkAchievements(
        newXP,
        0
      );



      return newXP;


    });


  }




  function dismissLevelUp(){

    setLevelUp(false);

  }




  if(!mounted){

    return null;

  }





  return (

    <ProgressContext.Provider

      value={{
        xp,
        addXP,
        levelUp,
        currentLevelName,
        dismissLevelUp,
      }}

    >

      {children}

    </ProgressContext.Provider>

  );

}





export function useProgress(){

  const context =
    useContext(ProgressContext);



  if(!context){

    throw new Error(
      "useProgress must be used inside ProgressProvider"
    );

  }


  return context;

}