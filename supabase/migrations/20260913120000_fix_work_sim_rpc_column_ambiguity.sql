-- Forward-only repair for the WorkSim RPCs installed by
-- 20260913000000_create_work_sim_progress.sql.  RETURNS TABLE output names are
-- PL/pgSQL variables, so all database columns are explicitly alias-qualified.

CREATE OR REPLACE FUNCTION public.set_work_sim_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_work_sim_attempt()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
DECLARE
  definition_record public.work_sim_definitions%ROWTYPE;
BEGIN
  IF TG_OP = 'UPDATE' AND (
    NEW.user_id IS DISTINCT FROM OLD.user_id
    OR NEW.simulation_id IS DISTINCT FROM OLD.simulation_id
    OR NEW.dataset_version IS DISTINCT FROM OLD.dataset_version
    OR NEW.attempt_number IS DISTINCT FROM OLD.attempt_number
    OR NEW.maximum_score IS DISTINCT FROM OLD.maximum_score
    OR NEW.started_at IS DISTINCT FROM OLD.started_at
  ) THEN
    RAISE EXCEPTION 'WorkSim attempt identity is immutable';
  END IF;

  IF TG_OP = 'INSERT' THEN
    SELECT * INTO definition_record
      FROM public.work_sim_definitions AS definition
     WHERE definition.simulation_id = NEW.simulation_id
     FOR SHARE;
    IF NOT FOUND
      OR definition_record.dataset_version <> NEW.dataset_version
      OR definition_record.maximum_score <> NEW.maximum_score
    THEN
      RAISE EXCEPTION 'WorkSim definition does not match attempt';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_work_sim_stage_result()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
DECLARE
  attempt_record public.work_sim_attempts%ROWTYPE;
  stage_record public.work_sim_stage_definitions%ROWTYPE;
BEGIN
  SELECT * INTO attempt_record
    FROM public.work_sim_attempts AS attempt
   WHERE attempt.id = NEW.attempt_id
   FOR SHARE;
  IF NOT FOUND OR attempt_record.simulation_id <> NEW.simulation_id OR attempt_record.status <> 'in_progress' THEN
    RAISE EXCEPTION 'WorkSim stage result does not belong to an active attempt';
  END IF;

  SELECT * INTO stage_record
    FROM public.work_sim_stage_definitions AS stage_definition
   WHERE stage_definition.simulation_id = NEW.simulation_id
     AND stage_definition.stage_id = NEW.stage_id
   FOR SHARE;
  IF NOT FOUND OR stage_record.maximum_score <> NEW.maximum_score THEN
    RAISE EXCEPTION 'WorkSim stage definition does not match result';
  END IF;

  IF TG_OP = 'UPDATE' AND (
    NEW.attempt_id IS DISTINCT FROM OLD.attempt_id
    OR NEW.simulation_id IS DISTINCT FROM OLD.simulation_id
    OR NEW.stage_id IS DISTINCT FROM OLD.stage_id
    OR NEW.maximum_score IS DISTINCT FROM OLD.maximum_score
    OR NEW.submission_count < OLD.submission_count
    OR NEW.hint_count < OLD.hint_count
    OR (OLD.completion_state = 'completed' AND NEW.completion_state <> 'completed')
  ) THEN
    RAISE EXCEPTION 'WorkSim stage identity and completed state are immutable';
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.recalculate_work_sim_attempt_score()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
DECLARE
  target_attempt_id uuid := COALESCE(NEW.attempt_id, OLD.attempt_id);
BEGIN
  UPDATE public.work_sim_attempts AS attempt
     SET score = COALESCE((
       SELECT sum(result.best_score)::integer
         FROM public.work_sim_stage_results AS result
        WHERE result.attempt_id = target_attempt_id
     ), 0)
   WHERE attempt.id = target_attempt_id;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.prevent_work_sim_definition_breaking_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
BEGIN
  IF TG_OP = 'UPDATE'
    AND EXISTS (
      SELECT 1
        FROM public.work_sim_attempts AS attempt
       WHERE attempt.simulation_id = OLD.simulation_id
    )
    AND (
      NEW.simulation_id IS DISTINCT FROM OLD.simulation_id
      OR NEW.dataset_version IS DISTINCT FROM OLD.dataset_version
      OR NEW.maximum_score IS DISTINCT FROM OLD.maximum_score
    )
  THEN
    RAISE EXCEPTION 'Cannot change a WorkSim version or score after attempts exist';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.prevent_work_sim_stage_breaking_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
DECLARE
  target_simulation_id text := CASE WHEN TG_OP = 'DELETE' THEN OLD.simulation_id ELSE NEW.simulation_id END;
