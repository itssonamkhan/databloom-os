-- Content articles are stored separately from learner and analytics data.
-- Public clients may read only published rows; owner mutations will be handled
-- later by protected server routes using the existing server-only service role.
CREATE TABLE public.content_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL,
  seo_title text,
  meta_description text,
  target_keyword text,
  status text NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  internal_links jsonb NOT NULL DEFAULT '[]'::jsonb,

  CONSTRAINT content_articles_status_check
    CHECK (status IN ('draft', 'published', 'archived')),
  CONSTRAINT content_articles_slug_check
    CHECK (
      char_length(slug) BETWEEN 1 AND 200
      AND slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    ),
  CONSTRAINT content_articles_published_at_check
    CHECK (status <> 'published' OR published_at IS NOT NULL),
  CONSTRAINT content_articles_internal_links_check
    CHECK (jsonb_typeof(internal_links) = 'array')
);

CREATE INDEX content_articles_published_idx
  ON public.content_articles (published_at DESC)
  WHERE status = 'published';

CREATE OR REPLACE FUNCTION public.set_content_articles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE TRIGGER content_articles_set_updated_at
  BEFORE UPDATE ON public.content_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_content_articles_updated_at();

-- Force RLS so even table owners cannot accidentally bypass the policy model
-- through ordinary client access. No write policies are defined here, so
-- anon/authenticated inserts, updates, and deletes are denied by default.
ALTER TABLE public.content_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_articles FORCE ROW LEVEL SECURITY;

REVOKE INSERT, UPDATE, DELETE
  ON TABLE public.content_articles
  FROM PUBLIC, anon, authenticated;
GRANT SELECT
  ON TABLE public.content_articles
  TO anon, authenticated;

-- Both anonymous and authenticated public readers may see published content
-- only. Draft and archived content remain unavailable to browser clients.
CREATE POLICY content_articles_public_read
  ON public.content_articles
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');
