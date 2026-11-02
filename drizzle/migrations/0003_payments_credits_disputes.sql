CREATE TABLE public.payments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, email text NOT NULL,
 provider text NOT NULL CHECK (provider IN ('paystack','squad','stripe')), reference text NOT NULL,
 amount_kobo bigint NOT NULL CHECK (amount_kobo > 0), currency text NOT NULL DEFAULT 'NGN',
 expected_credits integer NOT NULL CHECK (expected_credits > 0), status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','failed','reversed')),
 ip text, user_agent text, created_at timestamptz NOT NULL DEFAULT now(), credit_delivered_at timestamptz,
 UNIQUE(provider,reference)
);
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.credit_balances (user_id uuid PRIMARY KEY, balance bigint NOT NULL DEFAULT 0 CHECK(balance >= 0), updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.credit_balances TO service_role;
ALTER TABLE public.credit_balances ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.credit_ledger (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, payment_id uuid NOT NULL REFERENCES public.payments(id),
 job_id uuid REFERENCES public.studio_video_jobs(id), type text NOT NULL CHECK(type IN ('purchase','use','refund','reversal')),
 credits bigint NOT NULL, balance_after bigint NOT NULL CHECK(balance_after >= 0), metadata jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.credit_ledger TO service_role;
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX credit_purchase_once ON public.credit_ledger(payment_id) WHERE type='purchase';
CREATE UNIQUE INDEX credit_use_once ON public.credit_ledger(job_id) WHERE type='use';
CREATE UNIQUE INDEX credit_failed_refund_once ON public.credit_ledger(job_id) WHERE type='refund';
CREATE TABLE public.generation_evidence (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, payment_id uuid NOT NULL REFERENCES public.payments(id),
 job_id uuid NOT NULL UNIQUE REFERENCES public.studio_video_jobs(id), prompt_hash text NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','success','failed')), credits_used integer NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz, failed_at timestamptz, refunded_at timestamptz
);
GRANT ALL ON public.generation_evidence TO service_role;
ALTER TABLE public.generation_evidence ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.disputes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), payment_id uuid NOT NULL REFERENCES public.payments(id),
 provider_event_id text NOT NULL UNIQUE, type text NOT NULL CHECK(type IN ('chargeback','fraud')),
 deadline_at timestamptz NOT NULL, status text NOT NULL DEFAULT 'open', evidence_bundle_json jsonb NOT NULL DEFAULT '{}',
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.disputes TO service_role;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.purchase_credits(p_provider text,p_reference text,p_amount bigint,p_currency text,p_email text) RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p public.payments; b bigint;
BEGIN
 SELECT * INTO p FROM public.payments WHERE provider=p_provider AND reference=p_reference FOR UPDATE;
 IF NOT FOUND OR p.amount_kobo<>p_amount OR p.currency<>p_currency OR lower(p.email)<>lower(p_email) THEN RAISE EXCEPTION 'Payment verification mismatch'; END IF;
 INSERT INTO public.credit_balances(user_id) VALUES(p.user_id) ON CONFLICT DO NOTHING;
 SELECT balance INTO b FROM public.credit_balances WHERE user_id=p.user_id FOR UPDATE;
 IF p.status='success' THEN RETURN b; END IF;
 IF p.status<>'pending' THEN RAISE EXCEPTION 'Payment not pending'; END IF;
 b:=b+p.expected_credits;
 UPDATE public.payments SET status='success',credit_delivered_at=now() WHERE id=p.id;
 INSERT INTO public.credit_ledger(user_id,payment_id,type,credits,balance_after) VALUES(p.user_id,p.id,'purchase',p.expected_credits,b);
 UPDATE public.credit_balances SET balance=b,updated_at=now() WHERE user_id=p.user_id;
 RETURN b;
END $$;
REVOKE ALL ON FUNCTION public.purchase_credits(text,text,bigint,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.purchase_credits(text,text,bigint,text,text) TO service_role;
CREATE FUNCTION public.use_credit(p_user_id uuid,p_payment_id uuid,p_job_id uuid) RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p public.payments; j public.studio_video_jobs; b bigint; available bigint;
BEGIN
 SELECT * INTO p FROM public.payments WHERE id=p_payment_id AND user_id=p_user_id AND status='success' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Payment not owned or delivered'; END IF;
 SELECT balance INTO b FROM public.credit_balances WHERE user_id=p_user_id FOR UPDATE;
 SELECT * INTO j FROM public.studio_video_jobs WHERE id=p_job_id AND user_id=p_user_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Generation not owned'; END IF;
 IF EXISTS(SELECT 1 FROM public.credit_ledger WHERE job_id=p_job_id AND type='use') THEN RETURN b; END IF;
 IF j.status NOT IN ('submitting','queued','in_progress') THEN RAISE EXCEPTION 'Generation not active'; END IF;
 SELECT coalesce(sum(credits),0) INTO available FROM public.credit_ledger WHERE payment_id=p_payment_id;
 IF b IS NULL OR b<1 OR available<1 THEN RAISE EXCEPTION 'Insufficient credits'; END IF;
 b:=b-1;
 INSERT INTO public.credit_ledger(user_id,payment_id,job_id,type,credits,balance_after) VALUES(p_user_id,p_payment_id,p_job_id,'use',-1,b);
 INSERT INTO public.generation_evidence(user_id,payment_id,job_id,prompt_hash) VALUES(p_user_id,p_payment_id,p_job_id,encode(sha256(convert_to(j.prompt,'UTF8')),'hex'));
 UPDATE public.credit_balances SET balance=b,updated_at=now() WHERE user_id=p_user_id;
 RETURN b;
END $$;
REVOKE ALL ON FUNCTION public.use_credit(uuid,uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.use_credit(uuid,uuid,uuid) TO service_role;
CREATE FUNCTION public.capture_generation_outcome() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.status='failed' THEN UPDATE public.generation_evidence SET status='failed',failed_at=coalesce(failed_at,now()) WHERE job_id=NEW.id;
 ELSIF NEW.status='completed' AND NEW.storage_path IS NOT NULL THEN UPDATE public.generation_evidence SET status='success',completed_at=coalesce(completed_at,now()) WHERE job_id=NEW.id;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER capture_credit_generation_outcome AFTER UPDATE OF status,storage_path ON public.studio_video_jobs FOR EACH ROW EXECUTE FUNCTION public.capture_generation_outcome();
CREATE FUNCTION public.auto_refund_failed() RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE e record; b bigint; n integer:=0;
BEGIN
 FOR e IN SELECT ge.* FROM public.generation_evidence ge JOIN public.studio_video_jobs j ON j.id=ge.job_id WHERE j.status='failed' AND ge.refunded_at IS NULL ORDER BY ge.user_id,ge.created_at LIMIT 500 LOOP
 SELECT balance INTO b FROM public.credit_balances WHERE user_id=e.user_id FOR UPDATE;
 PERFORM 1 FROM public.studio_video_jobs WHERE id=e.job_id AND status='failed' FOR UPDATE;
 IF NOT FOUND THEN CONTINUE; END IF;
 IF b IS NULL OR EXISTS(SELECT 1 FROM public.credit_ledger WHERE job_id=e.job_id AND type='refund') THEN CONTINUE; END IF;
 b:=b+e.credits_used;
 INSERT INTO public.credit_ledger(user_id,payment_id,job_id,type,credits,balance_after,metadata) VALUES(e.user_id,e.payment_id,e.job_id,'refund',e.credits_used,b,'{"reason":"failed_generation"}');
 UPDATE public.credit_balances SET balance=b,updated_at=now() WHERE user_id=e.user_id;
 UPDATE public.generation_evidence SET status='failed',failed_at=coalesce(failed_at,now()),refunded_at=now() WHERE id=e.id;
 n:=n+1;
 END LOOP;
 RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.auto_refund_failed() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.auto_refund_failed() TO service_role;