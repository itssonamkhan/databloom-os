"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function AnonymousVisitorTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

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

    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: "page_view",
        path: pathname,
        properties: {},
      }),
      keepalive: true,
    }).catch(() => {
      // Analytics is optional and must never interrupt the app experience.
    });
  }, [pathname]);

  return null;
}
