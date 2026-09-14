-- Server-owned progress model for DataBloom WorkSims. Browser roles have no
-- table or function write access; future route handlers must authenticate with
-- auth.getUser() before using the service-role functions below.

CREATE TABLE IF NOT EXISTS public.work_sim_definitions (
  simulation_id text PRIMARY KEY,
  dataset_version text NOT NULL,
  public_title text NOT NULL,
  is_published boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT false,
  maximum_score integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT work_sim_definitions_id_check
    CHECK (simulation_id ~ '^[a-z0-9][a-z0-9_-]*$' AND char_length(simulation_id) BETWEEN 3 AND 120),
  CONSTRAINT work_sim_definitions_dataset_version_check
    CHECK (dataset_version ~ '^[a-z0-9][a-z0-9_-]*$' AND char_length(dataset_version) BETWEEN 3 AND 120),
  CONSTRAINT work_sim_definitions_title_check
    CHECK (char_length(btrim(public_title)) BETWEEN 1 AND 160),
  CONSTRAINT work_sim_definitions_maximum_score_check
    CHECK (maximum_score BETWEEN 1 AND 1000)
);

CREATE TABLE IF NOT EXISTS public.work_sim_stage_definitions (
  simulation_id text NOT NULL REFERENCES public.work_sim_definitions(simulation_id) ON DELETE RESTRICT,
  stage_id text NOT NULL,
  public_title text NOT NULL,
  stage_order smallint NOT NULL,
  maximum_score integer NOT NULL,
  is_required boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (simulation_id, stage_id),
  CONSTRAINT work_sim_stage_definitions_id_check
    CHECK (stage_id ~ '^[a-z0-9][a-z0-9-]*$' AND char_length(stage_id) BETWEEN 2 AND 80),
  CONSTRAINT work_sim_stage_definitions_title_check
    CHECK (char_length(btrim(public_title)) BETWEEN 1 AND 160),
  CONSTRAINT work_sim_stage_definitions_order_check
    CHECK (stage_order BETWEEN 1 AND 1000),
  CONSTRAINT work_sim_stage_definitions_maximum_score_check
    CHECK (maximum_score BETWEEN 0 AND 1000),
  CONSTRAINT work_sim_stage_definitions_order_unique
    UNIQUE (simulation_id, stage_order)
);

CREATE TABLE IF NOT EXISTS public.work_sim_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  simulation_id text NOT NULL REFERENCES public.work_sim_definitions(simulation_id) ON DELETE RESTRICT,
  dataset_version text NOT NULL,
  attempt_number integer NOT NULL,
  status text NOT NULL DEFAULT 'in_progress',
  score integer NOT NULL DEFAULT 0,
  maximum_score integer NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT work_sim_attempts_number_check
    CHECK (attempt_number BETWEEN 1 AND 1000000),
  CONSTRAINT work_sim_attempts_status_check
    CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  CONSTRAINT work_sim_attempts_score_check
    CHECK (score BETWEEN 0 AND maximum_score),
  CONSTRAINT work_sim_attempts_maximum_score_check
    CHECK (maximum_score BETWEEN 1 AND 1000),
  CONSTRAINT work_sim_attempts_completion_timestamp_check
    CHECK (
      (status = 'completed' AND completed_at IS NOT NULL)
      OR (status IN ('in_progress', 'abandoned') AND completed_at IS NULL)
    ),
  CONSTRAINT work_sim_attempts_user_simulation_number_unique
    UNIQUE (user_id, simulation_id, attempt_number)
);

CREATE UNIQUE INDEX IF NOT EXISTS work_sim_attempts_one_active_per_user_simulation
  ON public.work_sim_attempts (user_id, simulation_id)
  WHERE status = 'in_progress';
CREATE INDEX IF NOT EXISTS work_sim_attempts_user_simulation_history_idx
  ON public.work_sim_attempts (user_id, simulation_id, attempt_number DESC);

