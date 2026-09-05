-- Formalize the pre-existing profiles dependency and provide one server-only,
-- idempotent transaction for authenticated XP rewards.
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level integer DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

UPDATE public.profiles SET xp = GREATEST(COALESCE(xp, 0), 0);
UPDATE public.profiles SET level = GREATEST(COALESCE(level, 1), 1);
UPDATE public.profiles
SET level = CASE
  WHEN xp >= 9200 THEN 15 WHEN xp >= 7900 THEN 14
  WHEN xp >= 6700 THEN 13 WHEN xp >= 5600 THEN 12
  WHEN xp >= 4600 THEN 11 WHEN xp >= 3700 THEN 10
  WHEN xp >= 2900 THEN 9 WHEN xp >= 2250 THEN 8
  WHEN xp >= 1700 THEN 7 WHEN xp >= 1250 THEN 6
  WHEN xp >= 850 THEN 5 WHEN xp >= 500 THEN 4
  WHEN xp >= 250 THEN 3 WHEN xp >= 100 THEN 2 ELSE 1
END;
UPDATE public.profiles SET created_at = now() WHERE created_at IS NULL;
UPDATE public.profiles SET updated_at = now() WHERE updated_at IS NULL;

ALTER TABLE public.profiles ALTER COLUMN xp SET DEFAULT 0;
ALTER TABLE public.profiles ALTER COLUMN xp SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN level SET DEFAULT 1;
ALTER TABLE public.profiles ALTER COLUMN level SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.profiles ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.profiles ALTER COLUMN updated_at SET NOT NULL;

-- Existing accounts may predate the signup trigger. This preserves existing
-- profile XP and creates only missing rows.
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_profiles_updated_at();

CREATE INDEX IF NOT EXISTS learner_reward_ledger_user_source_awarded_idx
  ON public.learner_reward_ledger (user_id, source, awarded_at);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Canonical XP and level are server-managed by award_learner_xp. Browser
-- sessions retain read access for their own profile, but cannot alter rewards.
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO service_role;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS profiles_self_select ON public.profiles;