BEGIN
  IF EXISTS (
    SELECT 1
      FROM public.work_sim_attempts AS attempt
     WHERE attempt.simulation_id = target_simulation_id
  ) THEN
    IF TG_OP IN ('INSERT', 'DELETE') THEN
      RAISE EXCEPTION 'Cannot change WorkSim stage requirements after attempts exist';
    END IF;
    IF NEW.simulation_id IS DISTINCT FROM OLD.simulation_id
      OR NEW.stage_id IS DISTINCT FROM OLD.stage_id
      OR NEW.maximum_score IS DISTINCT FROM OLD.maximum_score
      OR NEW.is_required IS DISTINCT FROM OLD.is_required
      OR NEW.is_active IS DISTINCT FROM OLD.is_active
    THEN
      RAISE EXCEPTION 'Cannot change WorkSim stage requirements after attempts exist';
    END IF;
  END IF;
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$function$;

CREATE OR REPLACE FUNCTION public.start_or_resume_work_sim_attempt(
  p_user_id uuid,
  p_simulation_id text
)
RETURNS TABLE (
  attempt_id uuid,
  simulation_id text,
  dataset_version text,
  attempt_number integer,
  status text,
  score integer,
  maximum_score integer,
  started_at timestamptz,
  updated_at timestamptz,
  completed_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  definition_record public.work_sim_definitions%ROWTYPE;
  attempt_record public.work_sim_attempts%ROWTYPE;
  next_attempt_number integer;
BEGIN
  IF p_user_id IS NULL OR p_simulation_id IS NULL OR char_length(p_simulation_id) NOT BETWEEN 3 AND 120 THEN
    RAISE EXCEPTION 'Invalid WorkSim attempt request';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM auth.users AS auth_user WHERE auth_user.id = p_user_id) THEN
    RAISE EXCEPTION 'Unknown learner';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':' || p_simulation_id, 0));
  SELECT * INTO definition_record
    FROM public.work_sim_definitions AS definition
   WHERE definition.simulation_id = p_simulation_id
     AND definition.is_published = true
     AND definition.is_active = true
   FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unknown WorkSim';
  END IF;

  SELECT * INTO attempt_record
    FROM public.work_sim_attempts AS active_attempt
   WHERE active_attempt.user_id = p_user_id
     AND active_attempt.simulation_id = p_simulation_id
     AND active_attempt.status = 'in_progress'
   FOR UPDATE;
  IF FOUND THEN
    RETURN QUERY SELECT attempt_record.id, attempt_record.simulation_id, attempt_record.dataset_version,
      attempt_record.attempt_number, attempt_record.status, attempt_record.score, attempt_record.maximum_score,
      attempt_record.started_at, attempt_record.updated_at, attempt_record.completed_at;
    RETURN;
  END IF;

  SELECT COALESCE(max(historical_attempt.attempt_number), 0) + 1 INTO next_attempt_number
    FROM public.work_sim_attempts AS historical_attempt
   WHERE historical_attempt.user_id = p_user_id
     AND historical_attempt.simulation_id = p_simulation_id;
  INSERT INTO public.work_sim_attempts (
    user_id, simulation_id, dataset_version, attempt_number, maximum_score
  ) VALUES (
    p_user_id, definition_record.simulation_id, definition_record.dataset_version,
    next_attempt_number, definition_record.maximum_score
  ) RETURNING * INTO attempt_record;
  RETURN QUERY SELECT attempt_record.id, attempt_record.simulation_id, attempt_record.dataset_version,
    attempt_record.attempt_number, attempt_record.status, attempt_record.score, attempt_record.maximum_score,
    attempt_record.started_at, attempt_record.updated_at, attempt_record.completed_at;
END;
$function$;

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
  ) ON CONFLICT (attempt_id, stage_id) DO UPDATE SET
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

