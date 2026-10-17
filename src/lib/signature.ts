/** A public digest is not an identity proof and must never grant privileges. */
export const LEGACY_SIGNATURE_HASH = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
export async function validateSignature(content: string, expectedHash = LEGACY_SIGNATURE_HASH): Promise<boolean> {
  if (!content.trim()) return false; // supplied digest is SHA-256 of empty input
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('') === expectedHash.toLowerCase();
}
/** Fail closed until authenticated server-side role checks are connected. */
export function isOwner(_email?: string | null): boolean { return false; }
