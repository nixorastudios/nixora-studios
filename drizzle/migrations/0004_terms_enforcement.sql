CREATE TABLE public.terms_acceptance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  terms_version text NOT NULL DEFAULT 'v1.0-Nov2026',
  privacy_version text NOT NULL DEFAULT 'v1.0-Nov2026',
  refund_version text NOT NULL DEFAULT 'v1.0-Nov2026',
  ip text,
  user_agent text,
  accepted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_terms_user ON public.terms_acceptance(user_id);
GRANT SELECT, INSERT ON public.terms_acceptance TO authenticated;
GRANT ALL ON public.terms_acceptance TO service_role;
ALTER TABLE public.terms_acceptance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own terms acceptance" ON public.terms_acceptance FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users record own terms acceptance" ON public.terms_acceptance FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
ALTER TABLE public.payments ADD COLUMN terms_version text;