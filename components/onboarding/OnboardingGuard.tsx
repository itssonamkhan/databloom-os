"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  hasCompletedOnboarding,
  USER_PREFERENCES_EVENT,
} from "@/lib/userPreferences";

export default function OnboardingGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [completed, setCompleted] = useState(() => hasCompletedOnboarding());
  const isOnboarding = pathname === "/onboarding";

  useEffect(() => {
    const syncCompletion = () => setCompleted(hasCompletedOnboarding());
    window.addEventListener(USER_PREFERENCES_EVENT, syncCompletion);
    window.addEventListener("storage", syncCompletion);
    return () => {
      window.removeEventListener(USER_PREFERENCES_EVENT, syncCompletion);
      window.removeEventListener("storage", syncCompletion);
    };
  }, []);

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
