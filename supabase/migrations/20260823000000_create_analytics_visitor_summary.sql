-- Aggregate-only visitor metrics for the protected analytics summary endpoint.
-- The function intentionally returns no visitor IDs or raw analytics rows.
-- It is SECURITY DEFINER so the server-only service_role caller can aggregate
-- the RLS-protected table without making analytics_events readable to clients.
CREATE OR REPLACE FUNCTION public.get_analytics_visitor_summary(period_days integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  period_start timestamptz;
  period_end timestamptz := now();
  summary jsonb;
BEGIN
  IF period_days IS NULL OR period_days NOT IN (7, 30, 90) THEN
    RAISE EXCEPTION 'Unsupported analytics period.' USING ERRCODE = '22023';
  END IF;

  period_start := period_end - make_interval(days => period_days);

  WITH first_seen AS (
    SELECT
      visitor_id,
      min(occurred_at) AS first_seen_at
    FROM public.analytics_events
    WHERE event_name = 'page_view'
    GROUP BY visitor_id
  ),
  period_visitors AS (
    SELECT DISTINCT visitor_id
    FROM public.analytics_events
    WHERE event_name = 'page_view'
      AND occurred_at >= period_start
      AND occurred_at < period_end
  ),
  daily_visitors AS (
    SELECT
      (occurred_at AT TIME ZONE 'UTC')::date AS visit_date,
      count(DISTINCT visitor_id)::integer AS visitor_count
    FROM public.analytics_events
    WHERE event_name = 'page_view'
      AND occurred_at >= period_start
      AND occurred_at < period_end
    GROUP BY (occurred_at AT TIME ZONE 'UTC')::date
    ORDER BY visit_date
  )
  SELECT jsonb_build_object(
    'period', period_days || 'd',
    'totalVisitors', (
      SELECT count(DISTINCT visitor_id)::integer
      FROM public.analytics_events
      WHERE event_name = 'page_view'
    ),
    'activeVisitors', (
      SELECT count(*)::integer
      FROM period_visitors
    ),
    'newVisitors', (
      SELECT count(*)::integer
      FROM first_seen
      WHERE first_seen_at >= period_start
        AND first_seen_at < period_end
    ),
    'returningVisitors', (
      SELECT count(*)::integer
      FROM period_visitors AS current_visitors
      INNER JOIN first_seen
        ON first_seen.visitor_id = current_visitors.visitor_id
      WHERE first_seen.first_seen_at < period_start
    ),
    'visitorsOverTime', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'date', visit_date,
            'visitors', visitor_count
          )
          ORDER BY visit_date
        )
        FROM daily_visitors
      ),
      '[]'::jsonb
    )
  ) INTO summary;

  RETURN summary;
END;
$function$;

-- The function is callable only by the server-side Supabase role used by
-- SUPABASE_SECRET_KEY. Browser roles must never access these aggregates.
REVOKE EXECUTE ON FUNCTION public.get_analytics_visitor_summary(integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_analytics_visitor_summary(integer)
  TO service_role;
