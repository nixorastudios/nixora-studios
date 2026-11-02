import { describe, expect, it, vi } from 'vitest';
import { createHmac } from 'node:crypto';
import { disputeDeadline, paymentAttemptSchema, unusedCreditRefundEligible, FAILED_REFUND_HOURS } from '../lib/payment-rules';
import { handlePaystackWebhook, verifyPaystackWebhook, verifySquadWebhook } from '../lib/payments.server';
import { autoRefundFailed, purchaseCredits, useCredit } from '../lib/credits.server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../integrations/supabase/types';

function mockedAdmin() {
  const rpc = vi.fn().mockResolvedValue({ data: 1, error: null });
  return { rpc, admin: { rpc } as unknown as SupabaseClient<Database> };
}
describe('payment and dispute safeguards', () => {
  const key = 'synthetic-webhook-test-fixture';
  const raw = '{ "event": "charge.success" }';
  const signed = createHmac('sha512', key).update(raw).digest('hex');
  it('verifies the exact body and rejects forged or missing signatures', () => {
    expect(verifyPaystackWebhook(raw, signed, key)).toBe(true);
    expect(verifyPaystackWebhook(JSON.stringify(JSON.parse(raw)), signed, key)).toBe(false);
    expect(verifyPaystackWebhook(raw, '0'.repeat(128), key)).toBe(false);
    expect(verifyPaystackWebhook(raw, null, key)).toBe(false);
    expect(verifySquadWebhook(raw, 'malformed', key)).toBe(false);
  });
  it('sets an internal 16-hour dispute target and honors an earlier provider deadline', () => {
    const now = new Date('2026-11-02T08:00:00Z');
    expect(disputeDeadline(now).toISOString()).toBe('2026-11-03T00:00:00.000Z');
    expect(disputeDeadline(now, new Date('2026-11-02T12:00:00Z')).toISOString()).toBe('2026-11-02T12:00:00.000Z');
  });
  it('limits unused-credit refund eligibility to seven days', () => {
    const purchased = new Date('2026-11-02T08:00:00Z');
    expect(unusedCreditRefundEligible(purchased, new Date('2026-11-09T08:00:00Z'))).toBe(true);
    expect(unusedCreditRefundEligible(purchased, new Date('2026-11-09T08:00:01Z'))).toBe(false);
    expect(unusedCreditRefundEligible(purchased, new Date('2026-11-01T08:00:00Z'))).toBe(false);
  });
  it('defines the 24-hour failed-credit restoration requirement', () => {
    expect(FAILED_REFUND_HOURS).toBe(24);
  });
  it('rejects invalid amounts and normalizes order emails', () => {
    const valid = { userId: '11111111-1111-4111-8111-111111111111', email: ' Creator@Example.com ', provider: 'paystack', reference: 'order_123456', amountKobo: 500000, currency: 'NGN', credits: 100 };
    expect(paymentAttemptSchema.parse(valid).email).toBe('creator@example.com');
    expect(paymentAttemptSchema.safeParse({ ...valid, amountKobo: -1 }).success).toBe(false);
  });
  it('ignores non-success events and rejects invalid successful transactions before granting credits', async () => {
    const { rpc, admin } = mockedAdmin();
    await handlePaystackWebhook(admin, JSON.stringify({ event: 'charge.failed', data: {} }));
    await expect(handlePaystackWebhook(admin, JSON.stringify({ event: 'charge.success', data: { amount: -1 } }))).rejects.toThrow();
    expect(rpc).not.toHaveBeenCalled();
  });
  it('passes verified commercial terms to a single atomic purchase operation', async () => {
    const { rpc, admin } = mockedAdmin();
    await purchaseCredits(admin, { provider: 'paystack', reference: 'order_123456', amount: 500000, currency: 'NGN', email: 'CREATOR@example.com' });
    expect(rpc).toHaveBeenCalledExactlyOnceWith('purchase_credits', { p_provider: 'paystack', p_reference: 'order_123456', p_amount: 500000, p_currency: 'NGN', p_email: 'creator@example.com' });
  });
  it('ties a one-credit deduction to owner, payment and job', async () => {
    const { rpc, admin } = mockedAdmin();
    await useCredit(admin, 'owner', 'payment', 'job');
    expect(rpc).toHaveBeenCalledExactlyOnceWith('use_credit', { p_user_id: 'owner', p_payment_id: 'payment', p_job_id: 'job' });
  });
  it('uses the idempotent failed-refund transaction and propagates errors', async () => {
    const { rpc, admin } = mockedAdmin();
    await autoRefundFailed(admin);
    expect(rpc).toHaveBeenCalledExactlyOnceWith('auto_refund_failed');
    rpc.mockResolvedValueOnce({ data: null, error: { message: 'database failure' } });
    await expect(autoRefundFailed(admin)).rejects.toThrow('could not complete');
  });
});