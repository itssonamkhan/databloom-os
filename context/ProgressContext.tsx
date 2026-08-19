"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import LevelUpCelebration, {
  type LevelUpCelebrationDetails,
} from "@/components/effects/LevelUpCelebration";
import { getCurrentLevel, levels } from "@/lib/levels";
import {
  clearXP,
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
import { createClient } from "@/lib/supabase/client";


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

const LAST_CELEBRATED_LEVEL_STORAGE_KEY = "databloom-last-celebrated-level";

function clearLocalProgress() {
  if (typeof window === "undefined") return;

  try {
    clearXP();
    window.localStorage.removeItem(LAST_CELEBRATED_LEVEL_STORAGE_KEY);
  } catch {
    // Progress state still resets if browser storage is unavailable.
  }
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

  const [authUserId, setAuthUserId] =
    useState<string | null>(null);
  const authUserIdRef = useRef<string | null>(null);
  const skipNextLocalSaveRef = useRef(false);


  const [xp,setXP] =
    useState(240);


  const [levelCelebration, setLevelCelebration] =
    useState<LevelUpCelebrationDetails | null>(null);



  const [currentLevelName,setCurrentLevelName] =
    useState(
      getCurrentLevel(240).name
    );




  useEffect(() => {
    let active = true;
    const supabase = createClient();

    function applyLocalProgress() {
      const savedXP = loadXP();
      setXP(savedXP);
      setCurrentLevelName(getCurrentLevel(savedXP).name);
    }

    async function syncProfileProgress(userId: string) {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("xp, level")
        .eq("id", userId)
        .maybeSingle();

      if (!active || authUserIdRef.current !== userId) return;

      if (error || !profile) {
        setXP(0);
        setCurrentLevelName(getCurrentLevel(0).name);
        saveXP(0);
        return;
      }

      const profileXP =
        typeof profile.xp === "number" && Number.isFinite(profile.xp)
          ? Math.max(0, profile.xp)
          : 0;
      const profileLevel =
        typeof profile.level === "number" && Number.isFinite(profile.level)
          ? Math.max(1, Math.floor(profile.level))
          : 1;

      setXP(profileXP);
      setCurrentLevelName(
        levels[profileLevel - 1]?.name ?? getCurrentLevel(profileXP).name,
      );
      saveXP(profileXP);
    }

    applyLocalProgress();
    setMounted(true);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const previousUserId = authUserIdRef.current;
      const userId = session?.user.id ?? null;
      authUserIdRef.current = userId;
      setAuthUserId(userId);

      if (userId) {
        // Never expose a previous guest/account value while the profile loads.
        setXP(0);
        setCurrentLevelName(getCurrentLevel(0).name);
        // Defer the profile query so it does not run inside Supabase's auth callback.
        window.setTimeout(() => {
          void syncProfileProgress(userId);
        }, 0);
      } else if (previousUserId) {
        clearLocalProgress();
        skipNextLocalSaveRef.current = true;
        setXP(0);
        setCurrentLevelName(getCurrentLevel(0).name);
        setLevelCelebration(null);
      } else {
        applyLocalProgress();
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);




  useEffect(()=>{

    if(!mounted) return;

    if (skipNextLocalSaveRef.current) {
      skipNextLocalSaveRef.current = false;
      return;
    }

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

      const newLevelIndex = getLevelIndex(newLevel.name);

      if (authUserId) {
        void createClient()
          .from("profiles")
          .update({
            xp: newXP,
            level: newLevelIndex + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", authUserId);
      }



      if (previousLevel.name !== newLevel.name) {

        setCurrentLevelName(
          newLevel.name
        );


        const previousLevelIndex = getLevelIndex(previousLevel.name);

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
  }, [authUserId]);

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
