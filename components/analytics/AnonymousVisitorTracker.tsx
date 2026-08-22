"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const SESSION_ACTIVITY_KEY = "databloom-analytics-session-started-at";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export default function AnonymousVisitorTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);
  const sessionActivityRef = useRef<number | null>(null);

  useEffect(() => {
    if (
      !pathname ||
      pathname.startsWith("/api/") ||
      /\.[^/]+$/.test(pathname) ||
      lastTrackedPath.current === pathname
    ) {
      return;
    }

    lastTrackedPath.current = pathname;

    const sendEvent = (eventName: "page_view" | "session_start") => {
      void fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_name: eventName,
          path: pathname,
          properties: {},
        }),
        keepalive: true,
      }).catch(() => {
        // Analytics is optional and must never interrupt the app experience.
      });
    };

    const now = Date.now();
    let lastActivity = sessionActivityRef.current;

    try {
      if (lastActivity === null) {
        const storedValue = window.localStorage.getItem(SESSION_ACTIVITY_KEY);
        if (storedValue !== null) {
          const storedActivity = Number(storedValue);
          lastActivity = Number.isFinite(storedActivity)
            ? storedActivity
            : null;
        }
      }
    } catch {
      // Continue with the in-memory marker when storage is unavailable.
    }

    const startsNewSession =
      lastActivity === null || now - lastActivity >= SESSION_TIMEOUT_MS;

    sessionActivityRef.current = now;
    try {
      window.localStorage.setItem(SESSION_ACTIVITY_KEY, String(now));
    } catch {
      // Analytics remains best-effort when browser storage is unavailable.
    }

    if (startsNewSession) sendEvent("session_start");
    sendEvent("page_view");
  }, [pathname]);

  return null;
}