CREATE TABLE IF NOT EXISTS public.work_sim_stage_results (
  attempt_id uuid NOT NULL REFERENCES public.work_sim_attempts(id) ON DELETE CASCADE,
  simulation_id text NOT NULL,
  stage_id text NOT NULL,
  submission_count integer NOT NULL DEFAULT 0,
  best_score integer NOT NULL DEFAULT 0,
  last_score integer NOT NULL DEFAULT 0,
  maximum_score integer NOT NULL,
  completion_state text NOT NULL DEFAULT 'not_started',
  hint_count integer NOT NULL DEFAULT 0,
  first_submitted_at timestamptz,
  last_submitted_at timestamptz,
  PRIMARY KEY (attempt_id, stage_id),
  CONSTRAINT work_sim_stage_results_stage_definition_fk
    FOREIGN KEY (simulation_id, stage_id)
    REFERENCES public.work_sim_stage_definitions(simulation_id, stage_id)
    ON DELETE RESTRICT,
  CONSTRAINT work_sim_stage_results_submission_count_check
    CHECK (submission_count BETWEEN 0 AND 1000),
  CONSTRAINT work_sim_stage_results_score_check
    CHECK (best_score BETWEEN 0 AND maximum_score AND last_score BETWEEN 0 AND maximum_score AND best_score >= last_score),
  CONSTRAINT work_sim_stage_results_maximum_score_check
    CHECK (maximum_score BETWEEN 0 AND 1000),
  CONSTRAINT work_sim_stage_results_hint_count_check
    CHECK (hint_count BETWEEN 0 AND 100),
  CONSTRAINT work_sim_stage_results_state_check
    CHECK (completion_state IN ('not_started', 'in_progress', 'completed')),
  CONSTRAINT work_sim_stage_results_timestamp_check
    CHECK (
      (submission_count = 0 AND first_submitted_at IS NULL AND last_submitted_at IS NULL AND completion_state = 'not_started')
      OR (submission_count > 0 AND first_submitted_at IS NOT NULL AND last_submitted_at IS NOT NULL AND first_submitted_at <= last_submitted_at AND completion_state IN ('in_progress', 'completed'))
    )
);

CREATE INDEX IF NOT EXISTS work_sim_stage_results_attempt_idx
  ON public.work_sim_stage_results (attempt_id, completion_state);

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
      FROM public.work_sim_definitions
     WHERE simulation_id = NEW.simulation_id
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
    FROM public.work_sim_attempts
   WHERE id = NEW.attempt_id
   FOR SHARE;
  IF NOT FOUND OR attempt_record.simulation_id <> NEW.simulation_id OR attempt_record.status <> 'in_progress' THEN
    RAISE EXCEPTION 'WorkSim stage result does not belong to an active attempt';
  END IF;

  SELECT * INTO stage_record
    FROM public.work_sim_stage_definitions
   WHERE simulation_id = NEW.simulation_id
     AND stage_id = NEW.stage_id
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
  UPDATE public.work_sim_attempts
     SET score = COALESCE((
       SELECT sum(best_score)::integer
         FROM public.work_sim_stage_results
        WHERE attempt_id = target_attempt_id
     ), 0)
   WHERE id = target_attempt_id;
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
    AND EXISTS (SELECT 1 FROM public.work_sim_attempts WHERE simulation_id = OLD.simulation_id)
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
  IF EXISTS (SELECT 1 FROM public.work_sim_attempts WHERE simulation_id = target_simulation_id) THEN
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

DROP TRIGGER IF EXISTS work_sim_definitions_set_updated_at ON public.work_sim_definitions;
CREATE TRIGGER work_sim_definitions_set_updated_at
  BEFORE UPDATE ON public.work_sim_definitions
  FOR EACH ROW EXECUTE FUNCTION public.set_work_sim_updated_at();
DROP TRIGGER IF EXISTS work_sim_stage_definitions_set_updated_at ON public.work_sim_stage_definitions;
CREATE TRIGGER work_sim_stage_definitions_set_updated_at
  BEFORE UPDATE ON public.work_sim_stage_definitions
  FOR EACH ROW EXECUTE FUNCTION public.set_work_sim_updated_at();
DROP TRIGGER IF EXISTS work_sim_attempts_set_updated_at ON public.work_sim_attempts;
CREATE TRIGGER work_sim_attempts_set_updated_at
  BEFORE UPDATE ON public.work_sim_attempts
  FOR EACH ROW EXECUTE FUNCTION public.set_work_sim_updated_at();
