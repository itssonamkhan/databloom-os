"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  applyUserTheme,
  hasCompletedOnboarding,
  USER_PREFERENCES_EVENT,
} from "@/lib/userPreferences";
import { useUserPreferences } from "@/hooks/useUserPreferences";

function subscribeToOnboarding(callback: () => void) {
  window.addEventListener(USER_PREFERENCES_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(USER_PREFERENCES_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export default function OnboardingGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const preferences = useUserPreferences();
  const completed = useSyncExternalStore(
    subscribeToOnboarding,
    hasCompletedOnboarding,
    () => false,
  );
  const isOnboarding = pathname === "/onboarding";

  useEffect(() => {
    applyUserTheme(preferences.theme);
  }, [preferences.theme]);

  useEffect(() => {
    if (!completed && !isOnboarding) {
      router.replace("/onboarding");
    } else if (completed && isOnboarding) {
      router.replace("/");
    }
  }, [completed, isOnboarding, router]);

  if ((!completed && !isOnboarding) || (completed && isOnboarding)) {
    return null;
  }

  return children;
}
