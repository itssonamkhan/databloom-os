import { NextResponse } from "next/server";

import { createAdminSupabaseClient } from "@/lib/server/adminAuthorization";
import { startOrResumeWorkSimAttempt } from "@/lib/server/workSims/workSimProgress";
import {
  getRequestedSimulation,
  getSafeWorkSimDetail,
  getWorkSimViewer,
  isJsonContentType,
  isSameOriginRequest,
  readEmptyJsonBody,
  WORK_SIM_NO_STORE_HEADERS,
} from "@/lib/server/workSims/workSimRouteSupport";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: 400 | 401 | 403 | 404 | 415 | 500) {
  return NextResponse.json({ error: message }, { status, headers: WORK_SIM_NO_STORE_HEADERS });
}

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
    await startOrResumeWorkSimAttempt(supabase, viewer.userId, simulation.id);
    const progress = await getSafeWorkSimDetail(viewer.userId, simulation.id);
    if (!progress) return errorResponse("WorkSim service unavailable.", 500);
    return NextResponse.json(
      { simulation, progress },
      { status: 200, headers: WORK_SIM_NO_STORE_HEADERS },
    );
  } catch {
    return errorResponse("WorkSim service unavailable.", 500);
  }
}
