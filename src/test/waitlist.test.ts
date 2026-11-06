import { describe, expect, it, vi } from 'vitest';
import { persistWaitlistSignup, waitlistSchema } from '@/lib/waitlist';

describe('Shared launch waitlist', () => {
  it('stores a normalized email in the database rather than browser storage', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    expect(await persistWaitlistSignup({ name: 'Ada Obi', email: ' Creator@Example.com ', source: 'early-access' }, insert)).toEqual({ ok: true, position: null });
    expect(insert).toHaveBeenCalledExactlyOnceWith({ name: 'Ada Obi', email: 'creator@example.com', source: 'early-access', name: null, plan_code: null });
  });
  it('supports the prompt-board signup without uploading the draft', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    await persistWaitlistSignup({ name: 'Ada Obi', email: 'creator@example.com', source: 'prompt-board' }, insert);
    expect(insert).toHaveBeenCalledExactlyOnceWith({ name: 'Ada Obi', email: 'creator@example.com', source: 'prompt-board', name: null, plan_code: null });
  });
  it('does not expose whether an address is already registered', async () => {
    const insert = vi.fn().mockResolvedValue({ error: { code: '23505' } });
    expect(await persistWaitlistSignup({ name: 'Ada Obi', email: 'creator@example.com', source: 'early-access' }, insert)).toEqual({ ok: true, position: null });
  });
  it('does not claim success if storing the email fails', async () => {
    const insert = vi.fn().mockResolvedValue({ error: { code: '42501' } });
    expect((await persistWaitlistSignup({ name: 'Ada Obi', email: 'creator@example.com', source: 'early-access' }, insert)).ok).toBe(false);
  });
  it('rejects invalid emails before any database write', async () => {
    const insert = vi.fn();
    await expect(persistWaitlistSignup({ name: 'Ada Obi', email: 'not-an-email', source: 'early-access' }, insert)).rejects.toThrow();
    expect(insert).not.toHaveBeenCalled();
  });
  it('rejects unexpected data and oversize input', () => {
    expect(waitlistSchema.safeParse({ name: 'Ada Obi', email: 'a'.repeat(250) + '@example.com', source: 'early-access' }).success).toBe(false);
    expect(waitlistSchema.safeParse({ name: 'Ada Obi', email: 'creator@example.com', source: 'early-access', prompt: 'private idea' }).success).toBe(false);
  });
  it('records the plan clicked at checkout and returns the waitlist position', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    expect(await persistWaitlistSignup({ name: 'Ada Obi', email: 'a@example.com', source: 'pricing-checkout', plan: 'ultra' }, insert, async () => 848)).toEqual({ ok: true, position: 848 });
    expect(insert).toHaveBeenCalledExactlyOnceWith({ name: 'Ada Obi', email: 'a@example.com', source: 'pricing-checkout', name: null, plan_code: 'ultra' });
  });
});

describe('waitlist name rule', () => {
  it('requires a full name on new signups', () => {
    expect(waitlistSchema.safeParse({ email: 'a@example.com', source: 'early-access' }).success).toBe(false);
    expect(waitlistSchema.safeParse({ name: ' ', email: 'a@example.com', source: 'early-access' }).success).toBe(false);
    expect(waitlistSchema.safeParse({ name: 'Test Vincent', email: 'a@example.com', source: 'early-access' }).success).toBe(true);
  });
});
