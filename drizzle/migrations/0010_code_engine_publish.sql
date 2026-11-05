ALTER TABLE public.code_engine_projects ADD COLUMN publish_slug text;
ALTER TABLE public.code_engine_projects ADD COLUMN published_at timestamptz;
CREATE UNIQUE INDEX code_engine_projects_publish_slug_key ON public.code_engine_projects (publish_slug) WHERE publish_slug IS NOT NULL;