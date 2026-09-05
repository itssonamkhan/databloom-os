import type { SupabaseClient } from "@supabase/supabase-js";

export const PROGRESS_SCHEMA_VERSION = 1 as const;
export const MAX_PROGRESS_BODY_BYTES = 128 * 1024;

const ITEM_TYPES = [
  "lesson",
  "practice",
  "checkpoint",
  "final_exam",
  "dataset",
  "dashboard",
  "portfolio",
  "interview_question",
  "achievement",
  "rewarded_item",
] as const;

type ItemType = (typeof ITEM_TYPES)[number];

type StreakInput = {
  current: number;
  longest: number;
  lastStudyDate: string | null;
};

type ProgressItemInput = {
  itemType: ItemType;
  itemId: string;
  completedAt: string;
  metadata: Record<string, unknown>;
};

type DailyStatsInput = {
  studyDate: string;
  lessons: number;
  minutes: number;
  xpEarned: number;
  goalsCompleted: number;
};

export type ProgressSyncPayload = {
  schemaVersion: typeof PROGRESS_SCHEMA_VERSION;
  revision?: number;
  streak?: StreakInput;
  items: ProgressItemInput[];
  dailyStats: DailyStatsInput[];
  guestImportConfirmed: boolean;
};

export class ProgressRevisionConflictError extends Error {
  constructor() {
    super("Progress revision conflict.");
    this.name = "ProgressRevisionConflictError";
  }
}

export type ProgressSyncState = {
  schemaVersion: typeof PROGRESS_SCHEMA_VERSION;
  xp: number;
  level: number;
  streak: StreakInput;
  items: ProgressItemInput[];
  dailyStats: DailyStatsInput[];
  revision: number;
  guestImportedAt: string | null;
};

type JsonRecord = Record<string, unknown>;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ITEM_ID_PATTERN = /^[a-z0-9][a-z0-9_-]*(?::[a-z0-9][a-z0-9_-]*)+$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T/;
const SENSITIVE_KEY_PATTERN =
  /note|answer|message|resume|email|password|token|secret|ip|user[-_ ]?agent|phone|address|reflection/i;
const UNSAFE_METADATA_KEY_PATTERN = /^(?:__proto__|constructor|prototype)$/i;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: JsonRecord, keys: readonly string[]) {
  const allowed = new Set(keys);
  return Object.keys(value).every((key) => allowed.has(key));
}

function isBoundedInteger(value: unknown, max: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= max;
}

function isValidDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isValidCompletedAt(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 64 || !ISO_DATE_PATTERN.test(value)) {
    return false;
  }
  return !Number.isNaN(Date.parse(value));
}

function containsSensitiveKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsSensitiveKey);
  if (!isRecord(value)) return false;
  return Object.entries(value).some(
    ([key, nested]) =>
      SENSITIVE_KEY_PATTERN.test(key) ||
      UNSAFE_METADATA_KEY_PATTERN.test(key) ||
      containsSensitiveKey(nested),
  );
}

function serializedBytes(value: unknown) {
  return new TextEncoder().encode(JSON.stringify(value)).byteLength;
}

function validateStreak(value: unknown): value is StreakInput {
  if (!isRecord(value) || !hasOnlyKeys(value, ["current", "longest", "lastStudyDate"])) {
    return false;
  }
  return (
    isBoundedInteger(value.current, 100000) &&
    isBoundedInteger(value.longest, 100000) &&
    value.longest >= value.current &&
    (value.lastStudyDate === null || isValidDateKey(value.lastStudyDate))
  );
}

function validateItem(value: unknown): value is ProgressItemInput {
  if (
    !isRecord(value) ||
    !hasOnlyKeys(value, ["itemType", "itemId", "completedAt", "metadata"]) ||
    typeof value.itemType !== "string" ||
    !ITEM_TYPES.includes(value.itemType as ItemType) ||
    typeof value.itemId !== "string" ||
    value.itemId.length > 200 ||
    !ITEM_ID_PATTERN.test(value.itemId) ||
    !isValidCompletedAt(value.completedAt) ||
    !isRecord(value.metadata) ||
    containsSensitiveKey(value.metadata) ||
    serializedBytes(value.metadata) > 4096
  ) {
    return false;
  }

  return true;
}

function validateDailyStats(value: unknown): value is DailyStatsInput {
  if (!isRecord(value) || !hasOnlyKeys(value, ["studyDate", "lessons", "minutes", "xpEarned", "goalsCompleted"])) {
    return false;
  }
  return (
    isValidDateKey(value.studyDate) &&
    isBoundedInteger(value.lessons, 1000000) &&
    isBoundedInteger(value.minutes, 1000000) &&
    isBoundedInteger(value.xpEarned, 1000000) &&
    isBoundedInteger(value.goalsCompleted, 1000000)
  );
}

