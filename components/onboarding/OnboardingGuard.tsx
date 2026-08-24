"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  hasCompletedOnboarding,
  USER_PREFERENCES_EVENT,
} from "@/lib/userPreferences";

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
  const completed = useSyncExternalStore(
    subscribeToOnboarding,
    hasCompletedOnboarding,
    () => false,
  );
  const isOnboarding = pathname === "/onboarding";
  const isLogin = pathname === "/login";
  const isPublicInterviewGuide =
    pathname === "/data-analyst-interview-preparation";

  useEffect(() => {
    if (!completed && !isOnboarding && !isLogin && !isPublicInterviewGuide) {
      router.replace("/onboarding");
    } else if (completed && isOnboarding) {
      router.replace("/");
    }
  }, [completed, isLogin, isOnboarding, isPublicInterviewGuide, router]);

  if (
    (!completed && !isOnboarding && !isLogin && !isPublicInterviewGuide) ||
    (completed && isOnboarding)
  ) {
    return null;
  }

  return children;
}
