import { NextResponse } from "next/server";

import { getRetailProfitCrisisAssignment } from "@/lib/workSims/retailProfitCrisisAssignments";
import { createAdminSupabaseClient } from "@/lib/server/adminAuthorization";
import { scoreRetailProfitCrisisSubmission } from "@/lib/server/workSims/retailProfitCrisisScoring";
import {
  getCurrentAndBestWorkSimProgress,
  submitValidatedWorkSimStageResult,
} from "@/lib/server/workSims/workSimProgress";
import {
  getRequestedSimulation,
  getWorkSimViewer,
  isJsonContentType,
  isSameOriginRequest,
  readJsonObjectBody,
  WORK_SIM_NO_STORE_HEADERS,
} from "@/lib/server/workSims/workSimRouteSupport";

export const dynamic = "force-dynamic";
const MAXIMUM_REQUEST_BYTES = 8 * 1024;

function errorResponse(message: string, status: 400 | 401 | 403 | 404 | 409 | 415 | 500) {
  return NextResponse.json({ error: message }, { status, headers: WORK_SIM_NO_STORE_HEADERS });
}

function getFirstIncompleteAssignment(simulationId: string, completedStageIds: readonly string[]) {
  const simulation = getRequestedSimulation(simulationId);
  if (!simulation) return null;
  const completed = new Set(completedStageIds);
  const nextStage = simulation.stages.find((stage) => !completed.has(stage.id));
  return nextStage ? getRetailProfitCrisisAssignment(nextStage.id) : null;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ simulationId: string }> },
) {
  const { simulationId } = await context.params;
  const simulation = getRequestedSimulation(simulationId);
  if (!simulation) return errorResponse("WorkSim not found.", 404);

  const viewer = await getWorkSimViewer();
  if (!viewer) return errorResponse("Authentication required.", 401);

  try {
    const supabase = createAdminSupabaseClient();
    if (!supabase) return errorResponse("WorkSim service unavailable.", 500);
    const progress = await getCurrentAndBestWorkSimProgress(supabase, viewer.userId, simulation.id);
    if (!progress.currentAttempt) return errorResponse("No active WorkSim attempt.", 404);
    const assignment = getFirstIncompleteAssignment(
      simulationId,
      progress.stageResults
        .filter((result) => result.completionState === "completed")
        .map((result) => result.stageId),
    );
    if (!assignment) return errorResponse("No active WorkSim stage.", 404);
    return NextResponse.json(
      {
        assignment,
        attempt: {
          attemptNumber: progress.currentAttempt.attemptNumber,
          score: progress.currentAttempt.score,
          maximumScore: progress.currentAttempt.maximumScore,
        },
      },
      { headers: WORK_SIM_NO_STORE_HEADERS },
    );
  } catch {
    return errorResponse("WorkSim service unavailable.", 500);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ simulationId: string }> },
) {
  const { simulationId } = await context.params;
  const simulation = getRequestedSimulation(simulationId);
  if (!simulation) return errorResponse("WorkSim not found.", 404);

  if (!isSameOriginRequest(request)) return errorResponse("Invalid request.", 403);
  if (!isJsonContentType(request)) return errorResponse("Invalid request.", 415);

  const body = await readJsonObjectBody(request, MAXIMUM_REQUEST_BYTES);
  if (!body || Object.getPrototypeOf(body) !== Object.prototype) return errorResponse("Invalid stage submission.", 400);
  const payload = body as Record<string, unknown>;
  const keys = Object.keys(payload).sort();
  if (
    keys.length !== 2
    || keys[0] !== "answers"
    || keys[1] !== "stageId"
    || typeof payload.stageId !== "string"
    || payload.stageId.length > 80
  ) return errorResponse("Invalid stage submission.", 400);
  const scored = scoreRetailProfitCrisisSubmission(payload.stageId, payload.answers);
  if (!scored || scored.stageId !== payload.stageId) return errorResponse("Invalid stage submission.", 400);

  const viewer = await getWorkSimViewer();
  if (!viewer) return errorResponse("Authentication required.", 401);

  try {
    const supabase = createAdminSupabaseClient();
    if (!supabase) return errorResponse("WorkSim service unavailable.", 500);
    const progress = await getCurrentAndBestWorkSimProgress(supabase, viewer.userId, simulation.id);
    if (!progress.currentAttempt) return errorResponse("No active WorkSim attempt.", 404);
    const assignment = getFirstIncompleteAssignment(
      simulationId,
      progress.stageResults
        .filter((result) => result.completionState === "completed")
        .map((result) => result.stageId),
    );
    if (!assignment || assignment.stageId !== scored.stageId) return errorResponse("Stage is not available.", 409);

    const result = await submitValidatedWorkSimStageResult(supabase, viewer.userId, {
      attemptId: progress.currentAttempt.id,
      simulationId: simulation.id,
      stageId: scored.stageId,
      score: scored.score,
      hintCount: 0,
    });
    return NextResponse.json(
      {
        stage: {
          id: result.stageResult.stageId,
          score: result.stageResult.bestScore,
          maximumScore: result.stageResult.maximumScore,
          completionState: result.stageResult.completionState,
        },
        attempt: {
          score: result.canonicalAttempt.score,
          maximumScore: simulation.maximumScore,
          status: result.canonicalAttempt.status,
          completedAt: result.canonicalAttempt.completedAt,
        },
        feedback: { message: "Stage submitted successfully." },
      },
      { headers: WORK_SIM_NO_STORE_HEADERS },
    );
  } catch {
    return errorResponse("Stage is no longer available.", 409);
  }
}
