import { z } from 'zod';

export const WAITLIST_PLANS = ['pro', 'ultra', 'business', 'small', 'medium', 'large'] as const;

export const waitlistSchema = z.object({
  email: z.string().trim().toLowerCase().max(254, 'Enter a valid email address.').email('Enter a valid email address.'),
  source: z.enum(['early-access', 'prompt-board', 'pricing-checkout']),
  name: z.string().trim().min(2, 'Enter your full name.').max(120, 'Name is too long.'),
  plan: z.enum(WAITLIST_PLANS).optional(),
}).strict();

export type WaitlistInput = z.infer<typeof waitlistSchema>;
export type WaitlistRow = { email: string; source: string; name: string | null; plan_code: string | null };
export type WaitlistResult = { ok: true; position: number | null } | { ok: false; error: string };

export function toWaitlistRow(input: WaitlistInput): WaitlistRow {
  return { email: input.email, source: input.source, name: input.name, plan_code: input.plan ?? null };
}

export async function persistWaitlistSignup(
  input: unknown,
  insert: (signup: WaitlistRow) => Promise<{ error: { code?: string } | null }>,
  total: () => Promise<number | null> = async () => null,
): Promise<WaitlistResult> {
  const signup = waitlistSchema.parse(input);
  const { error } = await insert(toWaitlistRow(signup));
  // Duplicate addresses get the same response (current total), never exposing membership.
  if (!error || error.code === '23505') return { ok: true, position: await total() };
  return { ok: false, error: 'We could not save your signup. Please try again.' };
}
