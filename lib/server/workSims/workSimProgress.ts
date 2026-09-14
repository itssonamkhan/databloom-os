import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  WORK_SIM_CATALOG,
  type WorkSimId,
  type WorkSimStageId,
} from "@/lib/workSims/catalog";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export { WORK_SIM_CATALOG, type WorkSimId, type WorkSimStageId };
export type WorkSimStatus = "in_progress" | "completed" | "abandoned";
export type WorkSimCompletionState = "not_started" | "in_progress" | "completed";

export type WorkSimDefinition = {
  simulationId: WorkSimId;
  datasetVersion: string;
  publicTitle: string;
  isPublished: boolean;
  isActive: boolean;
  maximumScore: number;
  stages: Array<{
    stageId: WorkSimStageId;
    publicTitle: string;
    stageOrder: number;
    maximumScore: number;
    isRequired: boolean;
    isActive: boolean;
  }>;
};

export type WorkSimAttempt = {
  id: string;
  simulationId: WorkSimId;
  datasetVersion: string;
  attemptNumber: number;
  status: WorkSimStatus;
  score: number;
  maximumScore: number;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export type WorkSimStageResult = {
  attemptId: string;
  stageId: WorkSimStageId;
  submissionCount: number;
  bestScore: number;
  lastScore: number;
  maximumScore: number;
  completionState: WorkSimCompletionState;
  hintCount: number;
  firstSubmittedAt: string | null;
  lastSubmittedAt: string | null;
};

export type WorkSimProgress = {
  definition: WorkSimDefinition;
  currentAttempt: WorkSimAttempt | null;
  bestCompletedAttempt: WorkSimAttempt | null;
  stageResults: WorkSimStageResult[];
};

export class WorkSimProgressError extends Error {
  constructor() {
    super("WorkSim progress is unavailable.");
    this.name = "WorkSimProgressError";
  }
}

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function integer(value: unknown, minimum: number, maximum: number): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= minimum && value <= maximum
    ? value
    : null;
}

function text(value: unknown, maximum: number): string | null {
  return typeof value === "string" && value.length > 0 && value.length <= maximum ? value : null;
}

function timestamp(value: unknown): string | null {
  return typeof value === "string" && value.length <= 64 && !Number.isNaN(Date.parse(value)) ? value : null;
}

function isWorkSimId(value: unknown): value is WorkSimId {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(WORK_SIM_CATALOG, value);
}

function isWorkSimStageId(simulationId: WorkSimId, value: unknown): value is WorkSimStageId {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(WORK_SIM_CATALOG[simulationId].stages, value);
}

function assertUserId(userId: string) {
  if (!UUID_PATTERN.test(userId)) throw new WorkSimProgressError();
}

function assertSimulationId(simulationId: string): asserts simulationId is WorkSimId {
  if (!isWorkSimId(simulationId)) throw new WorkSimProgressError();
}

function parseAttempt(value: unknown): WorkSimAttempt | null {
  if (!isRecord(value) || !isWorkSimId(value.simulation_id) || !UUID_PATTERN.test(String(value.id))) return null;
  const attemptNumber = integer(value.attempt_number, 1, 1_000_000);
  const score = integer(value.score, 0, 1000);
  const maximumScore = integer(value.maximum_score, 1, 1000);
  const startedAt = timestamp(value.started_at);
  const updatedAt = timestamp(value.updated_at);
  const completedAt = value.completed_at === null ? null : timestamp(value.completed_at);
  const datasetVersion = text(value.dataset_version, 120);
  if (!attemptNumber || score === null || maximumScore === null || score > maximumScore || !datasetVersion || datasetVersion !== WORK_SIM_CATALOG[value.simulation_id].datasetVersion || maximumScore !== WORK_SIM_CATALOG[value.simulation_id].maximumScore || !startedAt || !updatedAt || (value.status !== "in_progress" && value.status !== "completed" && value.status !== "abandoned") || (value.status === "completed" && !completedAt) || (value.status !== "completed" && completedAt !== null)) return null;
  return {
    id: String(value.id), simulationId: value.simulation_id, datasetVersion,
    attemptNumber, status: value.status, score, maximumScore, startedAt, updatedAt, completedAt,
  };
}

