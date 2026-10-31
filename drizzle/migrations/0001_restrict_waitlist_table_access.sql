REVOKE ALL ON TABLE public.waitlist_signups FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.waitlist_signups TO service_role;