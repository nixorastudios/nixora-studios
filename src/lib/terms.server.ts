import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { TERMS_VERSION, TERMS_VALIDITY_MS } from './payment-rules';

type Admin = SupabaseClient<Database>;

// Single source of truth for terms acceptance. Checkout and credit delivery
// both depend on these records; never bypass them with client-side flags.
export async function acceptTerms(admin: Admin, userId: string, ip: string | null, userAgent: string | null) {
  const { error } = await admin.from('terms_acceptance').insert({
    user_id: userId,
    terms_version: TERMS_VERSION,
    privacy_version: TERMS_VERSION,
    refund_version: TERMS_VERSION,
    ip,
    user_agent: userAgent,
  });
  if (error) throw new Error('Terms acceptance could not be recorded.');
}

export async function hasAcceptedTerms(admin: Admin, userId: string): Promise<boolean> {
  const { data, error } = await admin
    .from('terms_acceptance')
    .select('accepted_at')
    .eq('user_id', userId)
    .order('accepted_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return false;
  const age = Date.now() - new Date(data.accepted_at).getTime();
  return Number.isFinite(age) && age >= 0 && age <= TERMS_VALIDITY_MS;
}