export function parseProgressPayload(value: unknown): ProgressSyncPayload | null {
  if (
    !isRecord(value) ||
    !hasOnlyKeys(value, ["schemaVersion", "revision", "streak", "items", "dailyStats", "guestImportConfirmed"]) ||
    value.schemaVersion !== PROGRESS_SCHEMA_VERSION ||
    (value.revision !== undefined && !isBoundedInteger(value.revision, 2147483647)) ||
    (value.streak !== undefined && !validateStreak(value.streak)) ||
    !Array.isArray(value.items) ||
    value.items.length > 1000 ||
    !value.items.every(validateItem) ||
    !Array.isArray(value.dailyStats) ||
    value.dailyStats.length > 366 ||
    !value.dailyStats.every(validateDailyStats) ||
    (value.guestImportConfirmed !== undefined && typeof value.guestImportConfirmed !== "boolean")
  ) {
    return null;
  }

  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    revision: value.revision as number | undefined,
    streak: value.streak as StreakInput | undefined,
    items: value.items as ProgressItemInput[],
    dailyStats: value.dailyStats as DailyStatsInput[],
    guestImportConfirmed: value.guestImportConfirmed === true,
  };
}

function nonNegativeInteger(value: unknown) {
  return isBoundedInteger(value, 2147483647) ? value : 0;
}

function normalizeStreak(value: unknown): StreakInput {
  if (!validateStreak(value)) return { current: 0, longest: 0, lastStudyDate: null };
  return value;
}

function compareDateKeys(left: string | null, right: string | null) {
  if (!left) return -1;
  if (!right) return 1;
  return left.localeCompare(right);
}

function mergeStreak(existing: unknown, incoming?: StreakInput): StreakInput {
  const current = normalizeStreak(existing);
  if (!incoming) return current;

  const dateComparison = compareDateKeys(incoming.lastStudyDate, current.lastStudyDate);
  const latest = dateComparison >= 0 ? incoming : current;
  return {
    current: latest.current,
    longest: Math.max(current.longest, incoming.longest),
    lastStudyDate: latest.lastStudyDate,
  };
}

function rowToItem(row: JsonRecord): ProgressItemInput | null {
  const item = {
    itemType: row.item_type,
    itemId: row.item_id,
    completedAt: row.completed_at,
    metadata: row.metadata,
  };
  return validateItem(item) ? item : null;
}

function rowToDailyStats(row: JsonRecord): DailyStatsInput | null {
  const item = {
    studyDate: row.study_date,
    lessons: row.lessons,
    minutes: row.minutes,
    xpEarned: row.xp_earned,
    goalsCompleted: row.goals_completed,
  };
  return validateDailyStats(item) ? item : null;
}

export async function getProgressState(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProgressSyncState> {
  const [profileResult, progressResult, itemsResult, dailyResult] = await Promise.all([
    supabase.from("profiles").select("xp, level").eq("id", userId).maybeSingle(),
    supabase.from("learner_progress").select("schema_version, streak_current, streak_longest, streak_last_study_date, revision, guest_imported_at").eq("user_id", userId).maybeSingle(),
    supabase.from("learner_progress_items").select("item_type, item_id, completed_at, metadata").eq("user_id", userId).order("completed_at", { ascending: false }),
    supabase.from("learner_daily_stats").select("study_date, lessons, minutes, xp_earned, goals_completed").eq("user_id", userId).order("study_date", { ascending: false }),
  ]);

  if (profileResult.error || progressResult.error || itemsResult.error || dailyResult.error) {
    throw new Error("Progress storage unavailable.");
  }

  const profile: JsonRecord = isRecord(profileResult.data)
    ? profileResult.data
    : {};
  const progress: JsonRecord = isRecord(progressResult.data)
    ? progressResult.data
    : {};
  const items = Array.isArray(itemsResult.data)
    ? itemsResult.data.map((row) => (isRecord(row) ? rowToItem(row) : null)).filter((item): item is ProgressItemInput => Boolean(item))
    : [];
  const dailyStats = Array.isArray(dailyResult.data)
    ? dailyResult.data.map((row) => (isRecord(row) ? rowToDailyStats(row) : null)).filter((item): item is DailyStatsInput => Boolean(item))
    : [];

  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    xp: nonNegativeInteger(profile.xp),
    level: Math.max(1, nonNegativeInteger(profile.level) || 1),
    streak: normalizeStreak({
      current: progress.streak_current,
      longest: progress.streak_longest,
      lastStudyDate: progress.streak_last_study_date,
    }),
    items,
    dailyStats,
    revision: nonNegativeInteger(progress.revision),
    guestImportedAt: typeof progress.guest_imported_at === "string" ? progress.guest_imported_at : null,
  };
}