CREATE OR REPLACE FUNCTION public.complete_work_sim_attempt(
  p_user_id uuid,
  p_attempt_id uuid
)
RETURNS TABLE (
  attempt_id uuid,
  simulation_id text,
  dataset_version text,
  attempt_number integer,
  status text,
  score integer,
  maximum_score integer,
  started_at timestamptz,
  updated_at timestamptz,
  completed_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  attempt_record public.work_sim_attempts%ROWTYPE;
BEGIN
  IF p_user_id IS NULL OR p_attempt_id IS NULL THEN
    RAISE EXCEPTION 'Invalid WorkSim completion request';
  END IF;
  SELECT * INTO attempt_record
    FROM public.work_sim_attempts AS attempt
   WHERE attempt.id = p_attempt_id
     AND attempt.user_id = p_user_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'WorkSim attempt is unavailable';
  END IF;
  IF attempt_record.status = 'completed' THEN
    RETURN QUERY SELECT attempt_record.id, attempt_record.simulation_id, attempt_record.dataset_version,
      attempt_record.attempt_number, attempt_record.status, attempt_record.score, attempt_record.maximum_score,
      attempt_record.started_at, attempt_record.updated_at, attempt_record.completed_at;
    RETURN;
  END IF;
  IF attempt_record.status <> 'in_progress' THEN
    RAISE EXCEPTION 'WorkSim attempt cannot be completed';
  END IF;
  IF EXISTS (
    SELECT 1
      FROM public.work_sim_stage_definitions AS definition
     WHERE definition.simulation_id = attempt_record.simulation_id
       AND definition.is_required = true
       AND NOT EXISTS (
         SELECT 1
           FROM public.work_sim_stage_results AS result
          WHERE result.attempt_id = attempt_record.id
            AND result.stage_id = definition.stage_id
            AND result.completion_state = 'completed'
       )
  ) THEN
    RAISE EXCEPTION 'Required WorkSim stages are incomplete';
  END IF;
  UPDATE public.work_sim_attempts AS attempt
     SET status = 'completed', completed_at = now()
   WHERE attempt.id = attempt_record.id
  RETURNING * INTO attempt_record;
  RETURN QUERY SELECT attempt_record.id, attempt_record.simulation_id, attempt_record.dataset_version,
    attempt_record.attempt_number, attempt_record.status, attempt_record.score, attempt_record.maximum_score,
    attempt_record.started_at, attempt_record.updated_at, attempt_record.completed_at;
END;
$function$;

CREATE OR REPLACE FUNCTION public.abandon_and_start_work_sim_attempt(
  p_user_id uuid,
  p_simulation_id text
)
RETURNS TABLE (
  attempt_id uuid,
  simulation_id text,
  dataset_version text,
  attempt_number integer,
  status text,
  score integer,
  maximum_score integer,
  started_at timestamptz,
  updated_at timestamptz,
  completed_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  previous_attempt public.work_sim_attempts%ROWTYPE;
BEGIN
  IF p_user_id IS NULL OR p_simulation_id IS NULL OR char_length(p_simulation_id) NOT BETWEEN 3 AND 120 THEN
    RAISE EXCEPTION 'Invalid WorkSim retry request';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':' || p_simulation_id, 0));
  SELECT * INTO previous_attempt
    FROM public.work_sim_attempts AS active_attempt
   WHERE active_attempt.user_id = p_user_id
     AND active_attempt.simulation_id = p_simulation_id
     AND active_attempt.status = 'in_progress'
   FOR UPDATE;
  IF FOUND THEN
    UPDATE public.work_sim_attempts AS attempt
       SET status = 'abandoned'
     WHERE attempt.id = previous_attempt.id;
  END IF;
  RETURN QUERY
  SELECT retry_attempt.attempt_id, retry_attempt.simulation_id, retry_attempt.dataset_version,
    retry_attempt.attempt_number, retry_attempt.status, retry_attempt.score, retry_attempt.maximum_score,
    retry_attempt.started_at, retry_attempt.updated_at, retry_attempt.completed_at
    FROM public.start_or_resume_work_sim_attempt(p_user_id, p_simulation_id) AS retry_attempt;
END;
$function$;

REVOKE ALL ON FUNCTION public.start_or_resume_work_sim_attempt(uuid, text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.record_work_sim_stage_result(uuid, uuid, text, integer, boolean, integer)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.complete_work_sim_attempt(uuid, uuid)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.abandon_and_start_work_sim_attempt(uuid, text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_work_sim_updated_at()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_work_sim_attempt()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_work_sim_stage_result()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recalculate_work_sim_attempt_score()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_work_sim_definition_breaking_change()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_work_sim_stage_breaking_change()
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.start_or_resume_work_sim_attempt(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_work_sim_stage_result(uuid, uuid, text, integer, boolean, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_work_sim_attempt(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.abandon_and_start_work_sim_attempt(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.set_work_sim_updated_at() TO service_role;
GRANT EXECUTE ON FUNCTION public.validate_work_sim_attempt() TO service_role;
GRANT EXECUTE ON FUNCTION public.validate_work_sim_stage_result() TO service_role;
GRANT EXECUTE ON FUNCTION public.recalculate_work_sim_attempt_score() TO service_role;
GRANT EXECUTE ON FUNCTION public.prevent_work_sim_definition_breaking_change() TO service_role;
GRANT EXECUTE ON FUNCTION public.prevent_work_sim_stage_breaking_change() TO service_role;
