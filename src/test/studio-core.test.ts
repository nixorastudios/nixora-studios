import { describe, expect, it } from 'vitest';
import { getStudioProduct, ENGINE_CREDIT_COSTS, PRICE_NOTICE_DAYS, CREDIT_VALUE_PROTECTION_MONTHS, protectedValueUntil, safeAccountRedirect } from '@/lib/studio-core';
describe('Final Option A rules', () => {
  it.each([['pro',30000,150],['ultra',60000,500],['business',120000,1500],['small',7500,60],['medium',15000,150],['large',35000,500]])('%s has the exact approved price and credits', (code,naira,credits) => {
    expect(getStudioProduct(String(code))).toMatchObject({ naira, credits });
  });
  it('Business has three seats', () => expect(getStudioProduct('business').seats).toBe(3));
  it.each([['image',2],['voiceMinute',4],['song',10],['videoFiveSeconds',20],['codeApp',25]] as const)('%s retains its credit cost', (engine,cost) => expect(ENGINE_CREDIT_COSTS[engine]).toBe(cost));
  it('price changes require seven days notice', () => expect(PRICE_NOTICE_DAYS).toBe(7));
  it('purchased values are protected for twelve months', () => {
    expect(CREDIT_VALUE_PROTECTION_MONTHS).toBe(12);
    expect(protectedValueUntil(new Date('2026-11-06T12:00:00Z')).toISOString()).toBe('2027-11-06T12:00:00.000Z');
  });
  it('rejects external sign-in redirects', () => expect(safeAccountRedirect('//example.com')).toBe('/dashboard'));
  it('keeps a safe checkout destination after sign-in', () => expect(safeAccountRedirect('/checkout?reference=nixora_123')).toBe('/checkout?reference=nixora_123'));
});