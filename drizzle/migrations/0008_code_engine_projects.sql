CREATE TABLE public.code_engine_projects (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
 name text NOT NULL DEFAULT 'Untitled project', profession text NOT NULL DEFAULT 'Developer', idea text NOT NULL DEFAULT '',
 plan jsonb, approved boolean NOT NULL DEFAULT false, files jsonb NOT NULL DEFAULT '[]',
 updated_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.code_engine_projects TO authenticated;
GRANT ALL ON public.code_engine_projects TO service_role;
ALTER TABLE public.code_engine_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own code projects" ON public.code_engine_projects FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Create own code projects" ON public.code_engine_projects FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Update own code projects" ON public.code_engine_projects FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Delete own code projects" ON public.code_engine_projects FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE TABLE public.code_engine_versions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES public.code_engine_projects(id) ON DELETE CASCADE,
 user_id uuid NOT NULL, files jsonb NOT NULL, summary text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.code_engine_versions TO authenticated;
GRANT ALL ON public.code_engine_versions TO service_role;
ALTER TABLE public.code_engine_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own code versions" ON public.code_engine_versions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE TABLE public.code_engine_ai_blocks (
 user_id uuid PRIMARY KEY, reason text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.code_engine_ai_blocks TO service_role;
ALTER TABLE public.code_engine_ai_blocks ENABLE ROW LEVEL SECURITY;