function parseStageResult(simulationId: WorkSimId, value: unknown): WorkSimStageResult | null {
  if (!isRecord(value) || !UUID_PATTERN.test(String(value.attempt_id)) || !isWorkSimStageId(simulationId, value.stage_id)) return null;
  const submissionCount = integer(value.submission_count, 0, 1000);
  const bestScore = integer(value.best_score, 0, 1000);
  const lastScore = integer(value.last_score, 0, 1000);
  const maximumScore = integer(value.maximum_score, 0, 1000);
  const hintCount = integer(value.hint_count, 0, 100);
  const firstSubmittedAt = value.first_submitted_at === null ? null : timestamp(value.first_submitted_at);
  const lastSubmittedAt = value.last_submitted_at === null ? null : timestamp(value.last_submitted_at);
  if (submissionCount === null || bestScore === null || lastScore === null || maximumScore === null || maximumScore !== WORK_SIM_CATALOG[simulationId].stages[value.stage_id] || hintCount === null || bestScore > maximumScore || lastScore > maximumScore || bestScore < lastScore || (value.completion_state !== "not_started" && value.completion_state !== "in_progress" && value.completion_state !== "completed") || (submissionCount === 0 && (firstSubmittedAt !== null || lastSubmittedAt !== null || value.completion_state !== "not_started")) || (submissionCount > 0 && (!firstSubmittedAt || !lastSubmittedAt || value.completion_state === "not_started"))) return null;
  return {
    attemptId: String(value.attempt_id), stageId: value.stage_id, submissionCount, bestScore, lastScore,
    maximumScore, completionState: value.completion_state, hintCount, firstSubmittedAt, lastSubmittedAt,
  };
}

/** Future route handlers must authenticate first, then create and pass a service-role client. */
export async function getWorkSimDefinition(supabase: SupabaseClient, simulationId: string): Promise<WorkSimDefinition> {
  assertSimulationId(simulationId);
  const [definitionResult, stagesResult] = await Promise.all([
    supabase.from("work_sim_definitions").select("simulation_id, dataset_version, public_title, is_published, is_active, maximum_score").eq("simulation_id", simulationId).maybeSingle(),
    supabase.from("work_sim_stage_definitions").select("stage_id, public_title, stage_order, maximum_score, is_required, is_active").eq("simulation_id", simulationId).order("stage_order", { ascending: true }),
  ]);
  if (definitionResult.error || stagesResult.error || !isRecord(definitionResult.data) || !Array.isArray(stagesResult.data)) throw new WorkSimProgressError();
  const definition = definitionResult.data;
  const maximumScore = integer(definition.maximum_score, 1, 1000);
  const datasetVersion = text(definition.dataset_version, 120);
  const publicTitle = text(definition.public_title, 160);
  if (!maximumScore || maximumScore !== WORK_SIM_CATALOG[simulationId].maximumScore || !datasetVersion || datasetVersion !== WORK_SIM_CATALOG[simulationId].datasetVersion || !publicTitle || typeof definition.is_published !== "boolean" || typeof definition.is_active !== "boolean") throw new WorkSimProgressError();
  const stages = stagesResult.data.map((row) => {
    if (!isRecord(row) || !isWorkSimStageId(simulationId, row.stage_id)) return null;
    const stageOrder = integer(row.stage_order, 1, 1000);
    const stageMaximum = integer(row.maximum_score, 0, 1000);
    const stageTitle = text(row.public_title, 160);
    if (stageOrder === null || stageMaximum === null || stageMaximum !== WORK_SIM_CATALOG[simulationId].stages[row.stage_id] || !stageTitle || typeof row.is_required !== "boolean" || typeof row.is_active !== "boolean") return null;
    return { stageId: row.stage_id, publicTitle: stageTitle, stageOrder, maximumScore: stageMaximum, isRequired: row.is_required, isActive: row.is_active };
  });
  if (stages.some((stage) => stage === null) || stages.length !== Object.keys(WORK_SIM_CATALOG[simulationId].stages).length || stages.reduce((total, stage) => total + (stage?.maximumScore ?? 0), 0) !== maximumScore) throw new WorkSimProgressError();
  return { simulationId, datasetVersion, publicTitle, isPublished: definition.is_published, isActive: definition.is_active, maximumScore, stages: stages as WorkSimDefinition["stages"] };
}

