export const LEGACY_SIGNATURE_HASH = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
export const OWNER_EMAILS = ['anago.vincent.nnalue@gmail.com','Chukwumannalue3@gmail.com'];
export async function validateSignature(content: string, expectedHash = LEGACY_SIGNATURE_HASH): Promise<boolean> {
  if (!content.trim()) return false;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2,'0')).join('') === expectedHash;
}
export function isOwner(email?: string | null): boolean {
  if (!email) return false;
  return OWNER_EMAILS.includes(email.toLowerCase().trim());
}
