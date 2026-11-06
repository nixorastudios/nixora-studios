ALTER TABLE public.waitlist_signups DROP CONSTRAINT waitlist_signups_source_check;
ALTER TABLE public.waitlist_signups ADD CONSTRAINT waitlist_signups_source_check CHECK (source = ANY (ARRAY['early-access','prompt-board','pricing-checkout']));
ALTER TABLE public.waitlist_signups ADD CONSTRAINT waitlist_signups_plan_check CHECK (plan_code IS NULL OR plan_code = ANY (ARRAY['pro','ultra','business','small','medium','large']));
ALTER TABLE public.waitlist_signups ADD CONSTRAINT waitlist_signups_name_check CHECK (name IS NULL OR char_length(name) <= 120);