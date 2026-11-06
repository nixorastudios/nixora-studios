import { z } from 'zod';

export const PRICING_VERSION = 'option-a-2026-11-06';
export const PRICE_NOTICE_DAYS = 7;
export const CREDIT_VALUE_PROTECTION_MONTHS = 12;
export const ENGINE_CREDIT_COSTS = { image: 2, voiceMinute: 4, song: 10, videoFiveSeconds: 20, codeApp: 25 } as const;
export const STUDIO_PRODUCTS = [
  { code: 'pro', name: 'PRO', kind: 'subscription', naira: 30000, credits: 150, seats: 1 },
  { code: 'ultra', name: 'ULTRA', kind: 'subscription', naira: 60000, credits: 500, seats: 1, popular: true },
  { code: 'business', name: 'BUSINESS/GROUP', kind: 'subscription', naira: 120000, credits: 1500, seats: 3 },
  { code: 'small', name: 'Small', kind: 'pack', naira: 7500, credits: 60, seats: 1 },
  { code: 'medium', name: 'Medium', kind: 'pack', naira: 15000, credits: 150, seats: 1 },
  { code: 'large', name: 'Large', kind: 'pack', naira: 35000, credits: 500, seats: 1 },
] as const;
export const checkoutInput = z.object({ product: z.enum(['pro', 'ultra', 'business', 'small', 'medium', 'large']), provider: z.enum(['squad', 'paystack']) });
export function getStudioProduct(code: string) {
  const product = STUDIO_PRODUCTS.find(p => p.code === code);
  if (!product) throw new Error('Choose a listed product.');
  return product;
}
export function protectedValueUntil(purchasedAt: Date) {
  const result = new Date(purchasedAt);
  result.setUTCFullYear(result.getUTCFullYear() + 1);
  return result;
}
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
export function validateStudioUpload(file: Pick<File, 'size' | 'type'>) {
  if (!/^(image\/(jpeg|png|webp|gif)|video\/(mp4|webm|quicktime))$/.test(file.type)) throw new Error('Choose a JPG, PNG, WEBP, GIF, MP4, WEBM or MOV file.');
  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) throw new Error('Choose a nonempty file up to 50 MB.');
}
export function safeAccountRedirect(path: unknown) {
  return typeof path === 'string' && /^\/(?!\/)[^\\]*$/.test(path) && !path.startsWith('/login') && !path.startsWith('/auth') ? path : '/my-studio';
}