DROP TRIGGER IF EXISTS work_sim_attempts_validate ON public.work_sim_attempts;
CREATE TRIGGER work_sim_attempts_validate
  BEFORE INSERT OR UPDATE ON public.work_sim_attempts
  FOR EACH ROW EXECUTE FUNCTION public.validate_work_sim_attempt();
DROP TRIGGER IF EXISTS work_sim_stage_results_validate ON public.work_sim_stage_results;
CREATE TRIGGER work_sim_stage_results_validate
  BEFORE INSERT OR UPDATE ON public.work_sim_stage_results
  FOR EACH ROW EXECUTE FUNCTION public.validate_work_sim_stage_result();
DROP TRIGGER IF EXISTS work_sim_attempt_score_recalculate ON public.work_sim_stage_results;
CREATE TRIGGER work_sim_attempt_score_recalculate
  AFTER INSERT OR UPDATE OR DELETE ON public.work_sim_stage_results
  FOR EACH ROW EXECUTE FUNCTION public.recalculate_work_sim_attempt_score();
DROP TRIGGER IF EXISTS work_sim_definitions_prevent_breaking_change ON public.work_sim_definitions;
CREATE TRIGGER work_sim_definitions_prevent_breaking_change
  BEFORE UPDATE ON public.work_sim_definitions
  FOR EACH ROW EXECUTE FUNCTION public.prevent_work_sim_definition_breaking_change();
DROP TRIGGER IF EXISTS work_sim_stage_definitions_prevent_breaking_change ON public.work_sim_stage_definitions;
CREATE TRIGGER work_sim_stage_definitions_prevent_breaking_change
  BEFORE INSERT OR UPDATE OR DELETE ON public.work_sim_stage_definitions
  FOR EACH ROW EXECUTE FUNCTION public.prevent_work_sim_stage_breaking_change();

INSERT INTO public.work_sim_definitions (
  simulation_id, dataset_version, public_title, is_published, is_active, maximum_score
) VALUES (
  'retail-profit-crisis-v1', 'retail-profit-crisis-v1', 'Revenue Up, Profit Down', true, true, 100
) ON CONFLICT (simulation_id) DO NOTHING;

INSERT INTO public.work_sim_stage_definitions (
  simulation_id, stage_id, public_title, stage_order, maximum_score, is_required, is_active
) VALUES
  ('retail-profit-crisis-v1', 'brief', 'Manager brief', 1, 0, true, true),
  ('retail-profit-crisis-v1', 'data-audit', 'Data audit', 2, 10, true, true),
  ('retail-profit-crisis-v1', 'kpi-diagnosis', 'KPI diagnosis', 3, 25, true, true),
  ('retail-profit-crisis-v1', 'sql-diagnosis', 'SQL diagnosis', 4, 30, true, true),
  ('retail-profit-crisis-v1', 'excel-analysis', 'Excel analysis', 5, 20, true, true),
  ('retail-profit-crisis-v1', 'dashboard-plan', 'Dashboard plan', 6, 10, true, true),
  ('retail-profit-crisis-v1', 'executive-summary', 'Executive summary', 7, 5, true, true)
