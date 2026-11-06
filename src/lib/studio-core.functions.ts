import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
import { checkoutInput, getStudioProduct, PRICING_VERSION, ENGINE_CREDIT_COSTS, protectedValueUntil } from './studio-core';

export const publicWaitlistTotal = createServerFn({ method: 'GET' }).handler(async () => {
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error('Waitlist total unavailable.');
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
    headers.set('apikey', key);
    return fetch(input, { ...init, headers });
  } } });
  const { data, error } = await client.rpc('public_waitlist_total');
  if (error || typeof data !== 'number') throw new Error('Waitlist total unavailable.');
  return data;
});

export const loadStudioDashboard = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { supabase, userId } = context;
  // The credit tables are server-only. Authenticate first, then explicitly scope every privileged read.
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const results = await Promise.all([
    supabase.from('code_engine_projects').select('id,name,profession,updated_at').eq('user_id', userId).order('updated_at', { ascending: false }).limit(50),
    supabase.from('studio_video_jobs').select('id,prompt,status,created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
    supabaseAdmin.from('credit_balances').select('balance').eq('user_id', userId).maybeSingle(),
    supabase.from('studio_uploads').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100),
    supabase.from('studio_subscriptions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
    supabase.rpc('has_role', { _user_id: userId, _role: 'owner' }),
  ]);
  for (const r of results) if (r.error) throw new Error('Your studio could not be loaded.');
  const [projects, videos, balance, uploads, subscriptions, owner] = results;
  return { projects: projects.data ?? [], videos: videos.data ?? [], balance: balance.data?.balance ?? 0, uploads: uploads.data ?? [], subscriptions: subscriptions.data ?? [], isOwner: owner.data === true };
});

export const loadStudioAdmin = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(v => z.object({ page: z.number().int().min(1).max(10000).default(1) }).parse(v)).handler(async ({ data, context }) => {
  const { data: owner, error } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'owner' });
  if (error || owner !== true) throw new Error('Owner access required.');
  const { supabaseAdmin: admin } = await import('@/integrations/supabase/client.server');
  const offset = (data.page - 1) * 20;
  const [users, projects, payments, waitlist, videos] = await Promise.all([
    admin.auth.admin.listUsers({ page: data.page, perPage: 20 }),
    admin.from('code_engine_projects').select('id,name,user_id,updated_at', { count: 'exact' }).order('updated_at', { ascending: false }).range(offset, offset + 19),
    admin.from('payments').select('id,user_id,amount_kobo,status,reference,provider,created_at', { count: 'exact' }).order('created_at', { ascending: false }).range(offset, offset + 19),
    admin.from('waitlist_signups').select('id', { count: 'exact', head: true }),
    admin.from('studio_video_jobs').select('id', { count: 'exact', head: true }),
  ]);
  for (const r of [users, projects, payments, waitlist, videos]) if (r.error) throw new Error('Owner overview unavailable.');
  const totalUsers = 'total' in users.data ? Number(users.data.total) : null;
  return { users: users.data.users.map(u => ({ id: u.id, email: u.email ?? '', verified: Boolean(u.email_confirmed_at), createdAt: u.created_at })), totalUsers, projects: projects.data ?? [], totalProjects: (projects.count ?? 0) + (videos.count ?? 0), payments: payments.data ?? [], totalPayments: payments.count ?? 0, waitlist: waitlist.count ?? 0,
    providers: { squad: { configured: Boolean(process.env['SQUAD_SECRET_KEY']), ready: false, reason: 'Current recurring billing, webhook and *737# contracts still require verification.' }, paystack: { configured: Boolean(process.env['PAYSTACK_SECRET_KEY']), ready: Boolean(process.env['PAYSTACK_SECRET_KEY']?.startsWith('sk_test_')) } } };
});

