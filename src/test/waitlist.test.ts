import { describe, expect, it, vi } from 'vitest';
import { persistWaitlistSignup, waitlistSchema } from '@/lib/waitlist';

describe('Shared launch waitlist', () => {
  it('stores a normalized email in the database rather than browser storage', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    expect(await persistWaitlistSignup({ email: ' Creator@Example.com ', source: 'early-access' }, insert)).toEqual({ ok: true });
    expect(insert).toHaveBeenCalledExactlyOnceWith({ email: 'creator@example.com', source: 'early-access' });
  });
  it('supports the prompt-board signup without uploading the draft', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    await persistWaitlistSignup({ email: 'creator@example.com', source: 'prompt-board' }, insert);
    expect(insert).toHaveBeenCalledExactlyOnceWith({ email: 'creator@example.com', source: 'prompt-board' });
  });
  it('does not expose whether an address is already registered', async () => {
    const insert = vi.fn().mockResolvedValue({ error: { code: '23505' } });
    expect(await persistWaitlistSignup({ email: 'creator@example.com', source: 'early-access' }, insert)).toEqual({ ok: true });
  });
  it('does not claim success if storing the email fails', async () => {
    const insert = vi.fn().mockResolvedValue({ error: { code: '42501' } });
    expect((await persistWaitlistSignup({ email: 'creator@example.com', source: 'early-access' }, insert)).ok).toBe(false);
  });
  it('rejects invalid emails before any database write', async () => {
    const insert = vi.fn();
    await expect(persistWaitlistSignup({ email: 'not-an-email', source: 'early-access' }, insert)).rejects.toThrow();
    expect(insert).not.toHaveBeenCalled();
  });
  it('rejects unexpected data and oversize input', () => {
    expect(waitlistSchema.safeParse({ email: 'a'.repeat(250) + '@example.com', source: 'early-access' }).success).toBe(false);
    expect(waitlistSchema.safeParse({ email: 'creator@example.com', source: 'early-access', prompt: 'private idea' }).success).toBe(false);
  });
});