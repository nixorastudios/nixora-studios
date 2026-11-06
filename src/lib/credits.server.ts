import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { TERMS_VALIDITY_MS } from './payment-rules';

type Admin = SupabaseClient<Database>;
// Only verified server handlers call these service-role-only transactions.
// No credits are delivered unless the buyer accepted the terms within the last
// 365 days and has a verified email — this is the single enforcement point.
export async function purchaseCredits(admin: Admin, payment: { provider: string; reference: string; amount: number; currency: string; email: string }) {
  const { data: order, error: orderError } = await admin
    .from('payments')
    .select('user_id')
    .eq('provider', payment.provider)
    .eq('reference', payment.reference)
    .maybeSingle();
  if (orderError || !order) throw new Error('Payment could not be reconciled against its registered order.');
  const { data: acceptance } = await admin
    .from('terms_acceptance')
    .select('accepted_at')
    .eq('user_id', order.user_id)
    .order('accepted_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const age = acceptance ? Date.now() - new Date(acceptance.accepted_at).getTime() : NaN;
  const fresh = Number.isFinite(age) && age >= 0 && age <= TERMS_VALIDITY_MS;
  if (!fresh) throw new Error('Terms not accepted');
  const { data: userData, error: userError } = await admin.auth.admin.getUserById(order.user_id);
  if (userError || !userData.user?.email_confirmed_at) throw new Error('Email not verified');
  const { data, error } = await admin.rpc('purchase_credits', {
    p_provider: payment.provider, p_reference: payment.reference, p_amount: payment.amount,
    p_currency: payment.currency, p_email: payment.email.toLowerCase(),
  });
  if (error) throw new Error('Payment could not be reconciled against its registered order.');
  return data;
}
export async function useCredit(admin: Admin, userId: string, paymentId: string, jobId: string) {
  const { data, error } = await admin.rpc('use_credit', { p_user_id: userId, p_payment_id: paymentId, p_job_id: jobId });
  if (error) throw new Error('Credit could not be reserved for this generation.');
  return data;
}
export async function autoRefundFailed(admin: Admin) {
  const { data, error } = await admin.rpc('auto_refund_failed');
  if (error) throw new Error('Failed-credit reconciliation could not complete.');
  return data;
}