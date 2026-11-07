import { describe, expect, it } from 'vitest';
import { hasVerifiedEmail, isEmailUnconfirmed, VERIFICATION_REDIRECT_URL } from '@/lib/email-verification';

describe('email verification access', () => {
  it('returns signup and resend verification to the production domain callback', () => {
    expect(VERIFICATION_REDIRECT_URL).toBe('https://nixorastudios.com/auth/callback');
  });
  it('blocks test3@nixora.com before the confirmation link is clicked', () => {
    expect(hasVerifiedEmail({ email: 'test3@nixora.com', email_confirmed_at: null })).toBe(false);
  });
  it('allows email-confirmed accounts only', () => {
    expect(hasVerifiedEmail({ email: 'test3@nixora.com', email_confirmed_at: '2026-11-07T09:07:00Z' })).toBe(true);
    expect(hasVerifiedEmail(null)).toBe(false);
  });
  it('offers verification recovery only for an unconfirmed-email error', () => {
    expect(isEmailUnconfirmed({ code: 'email_not_confirmed', message: 'Email not confirmed' })).toBe(true);
    expect(isEmailUnconfirmed({ code: 'invalid_credentials', message: 'Invalid login credentials' })).toBe(false);
  });
});