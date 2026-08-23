import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { createClient as createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PERIOD_DAYS = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
} as const;

type PeriodKey = keyof typeof PERIOD_DAYS;

type VisitorTrend = {
  date: string;
  visitors: number;
};

type VisitorSummary = {
  period: PeriodKey;
  totalVisitors: number;
  activeVisitors: number;
  newVisitors: number;
  returningVisitors: number;
  visitorsOverTime: VisitorTrend[];
};

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
};

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: noStoreHeaders },
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function normalizeSummary(value: unknown, period: PeriodKey): VisitorSummary | null {
  if (!isRecord(value) || value.period !== period) return null;

  if (
    !isNonNegativeInteger(value.totalVisitors) ||
    !isNonNegativeInteger(value.activeVisitors) ||
    !isNonNegativeInteger(value.newVisitors) ||
    !isNonNegativeInteger(value.returningVisitors) ||
    !Array.isArray(value.visitorsOverTime)
  ) {
    return null;
  }

  const visitorsOverTime: VisitorTrend[] = [];
  for (const entry of value.visitorsOverTime) {
    if (
      !isRecord(entry) ||
      typeof entry.date !== "string" ||
      !isNonNegativeInteger(entry.visitors)
    ) {
      return null;
    }

    visitorsOverTime.push({
      date: entry.date,
      visitors: entry.visitors,
    });
  }

  return {
    period,
    totalVisitors: value.totalVisitors,
    activeVisitors: value.activeVisitors,
    newVisitors: value.newVisitors,
    returningVisitors: value.returningVisitors,
    visitorsOverTime,
  };
}

function getAdminUserIds() {
  const configuredIds = process.env.ANALYTICS_ADMIN_USER_IDS;
  if (!configuredIds) return new Set<string>();

  return new Set(
    configuredIds
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

function createAnalyticsClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) return null;

  return createSupabaseClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export async function GET(request: Request) {
  try {
    const authClient = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return errorResponse("Authentication required.", 401);
    }

    const adminUserIds = getAdminUserIds();
    if (adminUserIds.size === 0 || !adminUserIds.has(user.id)) {
      return errorResponse("Forbidden.", 403);
    }

    const requestedPeriod = new URL(request.url).searchParams.get("period") ?? "30d";
    if (!Object.prototype.hasOwnProperty.call(PERIOD_DAYS, requestedPeriod)) {
      return errorResponse("Invalid analytics period.", 400);
    }

    const period = requestedPeriod as PeriodKey;
    const analyticsClient = createAnalyticsClient();
    if (!analyticsClient) {
      return errorResponse("Analytics service unavailable.", 500);
    }

    const { data, error } = await analyticsClient.rpc(
      "get_analytics_visitor_summary",
      { period_days: PERIOD_DAYS[period] },
    );

    const summary = error ? null : normalizeSummary(data, period);
    if (!summary) {
      return errorResponse("Analytics service unavailable.", 500);
    }

    return NextResponse.json(summary, { headers: noStoreHeaders });
  } catch {
    return errorResponse("Analytics service unavailable.", 500);
  }
}
