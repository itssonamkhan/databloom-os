-- Core learner progress is isolated by authenticated Supabase user ID.
-- Browser clients never receive service-role credentials. The service role is
-- granted access for the server-mediated sync route and reward reconciliation.

CREATE TABLE IF NOT EXISTS public.learner_progress (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  schema_version integer NOT NULL DEFAULT 1,
  streak_current integer NOT NULL DEFAULT 0,
  streak_longest integer NOT NULL DEFAULT 0,
  streak_last_study_date date,
  revision bigint NOT NULL DEFAULT 0,
  guest_imported_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT learner_progress_schema_version_check
    CHECK (schema_version BETWEEN 1 AND 100),
  CONSTRAINT learner_progress_streak_current_check
    CHECK (streak_current BETWEEN 0 AND 100000),
  CONSTRAINT learner_progress_streak_longest_check
    CHECK (streak_longest BETWEEN 0 AND 100000),
  CONSTRAINT learner_progress_streak_order_check
    CHECK (streak_longest >= streak_current),
  CONSTRAINT learner_progress_revision_check
    CHECK (revision BETWEEN 0 AND 9223372036854775807)
);

CREATE TABLE IF NOT EXISTS public.learner_progress_items (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type text NOT NULL,
  item_id text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (user_id, item_type, item_id),
  CONSTRAINT learner_progress_items_type_check
    CHECK (
      item_type IN (
        'lesson',
        'practice',
        'checkpoint',
        'final_exam',
        'dataset',
        'dashboard',
        'portfolio',
        'interview_question',
        'achievement',
        'rewarded_item'
      )
    ),
  CONSTRAINT learner_progress_items_id_check
    CHECK (
      char_length(item_id) BETWEEN 3 AND 200
      AND item_id ~ '^[a-z0-9][a-z0-9_-]*(?::[a-z0-9][a-z0-9_-]*)+$'
    ),
  CONSTRAINT learner_progress_items_metadata_type_check
    CHECK (jsonb_typeof(metadata) = 'object'),
  CONSTRAINT learner_progress_items_metadata_size_check
    CHECK (octet_length(metadata::text) <= 4096)
);

CREATE TABLE IF NOT EXISTS public.learner_reward_ledger (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id text NOT NULL,
  source text NOT NULL,
  xp integer NOT NULL,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, reward_id),
  CONSTRAINT learner_reward_ledger_reward_id_check
    CHECK (char_length(reward_id) BETWEEN 3 AND 200),
  CONSTRAINT learner_reward_ledger_source_check
    CHECK (char_length(source) BETWEEN 1 AND 120),
  CONSTRAINT learner_reward_ledger_xp_check
    CHECK (xp BETWEEN 0 AND 100000)
);

CREATE TABLE IF NOT EXISTS public.learner_daily_stats (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  study_date date NOT NULL,
  lessons integer NOT NULL DEFAULT 0,
  minutes integer NOT NULL DEFAULT 0,
  xp_earned integer NOT NULL DEFAULT 0,
  goals_completed integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, study_date),
  CONSTRAINT learner_daily_stats_lessons_check
    CHECK (lessons BETWEEN 0 AND 1000000),
  CONSTRAINT learner_daily_stats_minutes_check
    CHECK (minutes BETWEEN 0 AND 1000000),
  CONSTRAINT learner_daily_stats_xp_check
    CHECK (xp_earned BETWEEN 0 AND 1000000),
  CONSTRAINT learner_daily_stats_goals_check
    CHECK (goals_completed BETWEEN 0 AND 1000000)
);

CREATE INDEX IF NOT EXISTS learner_progress_items_user_type_idx
  ON public.learner_progress_items (user_id, item_type);

CREATE INDEX IF NOT EXISTS learner_daily_stats_user_date_idx
  ON public.learner_daily_stats (user_id, study_date DESC);

CREATE OR REPLACE FUNCTION public.set_learner_progress_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS learner_progress_set_updated_at
  ON public.learner_progress;
CREATE TRIGGER learner_progress_set_updated_at
  BEFORE UPDATE ON public.learner_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.set_learner_progress_updated_at();

DROP TRIGGER IF EXISTS learner_daily_stats_set_updated_at
  ON public.learner_daily_stats;
CREATE TRIGGER learner_daily_stats_set_updated_at
  BEFORE UPDATE ON public.learner_daily_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.set_learner_progress_updated_at();

ALTER TABLE public.learner_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_progress FORCE ROW LEVEL SECURITY;
ALTER TABLE public.learner_progress_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_progress_items FORCE ROW LEVEL SECURITY;
ALTER TABLE public.learner_reward_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_reward_ledger FORCE ROW LEVEL SECURITY;
ALTER TABLE public.learner_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_daily_stats FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.learner_progress,
  public.learner_progress_items,
  public.learner_reward_ledger,
  public.learner_daily_stats
  FROM PUBLIC, anon;

GRANT SELECT, INSERT, UPDATE
  ON TABLE public.learner_progress,
    public.learner_progress_items,
    public.learner_daily_stats
  TO authenticated;
GRANT SELECT ON TABLE public.learner_reward_ledger TO authenticated;

GRANT ALL ON TABLE public.learner_progress,
  public.learner_progress_items,
  public.learner_reward_ledger,
  public.learner_daily_stats
  TO service_role;

CREATE POLICY learner_progress_self_select
  ON public.learner_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY learner_progress_self_insert
  ON public.learner_progress FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY learner_progress_self_update
  ON public.learner_progress FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY learner_progress_items_self_select
  ON public.learner_progress_items FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY learner_progress_items_self_insert
  ON public.learner_progress_items FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY learner_progress_items_self_update
  ON public.learner_progress_items FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY learner_reward_ledger_self_select
  ON public.learner_reward_ledger FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY learner_daily_stats_self_select
  ON public.learner_daily_stats FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY learner_daily_stats_self_insert
  ON public.learner_daily_stats FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY learner_daily_stats_self_update
  ON public.learner_daily_stats FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.learner_reward_ledger IS
  'Server-managed idempotency ledger. Browser clients have no write policy.';
COMMENT ON TABLE public.learner_progress IS
  'Authenticated learner progress only; guest data requires an explicit import flow.';
