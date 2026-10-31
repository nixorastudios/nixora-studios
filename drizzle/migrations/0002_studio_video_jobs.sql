CREATE TABLE public.studio_video_jobs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 gateway_id text UNIQUE,
 prompt text NOT NULL,
 settings jsonb NOT NULL,
 status text NOT NULL DEFAULT 'submitting',
 progress integer NOT NULL DEFAULT 0,
 storage_path text,
 error_message text,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.studio_video_jobs TO authenticated;
GRANT ALL ON public.studio_video_jobs TO service_role;
ALTER TABLE public.studio_video_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own video jobs" ON public.studio_video_jobs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE UNIQUE INDEX studio_one_active_video ON public.studio_video_jobs ((true)) WHERE status IN ('submitting','queued','in_progress');
CREATE TABLE public.studio_video_service_state (
 id text PRIMARY KEY,
 blocked boolean NOT NULL DEFAULT false,
 message text,
 status_code integer,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.studio_video_service_state TO service_role;
ALTER TABLE public.studio_video_service_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own studio videos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'studio-videos' AND (storage.foldername(name))[1] = auth.uid()::text);