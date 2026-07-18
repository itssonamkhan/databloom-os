"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import LevelUpCelebration, {
  type LevelUpCelebrationDetails,
} from "@/components/effects/LevelUpCelebration";
import { getCurrentLevel, levels } from "@/lib/levels";
import {
  loadLastCelebratedLevel,
  loadXP,
  saveLastCelebratedLevel,
  saveXP,
} from "@/lib/storage";
import { checkAchievements } from "@/lib/checkAchievements";
import { loadStreak } from "@/lib/streak";
import {
  ACHIEVEMENT_REWARD_EVENT,
  type AchievementRewardEventDetail,
} from "@/lib/unlockedAchievements";


type ProgressContextType = {
  xp: number;
  addXP: (amount: number) => void;

  levelUp: boolean;
  currentLevelName: string;
  dismissLevelUp: () => void;
};

function getLevelIndex(levelName: string) {
  return levels.findIndex((level) => level.name === levelName);
}

function loadLastCelebratedLevelIndex() {
  const savedLevelName = loadLastCelebratedLevel();
  return savedLevelName ? getLevelIndex(savedLevelName) : -1;
}


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


  const [levelCelebration, setLevelCelebration] =
    useState<LevelUpCelebrationDetails | null>(null);



  const [currentLevelName,setCurrentLevelName] =
    useState(
      getCurrentLevel(240).name
    );




  useEffect(()=>{

    const savedXP =
      loadXP();


    setXP(savedXP);


    const savedLevel = getCurrentLevel(savedXP);

    setCurrentLevelName(savedLevel.name);

    const savedLevelIndex = getLevelIndex(savedLevel.name);
    if (savedLevelIndex > loadLastCelebratedLevelIndex()) {
      saveLastCelebratedLevel(savedLevel.name);
    }


    setMounted(true);


  },[]);




  useEffect(()=>{

    if(!mounted) return;


    saveXP(xp);


  },[xp,mounted]);






  const addXP = useCallback((amount:number) => {


    setXP((currentXP)=>{


      const newXP =
        currentXP + amount;



      const previousLevel =
        getCurrentLevel(currentXP);



      const newLevel =
        getCurrentLevel(newXP);



      if (previousLevel.name !== newLevel.name) {

        setCurrentLevelName(
          newLevel.name
        );


        const previousLevelIndex = getLevelIndex(previousLevel.name);
        const newLevelIndex = getLevelIndex(newLevel.name);

        if (
          newLevelIndex > previousLevelIndex &&
          newLevelIndex > loadLastCelebratedLevelIndex()
        ) {
          saveLastCelebratedLevel(newLevel.name);
          setLevelCelebration({ previousLevel, newLevel, currentXP: newXP });
        }

      }




      // Automatic achievement check
      checkAchievements(
        newXP,
        loadStreak().current
      );



      return newXP;


    });
  }, []);

  useEffect(() => {
    function handleAchievementReward(event: Event) {
      const detail = (event as CustomEvent<AchievementRewardEventDetail>).detail;
      if (!detail || !Number.isFinite(detail.xp) || detail.xp <= 0) return;

      window.queueMicrotask(() => addXP(detail.xp));
    }

    window.addEventListener(ACHIEVEMENT_REWARD_EVENT, handleAchievementReward);
    const reconcileTimer = window.setTimeout(() => {
      void import("@/lib/achievementReconciliation").then(
        ({ reconcileCoreAchievements }) => reconcileCoreAchievements(),
      );
    }, 0);
    return () => {
      window.clearTimeout(reconcileTimer);
      window.removeEventListener(
        ACHIEVEMENT_REWARD_EVENT,
        handleAchievementReward,
      );
    };
  }, [addXP]);




  const dismissLevelUp = useCallback(() => {
    setLevelCelebration(null);
  }, []);




  if(!mounted){

    return null;

  }





  return (

    <ProgressContext.Provider

      value={{
        xp,
        addXP,
        levelUp: levelCelebration !== null,
        currentLevelName,
        dismissLevelUp,
      }}

    >

      {children}

      <LevelUpCelebration
        celebration={levelCelebration}
        onClose={dismissLevelUp}
      />

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
