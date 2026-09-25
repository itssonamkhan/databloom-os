import { NextResponse } from "next/server";

import { createAdminSupabaseClient } from "@/lib/server/adminAuthorization";
import {
  getCurrentAndBestWorkSimProgress,
  startOrResumeWorkSimAttempt,
} from "@/lib/server/workSims/workSimProgress";
import {
  getRequestedSimulation,
  getSafeWorkSimResult,
  getWorkSimViewer,
  isJsonContentType,
  isSameOriginRequest,
  readEmptyJsonBody,
  WORK_SIM_NO_STORE_HEADERS,
} from "@/lib/server/workSims/workSimRouteSupport";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: 400 | 401 | 403 | 404 | 405 | 409 | 415 | 500) {
  return NextResponse.json(
    { error: message },
    { status, headers: WORK_SIM_NO_STORE_HEADERS },
  );
}

export function GET() {
  return NextResponse.json(
    { error: "Method not allowed." },
    {
      status: 405,
      headers: {
        ...WORK_SIM_NO_STORE_HEADERS,
        Allow: "POST",
      },
    },
  );
}

/**
 * Starts a new attempt only after a persisted completion. `start_or_resume`
 * is intentionally used after that precondition: concurrent confirmations
 * converge on one active attempt instead of abandoning one another's work.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ simulationId: string }> },
) {
  const { simulationId } = await context.params;
  const simulation = getRequestedSimulation(simulationId);
  if (!simulation) return errorResponse("WorkSim not found.", 404);

  const viewer = await getWorkSimViewer();
  if (!viewer) return errorResponse("Authentication required.", 401);
  if (!isSameOriginRequest(request)) return errorResponse("Invalid request.", 403);
  if (!isJsonContentType(request)) return errorResponse("Invalid request.", 415);
  if (!(await readEmptyJsonBody(request))) return errorResponse("Invalid request.", 400);

  try {
    const supabase = createAdminSupabaseClient();
    if (!supabase) return errorResponse("WorkSim service unavailable.", 500);

    const beforeRetry = await getCurrentAndBestWorkSimProgress(
      supabase,
      viewer.userId,
      simulation.id,
    );
    if (beforeRetry.currentAttempt || !beforeRetry.latestCompletedAttempt) {
      return errorResponse("A completed WorkSim result is required before trying again.", 409);
    }

    await startOrResumeWorkSimAttempt(supabase, viewer.userId, simulation.id);
    const progress = await getCurrentAndBestWorkSimProgress(
      supabase,
      viewer.userId,
      simulation.id,
    );
    return NextResponse.json(
      { result: getSafeWorkSimResult(progress) },
      { headers: WORK_SIM_NO_STORE_HEADERS },
    );
  } catch {
    return errorResponse("Your new WorkSim attempt could not be started.", 500);
  }
}
