import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type Admin = SupabaseClient<Database>;
// Only verified server handlers call these service-role-only transactions.
export async function purchaseCredits(admin: Admin, payment: { provider: string; reference: string; amount: number; currency: string; email: string }) {
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