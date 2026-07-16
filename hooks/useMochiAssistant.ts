"use client";

import { useCallback, useEffect, useState } from "react";

import {
  applyMochiMood,
  loadMochiAssistantState,
  markMochiMissionComplete,
  MOCHI_ASSISTANT_UPDATED_EVENT,
  type MochiMood,
} from "@/lib/mochi";
import { USER_PREFERENCES_EVENT } from "@/lib/userPreferences";

export function useMochiAssistant() {
  const [assistant, setAssistant] = useState(() => loadMochiAssistantState());

  useEffect(() => {
    const syncFromStorage = () => setAssistant(loadMochiAssistantState());

    const timer = window.setInterval(syncFromStorage, 60_000);
    window.addEventListener(MOCHI_ASSISTANT_UPDATED_EVENT, syncFromStorage);
    window.addEventListener(USER_PREFERENCES_EVENT, syncFromStorage);
    window.addEventListener("storage", syncFromStorage);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener(MOCHI_ASSISTANT_UPDATED_EVENT, syncFromStorage);
      window.removeEventListener(USER_PREFERENCES_EVENT, syncFromStorage);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, []);

  const selectMood = useCallback(
    (mood: MochiMood) => {
      const next = applyMochiMood(assistant, mood);
      setAssistant(next);
    },
    [assistant],
  );

  const completeMission = useCallback(
    () => {
      const next = markMochiMissionComplete(assistant);
      setAssistant(next);
    },
    [assistant],
  );

  return { assistant, selectMood, completeMission };
}
