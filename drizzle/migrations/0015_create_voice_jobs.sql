CREATE TABLE public.voice_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  script text NOT NULL,
  voice text NOT NULL,
  speed numeric NOT NULL DEFAULT 1,
  pitch numeric NOT NULL DEFAULT 1,
  provider text NOT NULL DEFAULT 'browser',
  storage_path text,
  status text NOT NULL DEFAULT 'saved',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.voice_jobs TO authenticated;
GRANT ALL ON public.voice_jobs TO service_role;
ALTER TABLE public.voice_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own voice jobs read" ON public.voice_jobs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Own voice jobs create" ON public.voice_jobs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND length(script) <= 5000);
CREATE POLICY "Own voice jobs delete" ON public.voice_jobs FOR DELETE TO authenticated USING (user_id = auth.uid());