export const startStudioCheckout = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(v => checkoutInput.parse(v)).handler(async ({ data, context }) => {
  const product = getStudioProduct(data.product);
  if (data.provider === 'squad') throw new Error('Squad test checkout is awaiting verified merchant API configuration. No payment was started.');
  const key = process.env['PAYSTACK_SECRET_KEY'];
  if (!key?.startsWith('sk_test_')) throw new Error('A genuine Paystack test secret is required. Live payments are disabled.');
  if (product.kind === 'subscription') throw new Error('Recurring billing is awaiting verified provider setup. No payment was started.');
  const { data: auth, error: authError } = await context.supabase.auth.getUser();
  const user = auth.user;
  if (authError || !user?.email || !user.email_confirmed_at) throw new Error('Verify your account email before checkout.');
  const { supabaseAdmin: admin } = await import('@/integrations/supabase/client.server');
  const { hasAcceptedTerms } = await import('./terms.server');
  if (!(await hasAcceptedTerms(admin, context.userId))) throw new Error('Accept the terms before checkout.');
  const { logPaymentAttempt } = await import('./payments.server');
  const { TERMS_VERSION } = await import('./payment-rules');
  const request = getRequest();
  const reference = `nixora_${crypto.randomUUID().replaceAll('-', '')}`;
  const id = await logPaymentAttempt(admin, request, { userId: context.userId, email: user.email, provider: 'paystack', reference, amountKobo: product.naira * 100, currency: 'NGN', credits: product.credits, termsAccepted: true, privacyAccepted: true, emailVerified: true, termsVersion: TERMS_VERSION });
  const { error: snapshotError } = await admin.from('payments').update({ product_code: product.code, pricing_version: PRICING_VERSION, credit_value_snapshot: ENGINE_CREDIT_COSTS, value_protected_until: protectedValueUntil(new Date()).toISOString() }).eq('id', id).eq('user_id', context.userId);
  if (snapshotError) throw new Error('Your order could not be prepared. No payment was started.');
  const origin = new URL(request.url).origin;
  const response = await fetch('https://api.paystack.co/transaction/initialize', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, amount: product.naira * 100, currency: 'NGN', reference, callback_url: `${origin}/checkout?reference=${reference}` }) });
  const text = await response.text();
  if (!response.ok) { console.error(`Paystack initialize [${response.status}]: ${text}`); throw new Error(`Paystack [${response.status}]: ${text}`); }
  const result = JSON.parse(text) as { status: boolean; message?: string; data?: { authorization_url?: string } };
  if (!result.status || !result.data?.authorization_url) throw new Error(result.message ?? 'Paystack could not start checkout.');
  const redirect = new URL(result.data.authorization_url);
  if (redirect.protocol !== 'https:' || redirect.hostname !== 'checkout.paystack.com') throw new Error('Unexpected payment destination.');
  return { url: redirect.href };
});

export const verifyStudioCheckout = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(v => z.object({ reference: z.string().regex(/^nixora_[a-f0-9]{32}$/) }).parse(v)).handler(async ({ data, context }) => {
  const key = process.env['PAYSTACK_SECRET_KEY'];
  if (!key?.startsWith('sk_test_')) throw new Error('Paystack test verification is not configured.');
  const { supabaseAdmin: admin } = await import('@/integrations/supabase/client.server');
  const { data: order, error } = await admin.from('payments').select('id').eq('user_id', context.userId).eq('provider', 'paystack').eq('reference', data.reference).maybeSingle();
  if (error || !order) throw new Error('Payment not found for this account.');
  const response = await fetch(`https://api.paystack.co/transaction/verify/${data.reference}`, { headers: { Authorization: `Bearer ${key}` } });
  const text = await response.text();
  if (!response.ok) { console.error(`Paystack verify [${response.status}]: ${text}`); throw new Error(`Paystack [${response.status}]: ${text}`); }
  const result = JSON.parse(text);
  if (!result.status || result.data?.status !== 'success') return { paid: false };
  const { paidTransactionSchema } = await import('./payment-rules');
  const transaction = paidTransactionSchema.parse(result.data);
  if (transaction.reference !== data.reference) throw new Error('Payment reference mismatch.');
  const { purchaseCredits } = await import('./credits.server');
  await purchaseCredits(admin, { provider: 'paystack', reference: transaction.reference, amount: transaction.amount, currency: transaction.currency, email: transaction.customer.email });
  return { paid: true };
});