"use client";

import { useEffect, useState } from "react";

import {
  defaultUserPreferences,
  loadUserPreferences,
  USER_PREFERENCES_EVENT,
} from "@/lib/userPreferences";

export function useUserPreferences() {
  const [preferences, setPreferences] = useState(() => ({
    ...defaultUserPreferences,
  }));

  useEffect(() => {
    const sync = () => setPreferences(loadUserPreferences());
    sync();
    window.addEventListener(USER_PREFERENCES_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(USER_PREFERENCES_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return preferences;
}
