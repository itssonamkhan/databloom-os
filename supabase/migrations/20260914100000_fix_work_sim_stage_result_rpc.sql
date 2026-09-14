-- Forward-only repair for the applied WorkSim stage-result RPC.  In PL/pgSQL,
-- RETURNS TABLE output names are variables; `ON CONFLICT (attempt_id, stage_id)`
-- therefore remains ambiguous even when table references elsewhere are aliased.
-- The named primary-key constraint avoids column-name inference entirely.

CREATE OR REPLACE FUNCTION public.record_work_sim_stage_result(
  p_user_id uuid,
  p_attempt_id uuid,
  p_stage_id text,
  p_score integer,
  p_completed boolean,
  p_hint_count integer
)
RETURNS TABLE (
  attempt_id uuid,
  stage_id text,
  submission_count integer,
  best_score integer,
  last_score integer,
  maximum_score integer,
  completion_state text,
  hint_count integer,
  first_submitted_at timestamptz,
  last_submitted_at timestamptz,
  canonical_attempt_score integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  attempt_record public.work_sim_attempts%ROWTYPE;
  stage_record public.work_sim_stage_definitions%ROWTYPE;
  result_record public.work_sim_stage_results%ROWTYPE;
BEGIN
  IF p_user_id IS NULL OR p_attempt_id IS NULL OR p_stage_id IS NULL
    OR p_stage_id !~ '^[a-z0-9][a-z0-9-]*$'
    OR char_length(p_stage_id) NOT BETWEEN 2 AND 80
    OR p_score IS NULL OR p_score NOT BETWEEN 0 AND 1000
    OR p_completed IS NULL
    OR p_hint_count IS NULL OR p_hint_count NOT BETWEEN 0 AND 100
  THEN
    RAISE EXCEPTION 'Invalid WorkSim stage result';
  END IF;

  SELECT * INTO attempt_record
    FROM public.work_sim_attempts AS attempt
   WHERE attempt.id = p_attempt_id
     AND attempt.user_id = p_user_id
     AND attempt.status = 'in_progress'
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'WorkSim attempt is unavailable';
  END IF;

  SELECT * INTO stage_record
    FROM public.work_sim_stage_definitions AS stage_definition
   WHERE stage_definition.simulation_id = attempt_record.simulation_id
     AND stage_definition.stage_id = p_stage_id
     AND stage_definition.is_active = true
   FOR SHARE;
  IF NOT FOUND OR p_score > stage_record.maximum_score THEN
    RAISE EXCEPTION 'Invalid WorkSim stage score';
  END IF;

  INSERT INTO public.work_sim_stage_results AS stage_result (
    attempt_id, simulation_id, stage_id, submission_count, best_score, last_score,
    maximum_score, completion_state, hint_count, first_submitted_at, last_submitted_at
  ) VALUES (
    attempt_record.id, attempt_record.simulation_id, stage_record.stage_id, 1, p_score, p_score,
    stage_record.maximum_score, CASE WHEN p_completed THEN 'completed' ELSE 'in_progress' END,
    p_hint_count, now(), now()
  ) ON CONFLICT ON CONSTRAINT work_sim_stage_results_pkey DO UPDATE SET
    submission_count = stage_result.submission_count + 1,
    best_score = GREATEST(stage_result.best_score, EXCLUDED.best_score),
    last_score = EXCLUDED.last_score,
    completion_state = CASE
      WHEN stage_result.completion_state = 'completed' OR EXCLUDED.completion_state = 'completed'
        THEN 'completed'
      ELSE 'in_progress'
    END,
    hint_count = GREATEST(stage_result.hint_count, EXCLUDED.hint_count),
    last_submitted_at = now()
  RETURNING * INTO result_record;

  SELECT attempt.score INTO attempt_record.score
    FROM public.work_sim_attempts AS attempt
   WHERE attempt.id = attempt_record.id;
  RETURN QUERY SELECT result_record.attempt_id, result_record.stage_id, result_record.submission_count,
    result_record.best_score, result_record.last_score, result_record.maximum_score,
    result_record.completion_state, result_record.hint_count, result_record.first_submitted_at,
    result_record.last_submitted_at, attempt_record.score;
END;
$function$;

REVOKE ALL ON FUNCTION public.record_work_sim_stage_result(uuid, uuid, text, integer, boolean, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_work_sim_stage_result(uuid, uuid, text, integer, boolean, integer)
  TO service_role;