ON CONFLICT (simulation_id, stage_id) DO NOTHING;

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
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Unknown learner';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':' || p_simulation_id, 0));
  SELECT * INTO definition_record
    FROM public.work_sim_definitions
   WHERE simulation_id = p_simulation_id
     AND is_published = true
     AND is_active = true
   FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unknown WorkSim';
  END IF;

  SELECT * INTO attempt_record
    FROM public.work_sim_attempts
   WHERE user_id = p_user_id
     AND simulation_id = p_simulation_id
     AND status = 'in_progress'
   FOR UPDATE;
  IF FOUND THEN
    RETURN QUERY SELECT attempt_record.id, attempt_record.simulation_id, attempt_record.dataset_version,
      attempt_record.attempt_number, attempt_record.status, attempt_record.score, attempt_record.maximum_score,
      attempt_record.started_at, attempt_record.updated_at, attempt_record.completed_at;
    RETURN;
  END IF;

  SELECT COALESCE(max(attempt_number), 0) + 1 INTO next_attempt_number
    FROM public.work_sim_attempts
   WHERE user_id = p_user_id AND simulation_id = p_simulation_id;
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
    FROM public.work_sim_attempts
   WHERE id = p_attempt_id
     AND user_id = p_user_id
     AND status = 'in_progress'
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'WorkSim attempt is unavailable';
  END IF;

  SELECT * INTO stage_record
    FROM public.work_sim_stage_definitions
   WHERE simulation_id = attempt_record.simulation_id
     AND stage_id = p_stage_id
     AND is_active = true
   FOR SHARE;
  IF NOT FOUND OR p_score > stage_record.maximum_score THEN
    RAISE EXCEPTION 'Invalid WorkSim stage score';
  END IF;

  INSERT INTO public.work_sim_stage_results (
    attempt_id, simulation_id, stage_id, submission_count, best_score, last_score,
    maximum_score, completion_state, hint_count, first_submitted_at, last_submitted_at
  ) VALUES (
    attempt_record.id, attempt_record.simulation_id, stage_record.stage_id, 1, p_score, p_score,
    stage_record.maximum_score, CASE WHEN p_completed THEN 'completed' ELSE 'in_progress' END,
    p_hint_count, now(), now()
  ) ON CONFLICT (attempt_id, stage_id) DO UPDATE SET
    submission_count = public.work_sim_stage_results.submission_count + 1,
    best_score = GREATEST(public.work_sim_stage_results.best_score, EXCLUDED.best_score),
    last_score = EXCLUDED.last_score,
    completion_state = CASE
      WHEN public.work_sim_stage_results.completion_state = 'completed' OR EXCLUDED.completion_state = 'completed'
        THEN 'completed'
      ELSE 'in_progress'
    END,
    hint_count = GREATEST(public.work_sim_stage_results.hint_count, EXCLUDED.hint_count),
    last_submitted_at = now()
  RETURNING * INTO result_record;

  SELECT score INTO attempt_record.score
    FROM public.work_sim_attempts WHERE id = attempt_record.id;
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
    FROM public.work_sim_attempts
   WHERE id = p_attempt_id
     AND user_id = p_user_id
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
         SELECT 1 FROM public.work_sim_stage_results AS result
          WHERE result.attempt_id = attempt_record.id
            AND result.stage_id = definition.stage_id
            AND result.completion_state = 'completed'
       )
  ) THEN
    RAISE EXCEPTION 'Required WorkSim stages are incomplete';
  END IF;
  UPDATE public.work_sim_attempts
     SET status = 'completed', completed_at = now()
   WHERE id = attempt_record.id
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
    FROM public.work_sim_attempts
   WHERE user_id = p_user_id
     AND simulation_id = p_simulation_id
     AND status = 'in_progress'
   FOR UPDATE;
  IF FOUND THEN
    UPDATE public.work_sim_attempts SET status = 'abandoned' WHERE id = previous_attempt.id;
  END IF;
  RETURN QUERY SELECT * FROM public.start_or_resume_work_sim_attempt(p_user_id, p_simulation_id);
END;
$function$;

ALTER TABLE public.work_sim_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_sim_definitions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.work_sim_stage_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_sim_stage_definitions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.work_sim_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_sim_attempts FORCE ROW LEVEL SECURITY;
ALTER TABLE public.work_sim_stage_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_sim_stage_results FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.work_sim_definitions,
  public.work_sim_stage_definitions,
  public.work_sim_attempts,
  public.work_sim_stage_results
  FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.work_sim_definitions,
  public.work_sim_stage_definitions,
  public.work_sim_attempts,
  public.work_sim_stage_results
  TO service_role;

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

COMMENT ON TABLE public.work_sim_stage_results IS
  'Stores only server-validated scores and progress counters; never raw learner answers, SQL, files, summaries, notes, or personal content.';
COMMENT ON FUNCTION public.record_work_sim_stage_result(uuid, uuid, text, integer, boolean, integer) IS
  'Service-role-only. Future server routes may call this only after server-side answer validation. WorkSim XP is not claimable through the generic browser reward endpoint.';