export async function mergeProgressState(
  supabase: SupabaseClient,
  userId: string,
  payload: ProgressSyncPayload,
): Promise<ProgressSyncState> {
  const existing = await getProgressState(supabase, userId);
  if (payload.revision !== undefined && payload.revision !== existing.revision) {
    throw new ProgressRevisionConflictError();
  }
  const mergedStreak = mergeStreak(existing.streak, payload.streak);
  const now = new Date().toISOString();

  const { data: currentProgress, error: currentProgressError } = await supabase
    .from("learner_progress")
    .select("revision, guest_imported_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (currentProgressError) throw new Error("Progress storage unavailable.");

  const currentRevision = isRecord(currentProgress) ? nonNegativeInteger(currentProgress.revision) : existing.revision;
  const progressRow = {
    user_id: userId,
    schema_version: PROGRESS_SCHEMA_VERSION,
    streak_current: mergedStreak.current,
    streak_longest: mergedStreak.longest,
    streak_last_study_date: mergedStreak.lastStudyDate,
    revision: currentRevision + 1,
    guest_imported_at:
      (isRecord(currentProgress) && typeof currentProgress.guest_imported_at === "string"
        ? currentProgress.guest_imported_at
        : existing.guestImportedAt) ??
      (payload.guestImportConfirmed ? now : null),
  };

  let progressError: { message?: string } | null = null;
  if (isRecord(currentProgress)) {
    const { data: updated, error } = await supabase
      .from("learner_progress")
      .update(progressRow)
      .eq("user_id", userId)
      .eq("revision", currentRevision)
      .select("revision")
      .maybeSingle();
    progressError = error;
    if (!error && !updated) {
      // A concurrent writer advanced the revision. Never overwrite its state.
      throw new ProgressRevisionConflictError();
    }
  } else {
    const { error } = await supabase
      .from("learner_progress")
      .insert(progressRow);
    progressError = error;
  }
  if (progressError) throw new Error("Progress storage unavailable.");

  const existingItems = new Map(existing.items.map((item) => [`${item.itemType}:${item.itemId}`, item]));
  for (const incoming of payload.items) {
    const key = `${incoming.itemType}:${incoming.itemId}`;
    const previous = existingItems.get(key);
    if (!previous || Date.parse(incoming.completedAt) >= Date.parse(previous.completedAt)) {
      existingItems.set(key, incoming);
    }
  }
  if (payload.items.length > 0) {
    const itemKeys = Array.from(
      new Set(payload.items.map((item) => `${item.itemType}:${item.itemId}`)),
    );
    const { error } = await supabase.from("learner_progress_items").upsert(
      itemKeys.map((key) => {
        const merged = existingItems.get(key)!;
        return {
          user_id: userId,
          item_type: merged.itemType,
          item_id: merged.itemId,
          completed_at: merged.completedAt,
          metadata: merged.metadata,
        };
      }),
      { onConflict: "user_id,item_type,item_id" },
    );
    if (error) throw new Error("Progress storage unavailable.");
  }

  const dailyByDate = new Map(existing.dailyStats.map((item) => [item.studyDate, item]));
  for (const incoming of payload.dailyStats) {
    const previous = dailyByDate.get(incoming.studyDate);
    dailyByDate.set(incoming.studyDate, previous
      ? {
          studyDate: incoming.studyDate,
          lessons: Math.max(previous.lessons, incoming.lessons),
          minutes: Math.max(previous.minutes, incoming.minutes),
          xpEarned: Math.max(previous.xpEarned, incoming.xpEarned),
          goalsCompleted: Math.max(previous.goalsCompleted, incoming.goalsCompleted),
        }
      : incoming);
  }
  if (payload.dailyStats.length > 0) {
    const dailyDates = Array.from(
      new Set(payload.dailyStats.map((item) => item.studyDate)),
    );
    const { error } = await supabase.from("learner_daily_stats").upsert(
      dailyDates.map((date) => {
        const merged = dailyByDate.get(date)!;
        return { user_id: userId, study_date: merged.studyDate, lessons: merged.lessons, minutes: merged.minutes, xp_earned: merged.xpEarned, goals_completed: merged.goalsCompleted };
      }),
      { onConflict: "user_id,study_date" },
    );
    if (error) throw new Error("Progress storage unavailable.");
  }

  return getProgressState(supabase, userId);
}
