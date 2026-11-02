CREATE TABLE public.cookie_consent (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid,
 essential boolean NOT NULL DEFAULT true,
 analytics boolean NOT NULL DEFAULT false,
 marketing boolean NOT NULL DEFAULT false,
 ip text,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.cookie_consent TO service_role;
ALTER TABLE public.cookie_consent ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.cookie_consent IS 'Reserved for future opt-in consent records; unused while site is essential-only.';