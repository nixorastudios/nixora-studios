import { afterAll, describe, expect, it } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../integrations/supabase/types';
import { purchaseCredits, useCredit, autoRefundFailed } from '../lib/credits.server';

const url = process.env['SUPABASE_URL'];
const key = process.env['SUPABASE_SERVICE_ROLE_KEY'];
const client = url && key ? createClient<Database>(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
    headers.set('apikey', key);
    return fetch(input, { ...init, headers });
  } },
}) : undefined;
let userId: string | undefined;
let paymentId: string | undefined;
let jobId: string | undefined;

afterAll(async () => {
  if (!client) return;
  if (paymentId) {
    await client.from('disputes').delete().eq('payment_id', paymentId);
    await client.from('generation_evidence').delete().eq('payment_id', paymentId);
    await client.from('credit_ledger').delete().eq('payment_id', paymentId);
    await client.from('payments').delete().eq('id', paymentId);
  }
  if (jobId) await client.from('studio_video_jobs').delete().eq('id', jobId);
  if (userId) {
    await client.from('terms_acceptance').delete().eq('user_id', uid);
    await client.from('credit_balances').delete().eq('user_id', uid);
    await client.auth.admin.deleteUser(userId);
  }
});

describe.skipIf(!client)('real database credit invariants (isolated fixtures, no provider calls)', () => {
  it('fulfills once, debits one credit once, rejects cross-user use, and refunds an older failed job once', async () => {
    if (!client) throw new Error('Integration configuration missing');
    const created = await client.auth.admin.createUser({ email: `audit-fixture-${crypto.randomUUID()}@example.invalid`, password: crypto.randomUUID(), email_confirm: true });
    if (created.error || !created.data.user) throw new Error('Test user creation failed');
    userId = created.data.user.id;
    const uid = userId;
    const terms = await client.from('terms_acceptance').insert({ user_id: uid });
    if (terms.error) throw new Error('Test terms acceptance insert failed');
    const reference = `audit_test_${crypto.randomUUID()}`;
    const inserted = await client.from('payments').insert({ user_id: uid, email: 'audit-fixture@example.invalid', provider: 'paystack', reference, amount_kobo: 500000, expected_credits: 100 }).select('id').single();
    if (inserted.error || !inserted.data) throw new Error('Test order insert failed');
    paymentId = inserted.data.id;
    const paid = { provider: 'paystack', reference, amount: 500000, currency: 'NGN', email: 'audit-fixture@example.invalid' };
    await expect(purchaseCredits(client, { ...paid, amount: 1 })).rejects.toThrow();
    await Promise.all([purchaseCredits(client, paid), purchaseCredits(client, paid)]);
    const delivered = await client.from('payments').select('credit_delivered_at').eq('id', paymentId).single();
    expect(delivered.data?.credit_delivered_at).toBeTruthy();
    const job = await client.from('studio_video_jobs').insert({ user_id: uid, prompt: 'Synthetic credit test, not submitted to AI.', settings: {}, status: 'failed' }).select('id').single();
    if (job.error || !job.data) throw new Error('Test generation insert failed');
    jobId = job.data.id;
    // queued would occupy the project's one-active-job slot; reserve and release only within this test.
    const active = await client.from('studio_video_jobs').update({ status: 'queued' }).eq('id', jobId);
    if (active.error) throw new Error('Active workspace prevents integration fixture; no real job changed');
    await expect(useCredit(client, crypto.randomUUID(), paymentId, jobId)).rejects.toThrow();
    await Promise.all([useCredit(client, uid, paymentId, jobId), useCredit(client, uid, paymentId, jobId)]);
    let balance = await client.from('credit_balances').select('balance').eq('user_id', uid).single();
    expect(balance.data?.balance).toBe(99);
    await client.from('studio_video_jobs').update({ status: 'failed' }).eq('id', jobId);
    await client.from('generation_evidence').update({ failed_at: '2026-10-01T00:00:00Z' }).eq('job_id', jobId);
    await Promise.all([autoRefundFailed(client), autoRefundFailed(client)]);
    balance = await client.from('credit_balances').select('balance').eq('user_id', uid).single();
    expect(balance.data?.balance).toBe(100);
    const ledger = await client.from('credit_ledger').select('type,credits').eq('payment_id', paymentId);
    expect(ledger.data?.filter(row => row.type === 'purchase')).toHaveLength(1);
    expect(ledger.data?.filter(row => row.type === 'use')).toEqual([{ type: 'use', credits: -1 }]);
    expect(ledger.data?.filter(row => row.type === 'refund')).toEqual([{ type: 'refund', credits: 1 }]);
  }, 30000);
});