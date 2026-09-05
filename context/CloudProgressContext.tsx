"use client";

import { createContext, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  applyCoreProgressSnapshot,
  CORE_PROGRESS_EVENTS,
  extractCoreProgressSnapshot,
  type CoreProgressSnapshot,
} from "@/lib/progress/coreProgressSnapshot";
import { switchLocalProgressIdentity } from "@/lib/progress/localProgressPartition";

type CloudProgressContextValue = { ready: boolean };
export const CloudProgressContext = createContext<CloudProgressContextValue>({ ready: false });

const SYNC_DELAY_MS = 900;

function isSnapshot(value: unknown): value is CoreProgressSnapshot {
  return Boolean(value && typeof value === "object" && Array.isArray((value as CoreProgressSnapshot).items) && Array.isArray((value as CoreProgressSnapshot).dailyStats));
}

export function CloudProgressProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const userIdRef = useRef<string | null>(null);
  const revisionRef = useRef(0);
  const hydratedRef = useRef(false);
  const hydratingRef = useRef(false);
  const generationRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const syncingRef = useRef(false);
  const pendingRef = useRef(false);
  const listenersInstalledRef = useRef(false);
  const switchingIdentityRef = useRef<string | null | undefined>(undefined);
  const hydrationControllerRef = useRef<AbortController | null>(null);
  const syncControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let disposed = false;
    const supabase = createClient();

    const fetchCloud = async (generation: number, signal?: AbortSignal) => {
      try {
        const response = await fetch("/api/progress", { cache: "no-store", credentials: "same-origin", signal });
        if (!response.ok) return;
        const payload: unknown = await response.json();
        if (disposed || generation !== generationRef.current || !isSnapshot(payload)) return;
        revisionRef.current = typeof payload.revision === "number" && Number.isInteger(payload.revision) ? payload.revision : 0;
        hydratingRef.current = true;
        try {
          applyCoreProgressSnapshot(payload);
        } finally {
          hydratingRef.current = false;
        }
      } catch {
        // The restored account partition remains usable while offline.
      }
    };

    const sync = async (generation: number, retry = 0) => {
      if (syncingRef.current || !userIdRef.current || !hydratedRef.current || disposed || generation !== generationRef.current) return;
      syncingRef.current = true;
      pendingRef.current = false;
      const controller = new AbortController();
      syncControllerRef.current = controller;
      try {
        const snapshot = extractCoreProgressSnapshot();
        const response = await fetch("/api/progress", {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({ ...snapshot, revision: revisionRef.current, guestImportConfirmed: false }),
        });
        if (response.status === 409 && retry === 0) {
          const hydrationController = new AbortController();
          hydrationControllerRef.current = hydrationController;
          try {
            await fetchCloud(generation, hydrationController.signal);
          } finally {
            if (hydrationControllerRef.current === hydrationController) hydrationControllerRef.current = null;
          }
          pendingRef.current = true;
          syncingRef.current = false;
          void sync(generation, 1);
          return;
        }
        if (response.ok) {
          const payload: unknown = await response.json();
          if (generation === generationRef.current && isSnapshot(payload) && typeof payload.revision === "number") revisionRef.current = payload.revision;
        } else if (response.status >= 500) {
          pendingRef.current = true;
        }
      } catch {
        pendingRef.current = true;
      } finally {
        if (syncControllerRef.current === controller) {
          syncControllerRef.current = null;
          syncingRef.current = false;
        }
      }
    };

    const scheduleSync = () => {
      if (!userIdRef.current || !hydratedRef.current) return;
      pendingRef.current = true;
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => { timerRef.current = null; void sync(generationRef.current); }, SYNC_DELAY_MS);
    };

    const onProgressEvent = () => {
      if (!hydratedRef.current || hydratingRef.current) return;
      scheduleSync();
    };
    const installListeners = () => {
      if (listenersInstalledRef.current) return;
      listenersInstalledRef.current = true;
      for (const eventName of CORE_PROGRESS_EVENTS) window.addEventListener(eventName, onProgressEvent);
      window.addEventListener("online", scheduleSync);
    };
    const removeListeners = () => {
      if (!listenersInstalledRef.current) return;
      listenersInstalledRef.current = false;
      for (const eventName of CORE_PROGRESS_EVENTS) window.removeEventListener(eventName, onProgressEvent);
      window.removeEventListener("online", scheduleSync);
    };

    const switchIdentity = async (nextUserId: string | null) => {
      if (switchingIdentityRef.current === nextUserId && !hydratedRef.current) return;
      switchingIdentityRef.current = nextUserId;
      const generation = ++generationRef.current;
      hydratedRef.current = false;
      setReady(false);
      removeListeners();
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = null;
      hydrationControllerRef.current?.abort();
      syncControllerRef.current?.abort();
      hydrationControllerRef.current = null;
      syncControllerRef.current = null;
      syncingRef.current = false;
      userIdRef.current = nextUserId;
      revisionRef.current = 0;
      if (!switchLocalProgressIdentity(nextUserId ? { type: "user", id: nextUserId } : "guest")) {
        if (process.env.NODE_ENV !== "production") console.warn("DataBloom progress storage is unavailable.");
        if (!nextUserId) {
          hydratedRef.current = true;
          setReady(true);
          installListeners();
        }
        if (switchingIdentityRef.current === nextUserId) switchingIdentityRef.current = undefined;
        return;
      }
      if (nextUserId) {
        const controller = new AbortController();
        hydrationControllerRef.current = controller;
        try {
          await fetchCloud(generation, controller.signal);
        } finally {
          if (hydrationControllerRef.current === controller) hydrationControllerRef.current = null;
        }
      }
      if (disposed || generation !== generationRef.current) return;
      hydratedRef.current = true;
      setReady(true);
      installListeners();
      if (switchingIdentityRef.current === nextUserId) switchingIdentityRef.current = undefined;
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUserId = session?.user.id ?? null;
      if (nextUserId === userIdRef.current && hydratedRef.current) return;
      void switchIdentity(nextUserId);
    });
    void supabase.auth.getUser().then(({ data }) => {
      if (!disposed) {
        const nextUserId = data.user?.id ?? null;
        if (nextUserId !== userIdRef.current || !hydratedRef.current) void switchIdentity(nextUserId);
      }
    });

    return () => {
      disposed = true;
      subscription.unsubscribe();
      removeListeners();
      hydrationControllerRef.current?.abort();
      syncControllerRef.current?.abort();
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  return <CloudProgressContext.Provider value={{ ready }}>{ready ? children : null}</CloudProgressContext.Provider>;
}
