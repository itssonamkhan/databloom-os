import { NextResponse } from "next/server";

import {
  getRequestedSimulation,
  getSafeWorkSimDetail,
  getWorkSimViewer,
  WORK_SIM_NO_STORE_HEADERS,
} from "@/lib/server/workSims/workSimRouteSupport";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ simulationId: string }> },
) {
  const { simulationId } = await context.params;
  const simulation = getRequestedSimulation(simulationId);
  if (!simulation) {
    return NextResponse.json(
      { error: "WorkSim not found." },
      { status: 404, headers: WORK_SIM_NO_STORE_HEADERS },
    );
  }

  const viewer = await getWorkSimViewer();
  if (!viewer) {
    return NextResponse.json(
      { authenticated: false, simulation, progress: null },
      { headers: WORK_SIM_NO_STORE_HEADERS },
    );
  }

  try {
    const progress = await getSafeWorkSimDetail(viewer.userId, simulation.id);
    if (!progress) throw new Error("Unavailable");
    return NextResponse.json(
      { authenticated: true, simulation, progress },
      { headers: WORK_SIM_NO_STORE_HEADERS },
    );
  } catch {
    return NextResponse.json(
      { error: "WorkSim progress is temporarily unavailable." },
      { status: 500, headers: WORK_SIM_NO_STORE_HEADERS },
    );
  }
}
