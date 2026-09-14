import { NextResponse } from "next/server";

import {
  getSafeWorkSimCatalogue,
  getWorkSimViewer,
  WORK_SIM_NO_STORE_HEADERS,
} from "@/lib/server/workSims/workSimRouteSupport";

export const dynamic = "force-dynamic";

export async function GET() {
  const viewer = await getWorkSimViewer();
  try {
    const simulations = await getSafeWorkSimCatalogue(viewer?.userId ?? null);
    return NextResponse.json(
      { authenticated: Boolean(viewer), simulations },
      { headers: WORK_SIM_NO_STORE_HEADERS },
    );
  } catch {
    return NextResponse.json(
      { error: "WorkSims are temporarily unavailable." },
      { status: 500, headers: WORK_SIM_NO_STORE_HEADERS },
    );
  }
}
