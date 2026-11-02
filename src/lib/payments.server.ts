import { createHmac, timingSafeEqual } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { paymentAttemptSchema, paidTransactionSchema, paystackEventSchema, disputeSchema, disputeDeadline, type PaymentAttempt } from './payment-rules';
import { purchaseCredits } from './credits.server';

type Admin = SupabaseClient<Database>;
export function verifyPaymentSignature(body: string, signature: string | null, key: string) {
  if (!key || !signature || !/^[a-fA-F0-9]{128}$/.test(signature)) return false;
  const expected = createHmac('sha512', key).update(body, 'utf8').digest();
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'));
}
export const verifyPaystackWebhook = verifyPaymentSignature;
// Legacy Squad contract only. Route remains disabled until current signing input and event schema are verified.
export const verifySquadWebhook = verifyPaymentSignature;

export async function logPaymentAttempt(admin: Admin, request: Request, input: PaymentAttempt) {
  // Inputs must come from a future authenticated checkout with server-selected prices, not a browser payload.
  const order = paymentAttemptSchema.parse(input);
  if (!order.emailVerified || !order.termsAccepted || !order.privacyAccepted) {
    throw new Error('BLOCKED: email not verified or terms not accepted - cannot charge');
  }
  const { data, error } = await admin.from('payments').insert({
    user_id: order.userId, email: order.email, provider: order.provider, reference: order.reference,
    amount_kobo: order.amountKobo, currency: order.currency, expected_credits: order.credits,
    terms_version: order.termsVersion,
    ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim().slice(0, 128) || null,
    user_agent: request.headers.get('user-agent')?.slice(0, 1024) || null,
  }).select('id').single();
  if (error || !data) throw new Error('Payment attempt could not be registered.');
  return data.id;
}

export async function recordDispute(admin: Admin, provider: 'paystack' | 'squad', reference: string, eventId: string, type: 'chargeback' | 'fraud', providerDeadline?: Date) {
  const { data: payment, error } = await admin.from('payments').select('*').eq('provider', provider).eq('reference', reference).maybeSingle();
  if (error || !payment) throw new Error('Disputed payment not found.');
  const [ledger, history] = await Promise.all([
    admin.from('credit_ledger').select('*').eq('payment_id', payment.id).order('created_at'),
    admin.from('generation_evidence').select('*').eq('payment_id', payment.id).order('created_at'),
  ]);
  if (ledger.error || history.error) throw new Error('Dispute evidence could not be assembled.');
  const now = new Date();
  const { error: insertError } = await admin.from('disputes').insert({
    payment_id: payment.id, provider_event_id: `${provider}:${eventId}`, type,
    deadline_at: disputeDeadline(now, providerDeadline).toISOString(),
    evidence_bundle_json: { captured_at: now.toISOString(), deadline_basis: providerDeadline ? 'provider_and_internal_target' : 'internal_16_hour_target', payment, ledger: ledger.data, generations: history.data },
  });
  if (insertError && insertError.code !== '23505') throw new Error('Dispute could not be recorded.');
}

export async function handlePaystackWebhook(admin: Admin, raw: string) {
  const event = paystackEventSchema.parse(JSON.parse(raw));
  if (event.event === 'charge.success') {
    const transaction = paidTransactionSchema.parse(event.data);
    await purchaseCredits(admin, { provider: 'paystack', reference: transaction.reference, amount: transaction.amount, currency: transaction.currency, email: transaction.customer.email });
  } else if (event.event === 'charge.dispute.create') {
    const dispute = disputeSchema.parse(event.data);
    await recordDispute(admin, 'paystack', dispute.transaction.reference, String(dispute.id), 'chargeback');
  }
}