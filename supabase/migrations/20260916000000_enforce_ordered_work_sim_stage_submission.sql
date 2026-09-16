-- Enforces the ordered, single-submission WorkSim contract in the database.
-- The prior record_work_sim_stage_result RPC permits an upsert after a route
-- reads progress, which cannot safely prevent concurrent out-of-order writes.
-- This service-role-only RPC serializes every submission on the attempt row.

CREATE OR REPLACE FUNCTION public.submit_ordered_work_sim_stage_result(
  p_user_id uuid,
  p_attempt_id uuid,
  p_simulation_id text,
  p_stage_id text,
  p_score integer,
  p_hint_count integer
)
RETURNS TABLE (
  result_attempt_id uuid,
  result_stage_id text,
  result_submission_count integer,
  result_best_score integer,
  result_last_score integer,
  result_maximum_score integer,
  result_completion_state text,
  result_hint_count integer,
  result_first_submitted_at timestamptz,
  result_last_submitted_at timestamptz,
  canonical_attempt_score integer,
  canonical_attempt_status text,
  canonical_attempt_completed_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  attempt_record public.work_sim_attempts%ROWTYPE;
  definition_record public.work_sim_definitions%ROWTYPE;
  submitted_stage_record public.work_sim_stage_definitions%ROWTYPE;
  expected_stage_record public.work_sim_stage_definitions%ROWTYPE;
  result_record public.work_sim_stage_results%ROWTYPE;
BEGIN
  IF p_user_id IS NULL
    OR p_attempt_id IS NULL
    OR p_simulation_id IS NULL
    OR p_simulation_id !~ '^[a-z0-9][a-z0-9_-]*$'
    OR char_length(p_simulation_id) NOT BETWEEN 3 AND 120
    OR p_stage_id IS NULL
    OR p_stage_id !~ '^[a-z0-9][a-z0-9-]*$'
    OR char_length(p_stage_id) NOT BETWEEN 2 AND 80
    OR p_score IS NULL
    OR p_score NOT BETWEEN 0 AND 1000
    OR p_hint_count IS NULL
    OR p_hint_count NOT BETWEEN 0 AND 100
  THEN
    RAISE EXCEPTION 'Invalid WorkSim stage submission';
  END IF;

  -- Serializes all submissions and retries for this exact attempt.
  SELECT * INTO attempt_record
    FROM public.work_sim_attempts AS attempt
   WHERE attempt.id = p_attempt_id
     AND attempt.user_id = p_user_id
   FOR UPDATE;
  IF NOT FOUND
    OR attempt_record.simulation_id <> p_simulation_id
    OR attempt_record.status <> 'in_progress'
  THEN
    RAISE EXCEPTION 'WorkSim attempt is unavailable';
  END IF;

  SELECT * INTO definition_record
    FROM public.work_sim_definitions AS definition
   WHERE definition.simulation_id = p_simulation_id
     AND definition.is_published = true
     AND definition.is_active = true
   FOR SHARE;
  IF NOT FOUND
    OR definition_record.dataset_version <> attempt_record.dataset_version
    OR definition_record.maximum_score <> attempt_record.maximum_score
  THEN
    RAISE EXCEPTION 'WorkSim definition is unavailable';
  END IF;

  SELECT * INTO submitted_stage_record
    FROM public.work_sim_stage_definitions AS stage_definition
   WHERE stage_definition.simulation_id = attempt_record.simulation_id
     AND stage_definition.stage_id = p_stage_id
     AND stage_definition.is_active = true
   FOR SHARE;
  IF NOT FOUND OR p_score > submitted_stage_record.maximum_score THEN
    RAISE EXCEPTION 'Invalid WorkSim stage score';
  END IF;

  SELECT * INTO expected_stage_record
    FROM public.work_sim_stage_definitions AS stage_definition
   WHERE stage_definition.simulation_id = attempt_record.simulation_id
     AND stage_definition.is_active = true
     AND stage_definition.is_required = true
     AND NOT EXISTS (
       SELECT 1
         FROM public.work_sim_stage_results AS existing_result
        WHERE existing_result.attempt_id = attempt_record.id
          AND existing_result.stage_id = stage_definition.stage_id
          AND existing_result.completion_state = 'completed'
     )
   ORDER BY stage_definition.stage_order ASC
   LIMIT 1
   FOR SHARE;
  IF NOT FOUND OR expected_stage_record.stage_id <> submitted_stage_record.stage_id THEN
    RAISE EXCEPTION 'WorkSim stage is not unlocked';
  END IF;

  IF EXISTS (
    SELECT 1
      FROM public.work_sim_stage_results AS existing_result
     WHERE existing_result.attempt_id = attempt_record.id
       AND existing_result.stage_id = submitted_stage_record.stage_id
  ) THEN
    RAISE EXCEPTION 'WorkSim stage has already been submitted';
  END IF;

  -- No upsert: a completed stage is immutable and a duplicate cannot succeed.
  INSERT INTO public.work_sim_stage_results AS stage_result (
    attempt_id,
    simulation_id,
    stage_id,
    submission_count,
    best_score,
    last_score,
    maximum_score,
    completion_state,
    hint_count,
    first_submitted_at,
    last_submitted_at
  ) VALUES (
    attempt_record.id,
    attempt_record.simulation_id,
    submitted_stage_record.stage_id,
    1,
    p_score,
    p_score,
    submitted_stage_record.maximum_score,
    'completed',
    p_hint_count,
    now(),
    now()
  ) RETURNING * INTO result_record;

  -- The existing after-insert trigger recalculates this from stored best scores.
  SELECT * INTO attempt_record
    FROM public.work_sim_attempts AS attempt
   WHERE attempt.id = attempt_record.id
   FOR UPDATE;

  IF NOT EXISTS (
    SELECT 1
      FROM public.work_sim_stage_definitions AS stage_definition
     WHERE stage_definition.simulation_id = attempt_record.simulation_id
       AND stage_definition.is_active = true
       AND stage_definition.is_required = true
       AND NOT EXISTS (
         SELECT 1
           FROM public.work_sim_stage_results AS stage_result
          WHERE stage_result.attempt_id = attempt_record.id
            AND stage_result.stage_id = stage_definition.stage_id
            AND stage_result.completion_state = 'completed'
       )
  ) THEN
    UPDATE public.work_sim_attempts AS attempt
       SET status = 'completed',
           completed_at = now()
     WHERE attempt.id = attempt_record.id
       AND attempt.status = 'in_progress'
    RETURNING * INTO attempt_record;
  END IF;

  RETURN QUERY
  SELECT
    result_record.attempt_id,
    result_record.stage_id,
    result_record.submission_count,
    result_record.best_score,
    result_record.last_score,
    result_record.maximum_score,
    result_record.completion_state,
    result_record.hint_count,
    result_record.first_submitted_at,
    result_record.last_submitted_at,
    attempt_record.score,
    attempt_record.status,
    attempt_record.completed_at;
END;
$function$;

-- The unordered upsert must not remain a service-role mutation bypass.
REVOKE ALL ON FUNCTION public.record_work_sim_stage_result(uuid, uuid, text, integer, boolean, integer)
  FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.submit_ordered_work_sim_stage_result(uuid, uuid, text, text, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_ordered_work_sim_stage_result(uuid, uuid, text, text, integer, integer)
  TO service_role;

COMMENT ON FUNCTION public.submit_ordered_work_sim_stage_result(uuid, uuid, text, text, integer, integer) IS
  'Service-role-only. Atomically records a server-validated score for only the first incomplete active required WorkSim stage. Raw answers, SQL, summaries, files, feedback, and client aggregate scores are never accepted or stored.';
