"use client";

const ACTIVE_IDENTITY_KEY = "databloom-progress-active-identity-v1";
const PARTITION_PREFIX = "databloom-progress-partition-v1:";

// These are account-scoped browser stores. Device-only values (theme, music,
// analytics history/session markers, and the visitor cookie) are deliberately
// excluded and are never moved by this module.
export const PARTITIONED_PROGRESS_STORAGE_KEYS = [
  "userName",
  "studyBuddy",
  "buddyName",
  "customBuddyName",
  "careerGoal",
  "studyStyle",
  "dailyGoal",
  "hasCompletedOnboarding",
  "databloom-xp",
  "databloom-last-celebrated-level",
  "databloom-streak",
  "databloom-study-stats-v2",
  "databloom-learned-formulas",
  "databloom-formula-challenge-completions-v1",
  "databloom-favorite-formulas",
  "databloom-sql-progress-v1",
  "databloom-python-progress-v1",
  "databloom-statistics-progress-v1",
  "databloom-power-bi-progress-v1",
  "databloom-power-query-progress-v1",
  "databloom-tableau-progress-v1",
  "databloom-business-analytics-progress-v1",
  "databloom-dataset-library-progress-v1",
  "databloom-excel-pro-toolkit-v1",
  "databloom-practice-lab-v1",
  "databloom-checkpoint-progress-v1",
  "dashboard_progress",
  "databloom-dashboard-favorites",
  "databloom-dashboard-notes",
  "databloom-dashboard-practice-v1",
  "databloom-portfolio-project-progress-v1",
  "databloom-interview-hub-v1",
  "databloom-unlocked-achievements",
  "databloom-rewarded-achievements",
  "databloom-career-hub-v1",
  "databloom-planner-v1",
  "databloom-resume-builder-v1",
  "databloom-smart-notes-v1",
  "databloom-flashcards-v1",
  "databloom-mochi-friendship",
  "databloom-mochi-ai-v2",
] as const;

type Identity = "guest" | { type: "user"; id: string };

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function identityKey(identity: Identity) {
  return identity === "guest" ? "guest" : `user:${identity.id.toLowerCase()}`;
}

function partitionKey(identity: Identity) {
  return `${PARTITION_PREFIX}${identityKey(identity)}`;
}

function parseIdentity(value: string | null): string {
  if (value === "guest") return "guest";
  if (value?.startsWith("user:") && isUuid(value.slice(5))) {
    return `user:${value.slice(5).toLowerCase()}`;
  }
  return "guest";
}

function readPartition(identity: Identity): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(partitionKey(identity));
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const values = (parsed as { values?: unknown }).values;
    if (!values || typeof values !== "object" || Array.isArray(values)) return {};
    return Object.fromEntries(
      Object.entries(values).filter(
        ([key, value]) => (PARTITIONED_PROGRESS_STORAGE_KEYS as readonly string[]).includes(key) && typeof value === "string",
      ),
    );
  } catch {
    return {};
  }
}

function savePartition(identity: Identity): boolean {
  try {
    const values: Record<string, string> = {};
    for (const key of PARTITIONED_PROGRESS_STORAGE_KEYS) {
      const value = window.localStorage.getItem(key);
      if (value !== null) values[key] = value;
    }
    window.localStorage.setItem(partitionKey(identity), JSON.stringify({ version: 1, values }));
    return true;
  } catch {
    return false;
  }
}

function clearActive(): boolean {
  try {
    for (const key of PARTITIONED_PROGRESS_STORAGE_KEYS) window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function restore(identity: Identity): boolean {
  try {
    const values = readPartition(identity);
    for (const key of PARTITIONED_PROGRESS_STORAGE_KEYS) window.localStorage.removeItem(key);
    for (const [key, value] of Object.entries(values)) window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/** Switches the active browser partition without ever deleting a saved partition. */
export function switchLocalProgressIdentity(identity: Identity): boolean {
  if (typeof window === "undefined" || !("localStorage" in window)) return false;
  const target = identityKey(identity);
  const current = parseIdentity(window.localStorage.getItem(ACTIVE_IDENTITY_KEY));
  if (current === target) return true;

  const currentIdentity: Identity = current === "guest"
    ? "guest"
    : { type: "user", id: current.slice(5) };
  if (!savePartition(currentIdentity)) return false;
  if (!clearActive()) return false;
  if (!restore(identity)) return false;

  try {
    window.localStorage.setItem(ACTIVE_IDENTITY_KEY, target);
    return true;
  } catch {
    return false;
  }
}

export function getActiveProgressIdentity(): string {
  if (typeof window === "undefined") return "guest";
  try {
    return parseIdentity(window.localStorage.getItem(ACTIVE_IDENTITY_KEY));
  } catch {
    return "guest";
  }
}

/**
 * Deletes only a specified account's local progress and restores the saved
 * guest partition when that account is currently active.
 */
export function removeDeletedUserProgressPartition(userId: string): boolean {
  if (typeof window === "undefined" || !isUuid(userId)) return false;

  const userIdentity = { type: "user" as const, id: userId };
  const target = identityKey(userIdentity);

  try {
    const current = parseIdentity(window.localStorage.getItem(ACTIVE_IDENTITY_KEY));
    window.localStorage.removeItem(partitionKey(userIdentity));

    if (current === target) {
      if (!clearActive() || !restore("guest")) return false;
      window.localStorage.setItem(ACTIVE_IDENTITY_KEY, "guest");
    } else if (current === "guest") {
      // Reapply the saved guest values after auth listeners have cleared the
      // deleted account's active state.
      if (!restore("guest")) return false;
    }

    return true;
  } catch {
    return false;
  }
}