CREATE POLICY profiles_self_select
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);
-- The API passes a user verified with auth.getUser(). Only service_role may
-- execute this function; browser roles cannot forge or replay rewards directly.
CREATE OR REPLACE FUNCTION public.award_learner_xp(
  p_user_id uuid,
  p_reward_id text,
  p_source text,
  p_xp integer,
  p_daily_cap integer
)
RETURNS TABLE (
  newly_awarded boolean,
  canonical_xp integer,
  canonical_level integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  inserted_count integer;
  current_xp bigint;
  next_xp bigint;
  next_level integer;
BEGIN
  IF p_user_id IS NULL
    OR p_reward_id IS NULL
    OR p_reward_id !~ '^[a-z0-9][a-z0-9_-]*(?::[a-z0-9][a-z0-9_-]*)+$'
    OR char_length(p_reward_id) > 200
    OR p_source IS NULL
    OR char_length(p_source) NOT BETWEEN 1 AND 120
    OR p_xp IS NULL
    OR p_xp NOT BETWEEN 1 AND 100000
    OR p_daily_cap IS NULL
    OR p_daily_cap NOT BETWEEN 1 AND 1000
  THEN
    RAISE EXCEPTION 'Invalid reward input';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Unknown learner';
  END IF;

  INSERT INTO public.profiles (id, email)
  SELECT id, email FROM auth.users WHERE id = p_user_id
  ON CONFLICT (id) DO NOTHING;

  -- Serialize caps and the ledger decision for this learner/source/day.
  PERFORM pg_advisory_xact_lock(
    hashtextextended(p_user_id::text || ':' || p_source || ':' || current_date::text, 0)
  );

  SELECT COALESCE(p.xp, 0)::bigint
    INTO current_xp
    FROM public.profiles AS p
   WHERE p.id = p_user_id
   FOR UPDATE;

  IF EXISTS (
    SELECT 1 FROM public.learner_reward_ledger
     WHERE user_id = p_user_id AND reward_id = p_reward_id
  ) THEN
    next_xp := current_xp;
    next_level := CASE
      WHEN next_xp >= 9200 THEN 15 WHEN next_xp >= 7900 THEN 14
      WHEN next_xp >= 6700 THEN 13 WHEN next_xp >= 5600 THEN 12
      WHEN next_xp >= 4600 THEN 11 WHEN next_xp >= 3700 THEN 10
      WHEN next_xp >= 2900 THEN 9 WHEN next_xp >= 2250 THEN 8
      WHEN next_xp >= 1700 THEN 7 WHEN next_xp >= 1250 THEN 6
      WHEN next_xp >= 850 THEN 5 WHEN next_xp >= 500 THEN 4
      WHEN next_xp >= 250 THEN 3 WHEN next_xp >= 100 THEN 2 ELSE 1
    END;
    RETURN QUERY SELECT false, next_xp::integer, next_level;
    RETURN;
  END IF;

  IF (
    SELECT count(*) FROM public.learner_reward_ledger
     WHERE user_id = p_user_id
       AND source = p_source
       AND awarded_at >= date_trunc('day', now())
  ) >= p_daily_cap THEN
    RETURN QUERY SELECT false, current_xp::integer,
      CASE
        WHEN current_xp >= 9200 THEN 15 WHEN current_xp >= 7900 THEN 14
        WHEN current_xp >= 6700 THEN 13 WHEN current_xp >= 5600 THEN 12
        WHEN current_xp >= 4600 THEN 11 WHEN current_xp >= 3700 THEN 10
        WHEN current_xp >= 2900 THEN 9 WHEN current_xp >= 2250 THEN 8
        WHEN current_xp >= 1700 THEN 7 WHEN current_xp >= 1250 THEN 6
        WHEN current_xp >= 850 THEN 5 WHEN current_xp >= 500 THEN 4
        WHEN current_xp >= 250 THEN 3 WHEN current_xp >= 100 THEN 2 ELSE 1
      END;
    RETURN;
  END IF;

  INSERT INTO public.learner_reward_ledger (user_id, reward_id, source, xp)
  VALUES (p_user_id, p_reward_id, p_source, p_xp)
  ON CONFLICT (user_id, reward_id) DO NOTHING;
  GET DIAGNOSTICS inserted_count = ROW_COUNT;

  IF inserted_count = 1 THEN
    next_xp := LEAST(2147483647::bigint, current_xp + p_xp::bigint);
    next_level := CASE
      WHEN next_xp >= 9200 THEN 15 WHEN next_xp >= 7900 THEN 14
      WHEN next_xp >= 6700 THEN 13 WHEN next_xp >= 5600 THEN 12
      WHEN next_xp >= 4600 THEN 11 WHEN next_xp >= 3700 THEN 10
      WHEN next_xp >= 2900 THEN 9 WHEN next_xp >= 2250 THEN 8
      WHEN next_xp >= 1700 THEN 7 WHEN next_xp >= 1250 THEN 6
      WHEN next_xp >= 850 THEN 5 WHEN next_xp >= 500 THEN 4
      WHEN next_xp >= 250 THEN 3 WHEN next_xp >= 100 THEN 2 ELSE 1
    END;
    UPDATE public.profiles
       SET xp = next_xp::integer,
           level = next_level,
           updated_at = now()
     WHERE id = p_user_id;
  ELSE
    next_xp := current_xp;
    next_level := CASE
      WHEN next_xp >= 9200 THEN 15 WHEN next_xp >= 7900 THEN 14
      WHEN next_xp >= 6700 THEN 13 WHEN next_xp >= 5600 THEN 12
      WHEN next_xp >= 4600 THEN 11 WHEN next_xp >= 3700 THEN 10
      WHEN next_xp >= 2900 THEN 9 WHEN next_xp >= 2250 THEN 8
      WHEN next_xp >= 1700 THEN 7 WHEN next_xp >= 1250 THEN 6
      WHEN next_xp >= 850 THEN 5 WHEN next_xp >= 500 THEN 4
      WHEN next_xp >= 250 THEN 3 WHEN next_xp >= 100 THEN 2 ELSE 1
    END;
  END IF;

  RETURN QUERY SELECT inserted_count = 1, next_xp::integer, next_level;
END;
$function$;

REVOKE ALL ON FUNCTION public.award_learner_xp(uuid, text, text, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.award_learner_xp(uuid, text, text, integer, integer)
  TO service_role;

COMMENT ON FUNCTION public.award_learner_xp(uuid, text, text, integer, integer) IS
  'Atomically records a server-validated reward and increments canonical profile XP once.';
