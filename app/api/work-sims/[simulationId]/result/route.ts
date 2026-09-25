import { NextResponse } from "next/server";

import { createAdminSupabaseClient } from "@/lib/server/adminAuthorization";
import { getCurrentAndBestWorkSimProgress } from "@/lib/server/workSims/workSimProgress";
import {
  getRequestedSimulation,
  getSafeWorkSimResult,
  getWorkSimViewer,
  WORK_SIM_NO_STORE_HEADERS,
} from "@/lib/server/workSims/workSimRouteSupport";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: 401 | 404 | 500) {
  return NextResponse.json(
    { error: message },
    { status, headers: WORK_SIM_NO_STORE_HEADERS },
  );
}

/** Returns only a learner's safe, persisted result summary. */
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
    return errorResponse("WorkSim service unavailable.", 500);
  }
}
