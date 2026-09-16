import "server-only";

import { createAdminSupabaseClient } from "@/lib/server/adminAuthorization";
import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  getWorkSimCatalogueItem,
  isWorkSimId,
  WORK_SIM_PUBLIC_CATALOGUE,
  type WorkSimId,
} from "@/lib/workSims/catalog";
import {
  getCurrentAndBestWorkSimProgress,
  type WorkSimProgress,
} from "@/lib/server/workSims/workSimProgress";

export const WORK_SIM_NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
};

export type WorkSimViewer = { userId: string } | null;

export async function getWorkSimViewer(): Promise<WorkSimViewer> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return error || !user ? null : { userId: user.id };
  } catch {
    return null;
  }
}

function safeProgress(progress: WorkSimProgress) {
  const currentAttempt = progress.currentAttempt
    ? {
        attemptNumber: progress.currentAttempt.attemptNumber,
        status: progress.currentAttempt.status,
        score: progress.currentAttempt.score,
        maximumScore: progress.currentAttempt.maximumScore,
      }
    : null;
  const bestCompletedAttempt = progress.bestCompletedAttempt
    ? {
        attemptNumber: progress.bestCompletedAttempt.attemptNumber,
        status: progress.bestCompletedAttempt.status,
        score: progress.bestCompletedAttempt.score,
        maximumScore: progress.bestCompletedAttempt.maximumScore,
      }
    : null;

  return {
    currentAttempt,
    bestCompletedAttempt,
    completedStageIds: progress.stageResults
      .filter((stage) => stage.completionState === "completed")
      .map((stage) => stage.stageId),
    stageResults: progress.stageResults.map((stage) => ({
      stageId: stage.stageId,
      submissionCount: stage.submissionCount,
      bestScore: stage.bestScore,
      lastScore: stage.lastScore,
      maximumScore: stage.maximumScore,
      completionState: stage.completionState,
      hintCount: stage.hintCount,
    })),
  };
}

export async function getSafeWorkSimDetail(
  userId: string,
  simulationId: WorkSimId,
) {
  const supabase = createAdminSupabaseClient();
  if (!supabase) return null;

  const progress = await getCurrentAndBestWorkSimProgress(
    supabase,
    userId,
    simulationId,
  );
  return safeProgress(progress);
}

export async function getSafeWorkSimCatalogue(userId: string | null) {
  if (!userId) {
    return WORK_SIM_PUBLIC_CATALOGUE.map((simulation) => ({
      simulation,
      status: "not_started" as const,
    }));
  }

  const entries = await Promise.all(
    WORK_SIM_PUBLIC_CATALOGUE.map(async (simulation) => {
      const detail = await getSafeWorkSimDetail(userId, simulation.id);
      if (!detail) throw new Error("WorkSim service unavailable.");
      return {
        simulation,
        status: detail.currentAttempt
          ? ("in_progress" as const)
          : detail.bestCompletedAttempt
            ? ("completed" as const)
            : ("not_started" as const),
      };
    }),
  );
  return entries;
}

export function getRequestedSimulation(value: string) {
  if (!isWorkSimId(value)) return null;
  return getWorkSimCatalogueItem(value);
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    if (new URL(origin).origin !== new URL(request.url).origin) return false;
  } catch {
    return false;
  }
  const fetchSite = request.headers.get("sec-fetch-site");
  return !fetchSite || fetchSite === "same-origin";
}

export function isJsonContentType(request: Request) {
  return request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() === "application/json";
}

export async function readEmptyJsonBody(request: Request) {
  const maximumBytes = 1024;
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maximumBytes) return false;

  const reader = request.body?.getReader();
  if (!reader) return false;
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maximumBytes) {
        await reader.cancel();
        return false;
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const body: unknown = JSON.parse(new TextDecoder().decode(bytes));
    return typeof body === "object" && body !== null && !Array.isArray(body) && Object.keys(body).length === 0;
  } catch {
    return false;
  }
}

export async function readJsonObjectBody(request: Request, maximumBytes: number): Promise<unknown | null> {
  const contentLength = Number(request.headers.get("content-length"));
  if (!Number.isInteger(maximumBytes) || maximumBytes < 1 || (Number.isFinite(contentLength) && contentLength > maximumBytes)) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maximumBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const value: unknown = JSON.parse(new TextDecoder().decode(bytes));
    return typeof value === "object" && value !== null && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}
