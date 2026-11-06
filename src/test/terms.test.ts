import { describe, expect, it, vi } from 'vitest';
import { purchaseCredits } from '../lib/credits.server';
import { hasAcceptedTerms } from '../lib/terms.server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../integrations/supabase/types';

type MockOptions = {
  acceptedAt?: string | null;
  emailConfirmedAt?: string | null;
};

function mockedAdmin({ acceptedAt = new Date().toISOString(), emailConfirmedAt = '2026-11-01T00:00:00Z' }: MockOptions = {}) {
  const rpc = vi.fn().mockResolvedValue({ data: 1, error: null });
  const from = vi.fn((table: string) => {
    if (table === 'payments') {
      return { select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: { user_id: 'u1' }, error: null }) }) }) }) };
    }
    return {
      select: () => ({
        eq: () => ({
          order: () => ({ limit: () => ({ maybeSingle: () => Promise.resolve({ data: acceptedAt ? { accepted_at: acceptedAt } : null, error: null }) }) }),
        }),
      }),
    };
  });
  const auth = { admin: { getUserById: vi.fn().mockResolvedValue({ data: { user: { email_confirmed_at: emailConfirmedAt } }, error: null }) } };
  return { rpc, admin: { rpc, from, auth } as unknown as SupabaseClient<Database> };
}

const paid = { provider: 'paystack', reference: 'order_123456', amount: 500000, currency: 'NGN', email: 'creator@example.com' };

describe('terms enforcement on credit delivery', () => {
  it('rejects future-dated acceptance', async () => {
    const { rpc, admin } = mockedAdmin({ acceptedAt: '2099-01-01T00:00:00Z' });
    await expect(purchaseCredits(admin, paid)).rejects.toThrow('Terms not accepted');
    expect(rpc).not.toHaveBeenCalled();
    await expect(hasAcceptedTerms(admin, 'u1')).resolves.toBe(false);
  });
  it('blocks credit delivery when the buyer never accepted terms', async () => {
    const { rpc, admin } = mockedAdmin({ acceptedAt: null });
    await expect(purchaseCredits(admin, paid)).rejects.toThrow('Terms not accepted');
    expect(rpc).not.toHaveBeenCalled();
  });
  it('blocks credit delivery when acceptance is older than 365 days', async () => {
    const { rpc, admin } = mockedAdmin({ acceptedAt: '2025-10-01T00:00:00Z' });
    await expect(purchaseCredits(admin, paid)).rejects.toThrow('Terms not accepted');
    expect(rpc).not.toHaveBeenCalled();
  });
  it('blocks credit delivery when the email is not verified', async () => {
    const { rpc, admin } = mockedAdmin({ emailConfirmedAt: null });
    await expect(purchaseCredits(admin, paid)).rejects.toThrow('Email not verified');
    expect(rpc).not.toHaveBeenCalled();
  });
  it('delivers credits only after fresh acceptance and a verified email', async () => {
    const { rpc, admin } = mockedAdmin();
    await purchaseCredits(admin, paid);
    expect(rpc).toHaveBeenCalledExactlyOnceWith('purchase_credits', { p_provider: 'paystack', p_reference: 'order_123456', p_amount: 500000, p_currency: 'NGN', p_email: 'creator@example.com' });
  });
  it('hasAcceptedTerms is false without a record and true with a fresh one', async () => {
    const { admin: without } = mockedAdmin({ acceptedAt: null });
    await expect(hasAcceptedTerms(without, 'u1')).resolves.toBe(false);
    const { admin: withFresh } = mockedAdmin();
    await expect(hasAcceptedTerms(withFresh, 'u1')).resolves.toBe(true);
  });
});
