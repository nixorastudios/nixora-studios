import { z } from 'zod';

export const waitlistSchema = z.object({
  email: z.string().trim().toLowerCase().max(254, 'Enter a valid email address.').email('Enter a valid email address.'),
  source: z.enum(['early-access', 'prompt-board']),
}).strict();

export type WaitlistInput = z.infer<typeof waitlistSchema>;
export type WaitlistResult = { ok: true } | { ok: false; error: string };

export async function persistWaitlistSignup(
  input: unknown,
  insert: (signup: WaitlistInput) => Promise<{ error: { code?: string } | null }>,
): Promise<WaitlistResult> {
  const signup = waitlistSchema.parse(input);
  const { error } = await insert(signup);
  // Duplicate addresses get the same response: never expose membership publicly.
  if (!error || error.code === '23505') return { ok: true };
  return { ok: false, error: 'We could not save your signup. Please try again.' };
}