import { describe, expect, it } from 'vitest';
import { createGodModeExport, isOwner, OWNER_EMAILS, validateSignature } from '@/lib/signature';

describe('Signature safeguards', () => {
  it.each([
    'owner.personal@example.com',
    'owner.personal.alt@example.com',
    'second.personal@example.com',
    ' OWNER.PERSONAL@EXAMPLE.COM ',
    'anyone@example.com',
    '',
    null,
    undefined,
  ])('does not grant ownership for %s', (email) => {
    expect(isOwner(email)).toBe(false);
  });

  it('exposes no browser email allowlist', () => {
    expect(OWNER_EMAILS).toEqual([]);
    expect(Object.isFrozen(OWNER_EMAILS)).toBe(true);
  });

  it('rejects blank content even with the legacy empty-content digest', async () => {
    expect(await validateSignature('')).toBe(false);
    expect(await validateSignature('   ')).toBe(false);
  });

  it('validates a matching SHA-256 digest without granting access', async () => {
    const hash = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';
    expect(await validateSignature('abc', hash)).toBe(true);
    expect(await validateSignature('abcd', hash)).toBe(false);
    expect(isOwner(hash)).toBe(false);
  });

  it('does not authorize owner exports using public metadata', () => {
    const result = createGodModeExport('code-engine', 'XONA');
    expect(result.allowed).toBe(false);
    expect(result.isGodMode).toBe(false);
    expect(result.signature.channelId).toBe('NX_XONA_005');
  });
});