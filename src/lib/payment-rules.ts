import { z } from 'zod';

export const UNUSED_REFUND_DAYS = 7;
export const FAILED_REFUND_HOURS = 24;
export const DISPUTE_RESPONSE_HOURS = 16; // Internal target, not a Squad contractual deadline.
export const TERMS_VERSION = 'v1.0-Nov2026';
export const TERMS_VALIDITY_MS = 365 * 86400000;
export const paymentAttemptSchema = z.object({
  userId: z.string().uuid(), email: z.string().trim().email().max(254).transform(v => v.toLowerCase()),
  provider: z.enum(['paystack', 'squad', 'stripe']), reference: z.string().min(8).max(128).regex(/^[a-zA-Z0-9_-]+$/),
  amountKobo: z.number().int().positive().max(Number.MAX_SAFE_INTEGER), currency: z.literal('NGN'),
  credits: z.number().int().positive().max(100000),
  termsAccepted: z.boolean().refine(v => v === true, { message: 'Must accept Terms' }),
  privacyAccepted: z.boolean().refine(v => v === true, { message: 'Must accept Privacy Policy' }),
  termsVersion: z.string().min(1).max(64),
  emailVerified: z.boolean().refine(v => v === true, { message: 'Email must be verified' }),
});
export type PaymentAttempt = z.infer<typeof paymentAttemptSchema>;
export const paystackEventSchema = z.object({
  event: z.string().min(1).max(100), data: z.unknown(),
});
export const paidTransactionSchema = z.object({
  reference: z.string().min(8).max(128), status: z.literal('success'),
  amount: z.number().int().positive().max(Number.MAX_SAFE_INTEGER), currency: z.literal('NGN'),
  customer: z.object({ email: z.string().email().max(254) }),
});
export const disputeSchema = z.object({
  id: z.union([z.number().int().nonnegative(), z.string().min(1).max(128)]),
  transaction: z.object({ reference: z.string().min(8).max(128) }),
});
export function disputeDeadline(now: Date, providerDeadline?: Date) {
  const internal = new Date(now.getTime() + DISPUTE_RESPONSE_HOURS * 3600000);
  return providerDeadline && providerDeadline < internal ? providerDeadline : internal;
}
export function unusedCreditRefundEligible(purchasedAt: Date, now: Date) {
  const age = now.getTime() - purchasedAt.getTime();
  return age >= 0 && age <= UNUSED_REFUND_DAYS * 86400000;
}