export async function getCurrentAndBestWorkSimProgress(supabase: SupabaseClient, userId: string, simulationId: string): Promise<WorkSimProgress> {
  assertUserId(userId);
  const definition = await getWorkSimDefinition(supabase, simulationId);
  const attemptsResult = await supabase.from("work_sim_attempts").select("id, simulation_id, dataset_version, attempt_number, status, score, maximum_score, started_at, updated_at, completed_at").eq("user_id", userId).eq("simulation_id", definition.simulationId).order("attempt_number", { ascending: false });
  if (attemptsResult.error || !Array.isArray(attemptsResult.data)) throw new WorkSimProgressError();
  const attempts = attemptsResult.data.map(parseAttempt).filter((attempt): attempt is WorkSimAttempt => Boolean(attempt));
  if (attempts.length !== attemptsResult.data.length) throw new WorkSimProgressError();
  const currentAttempt = attempts.find((attempt) => attempt.status === "in_progress") ?? null;
  const bestCompletedAttempt = attempts.filter((attempt) => attempt.status === "completed").sort((left, right) => right.score - left.score || right.attemptNumber - left.attemptNumber)[0] ?? null;
  const stageResultsResult = currentAttempt
    ? await supabase.from("work_sim_stage_results").select("attempt_id, stage_id, submission_count, best_score, last_score, maximum_score, completion_state, hint_count, first_submitted_at, last_submitted_at").eq("attempt_id", currentAttempt.id).order("stage_id", { ascending: true })
    : { data: [], error: null };
  if (stageResultsResult.error || !Array.isArray(stageResultsResult.data)) throw new WorkSimProgressError();
  const stageResults = stageResultsResult.data.map((row) => parseStageResult(definition.simulationId, row)).filter((result): result is WorkSimStageResult => Boolean(result));
  if (stageResults.length !== stageResultsResult.data.length) throw new WorkSimProgressError();
  return { definition, currentAttempt, bestCompletedAttempt, stageResults };
}

async function rpcAttempt(supabase: SupabaseClient, functionName: "start_or_resume_work_sim_attempt" | "abandon_and_start_work_sim_attempt", userId: string, simulationId: WorkSimId): Promise<WorkSimAttempt> {
  const { data, error } = await supabase.rpc(functionName, { p_user_id: userId, p_simulation_id: simulationId });
  const row = Array.isArray(data) ? data[0] : data;
  const attempt = parseAttempt(isRecord(row) ? { ...row, id: row.attempt_id ?? row.id } : row);
  if (error || !attempt) throw new WorkSimProgressError();
  return attempt;
}

export async function startOrResumeWorkSimAttempt(supabase: SupabaseClient, userId: string, simulationId: string): Promise<WorkSimAttempt> {
  assertUserId(userId);
  assertSimulationId(simulationId);
  return rpcAttempt(supabase, "start_or_resume_work_sim_attempt", userId, simulationId);
}

export async function abandonAndRetryWorkSimAttempt(supabase: SupabaseClient, userId: string, simulationId: string): Promise<WorkSimAttempt> {
  assertUserId(userId);
  assertSimulationId(simulationId);
  return rpcAttempt(supabase, "abandon_and_start_work_sim_attempt", userId, simulationId);
}

/** The score and completion flag must come from a future server-only answer validator, never a browser payload. */
export async function recordValidatedWorkSimStageResult(supabase: SupabaseClient, userId: string, input: { attemptId: string; simulationId: string; stageId: string; score: number; completed: boolean; hintCount: number }): Promise<{ stageResult: WorkSimStageResult; canonicalAttemptScore: number }> {
  assertUserId(userId);
  if (!UUID_PATTERN.test(input.attemptId)) throw new WorkSimProgressError();
  assertSimulationId(input.simulationId);
  if (!isWorkSimStageId(input.simulationId, input.stageId) || integer(input.score, 0, WORK_SIM_CATALOG[input.simulationId].stages[input.stageId]) === null || typeof input.completed !== "boolean" || integer(input.hintCount, 0, 100) === null) throw new WorkSimProgressError();
  const { data, error } = await supabase.rpc("record_work_sim_stage_result", {
    p_user_id: userId, p_attempt_id: input.attemptId, p_stage_id: input.stageId,
    p_score: input.score, p_completed: input.completed, p_hint_count: input.hintCount,
  });
  const row = Array.isArray(data) ? data[0] : data;
  if (error || !isRecord(row)) throw new WorkSimProgressError();
  const stageResult = parseStageResult(input.simulationId, { ...row, attempt_id: row.attempt_id ?? input.attemptId });
  const canonicalAttemptScore = integer(row.canonical_attempt_score, 0, WORK_SIM_CATALOG[input.simulationId].maximumScore);
  if (!stageResult || canonicalAttemptScore === null) throw new WorkSimProgressError();
  return { stageResult, canonicalAttemptScore };
}

export async function completeWorkSimAttempt(supabase: SupabaseClient, userId: string, attemptId: string): Promise<WorkSimAttempt> {
  assertUserId(userId);
  if (!UUID_PATTERN.test(attemptId)) throw new WorkSimProgressError();
  const { data, error } = await supabase.rpc("complete_work_sim_attempt", { p_user_id: userId, p_attempt_id: attemptId });
  const row = Array.isArray(data) ? data[0] : data;
  const attempt = parseAttempt(isRecord(row) ? { ...row, id: row.attempt_id ?? attemptId } : row);
  if (error || !attempt) throw new WorkSimProgressError();
  return attempt;
}

// Task 3 may call the existing server-only reward operation only after this
// module records a validated stage result. Do not add worksim:* to the generic
// browser-callable /api/progress/reward path.
