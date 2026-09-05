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
import { enqueuePendingReward, loadPendingRewards, removePendingReward } from "@/lib/progress/pendingRewards";
import type { RewardDescriptor, RewardResult } from "@/lib/progress/rewardTypes";


type ProgressContextType = {
  xp: number;
  addXP: (reward: RewardDescriptor) => void;

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

  const authUserIdRef = useRef<string | null>(null);
  const currentXPRef = useRef(0);
  const profileControllerRef = useRef<AbortController | null>(null);
  const rewardControllersRef = useRef(new Map<string, AbortController>());
  const skipNextLocalSaveRef = useRef(false);


  const [xp,setXP] =
    useState(0);


  const [levelCelebration, setLevelCelebration] =
    useState<LevelUpCelebrationDetails | null>(null);



  const [currentLevelName,setCurrentLevelName] =
    useState(
      getCurrentLevel(0).name
    );




  const submitReward = useCallback(async (userId: string, reward: RewardDescriptor): Promise<RewardResult | null> => {
    const requestKey = `${userId}:${reward.rewardId}`;
    if (rewardControllersRef.current.has(requestKey)) return null;
    const controller = new AbortController();
    rewardControllersRef.current.set(requestKey, controller);
    try {
      const response = await fetch("/api/progress/reward", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ rewardId: reward.rewardId, source: reward.source }),
      });
      if (response.status === 400) {
        removePendingReward(userId, reward.rewardId);
        return null;
      }
      if (!response.ok) return null;
      const result = await response.json() as Partial<RewardResult>;
      if (
        typeof result.newlyAwarded !== "boolean" ||
        typeof result.xp !== "number" ||
        !Number.isFinite(result.xp) ||
        result.xp < 0 ||
        typeof result.level !== "number" ||
        !Number.isFinite(result.level)
      ) return null;
      const canonical: RewardResult = {
        newlyAwarded: result.newlyAwarded,
        xp: Math.floor(result.xp),
        level: Math.max(1, Math.floor(result.level)),
      };
      if (authUserIdRef.current !== userId) return canonical;
      currentXPRef.current = canonical.xp;
      setXP(canonical.xp);
      setCurrentLevelName(levels[canonical.level - 1]?.name ?? getCurrentLevel(canonical.xp).name);
      removePendingReward(userId, reward.rewardId);
      return canonical;
    } catch {
      return null;
    } finally {
      if (rewardControllersRef.current.get(requestKey) === controller) rewardControllersRef.current.delete(requestKey);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    const rewardControllers = rewardControllersRef.current;

    function applyLocalProgress() {
      const savedXP = loadXP();
      currentXPRef.current = savedXP;
      setXP(savedXP);
      setCurrentLevelName(getCurrentLevel(savedXP).name);
    }

    async function syncProfileProgress(userId: string) {
      const controller = new AbortController();
      profileControllerRef.current = controller;
      try {
        const response = await fetch("/api/progress", {
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        });
        if (!response.ok) return;
        const payload = await response.json() as { xp?: unknown; level?: unknown };
        if (!active || authUserIdRef.current !== userId) return;
        if (typeof payload.xp !== "number" || !Number.isFinite(payload.xp) || payload.xp < 0 || typeof payload.level !== "number" || !Number.isFinite(payload.level)) return;
        const profileXP = Math.max(0, Math.floor(payload.xp));
        const profileLevel = Math.max(1, Math.floor(payload.level));
        currentXPRef.current = profileXP;
        setXP(profileXP);
        setCurrentLevelName(levels[profileLevel - 1]?.name ?? getCurrentLevel(profileXP).name);
        saveXP(profileXP);
        for (const reward of loadPendingRewards(userId)) {
          if (authUserIdRef.current !== userId) break;
          await submitReward(userId, reward);
        }
      } catch {
        // Preserve the account partition and retry on a later event/reconnect.
      } finally {
        if (profileControllerRef.current === controller) profileControllerRef.current = null;
      }
    }

    function retryPendingRewards() {
      const userId = authUserIdRef.current;
      if (!userId) return;
      for (const reward of loadPendingRewards(userId)) void submitReward(userId, reward);
    }

    applyLocalProgress();
    setMounted(true);
    window.addEventListener("online", retryPendingRewards);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const previousUserId = authUserIdRef.current;
      const userId = session?.user.id ?? null;
      authUserIdRef.current = userId;

      profileControllerRef.current?.abort();
      rewardControllers.forEach((controller) => controller.abort());
      rewardControllers.clear();

      if (userId) {
        applyLocalProgress();
        // Defer the profile query so it does not run inside Supabase's auth callback.
        window.setTimeout(() => {
          void syncProfileProgress(userId);
        }, 0);
      } else if (previousUserId) {
        clearLocalProgress();
        skipNextLocalSaveRef.current = true;
        currentXPRef.current = 0;
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
      profileControllerRef.current?.abort();
      rewardControllers.forEach((controller) => controller.abort());
      rewardControllers.clear();
      window.removeEventListener("online", retryPendingRewards);
    };
  }, [submitReward]);




  useEffect(()=>{

    if(!mounted) return;

    if (skipNextLocalSaveRef.current) {
      skipNextLocalSaveRef.current = false;
      return;
    }

    saveXP(xp);


  },[xp,mounted]);






  const addXP = useCallback((reward: RewardDescriptor) => {
    if (!reward || !Number.isFinite(reward.optimisticXP) || reward.optimisticXP <= 0) return;
    const amount = Math.floor(reward.optimisticXP);
    const previousXP = currentXPRef.current;
    const newXP = previousXP + amount;
    currentXPRef.current = newXP;
    setXP(newXP);
    const previousLevel = getCurrentLevel(previousXP);
    const newLevel = getCurrentLevel(newXP);
    setCurrentLevelName(newLevel.name);
    const previousLevelIndex = getLevelIndex(previousLevel.name);
    const newLevelIndex = getLevelIndex(newLevel.name);
    if (newLevelIndex > previousLevelIndex && newLevelIndex > loadLastCelebratedLevelIndex()) {
      saveLastCelebratedLevel(newLevel.name);
      setLevelCelebration({ previousLevel, newLevel, currentXP: newXP });
    }
    checkAchievements(newXP, loadStreak().current);

    const userId = authUserIdRef.current;
    if (!userId) return;
    enqueuePendingReward(userId, { ...reward, optimisticXP: amount });
    void submitReward(userId, { ...reward, optimisticXP: amount });
  }, [submitReward]);

  useEffect(() => {
    function handleAchievementReward(event: Event) {
      const detail = (event as CustomEvent<AchievementRewardEventDetail>).detail;
      if (!detail || !Number.isFinite(detail.xp) || detail.xp <= 0) return;

      window.queueMicrotask(() => addXP({ rewardId: `achievement:${detail.id}`, source: "achievement", optimisticXP: detail.xp }));
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
