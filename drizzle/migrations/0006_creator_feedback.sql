CREATE TABLE public.creator_feedback (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid,
 prompt text NOT NULL,
 style_used text NOT NULL,
 feedback text NOT NULL CHECK (feedback IN ('up','down')),
 preference text,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.creator_feedback TO service_role;
ALTER TABLE public.creator_feedback ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.creator_feedback IS 'Private creator style feedback from the image engine; service-role insert only, never read back to browsers.';