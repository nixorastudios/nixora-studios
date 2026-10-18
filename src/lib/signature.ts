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
export const LEGACY_SIGNATURE_HASH = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
export const OWNER_EMAILS = ['anago.vincent.nnalu@gmail.com', 'Chukwumannalue3@gmail.com'];
export async function validateSignature(content: string, expectedHash = LEGACY_SIGNATURE_HASH): Promise<boolean> {
  if (!content.trim()) return false;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('') === expectedHash;
}
export function isOwner(email?: string | null): boolean {
  if (!email) return false;
  return OWNER_EMAILS.includes(email.toLowerCase().trim());
}

// --- NIXORA GOD MODE EXTENSION - Day 1 - Uses existing LEGACY hash ---
import { OWNER_CHANNELS, OWNER_SIGNATURE_META, injectOwnerSignature } from "./ownerChannels";

// Your existing LEGACY_SIGNATURE_HASH is the Owner Hash
export const OWNER_HASH = LEGACY_SIGNATURE_HASH;

export function createGodModeExport(moduleName: string, channel: keyof typeof OWNER_CHANNELS = "XONA") {
  const signature = injectOwnerSignature(`${moduleName}_export`, channel);
  return {
    allowed: true,
    isGodMode: true,
    signature,
    metadata: {
      ...OWNER_SIGNATURE_META,
      module: moduleName,
      channel: OWNER_CHANNELS[channel].name,
      exportType: "CLEAN_FILE_WITH_PAID_RIGHTS",
      copyright: `© 2026 ${OWNER_SIGNATURE_META.owner} - ${OWNER_CHANNELS[channel].id} - Premium Licensed`,
    }
  };
}

// For social posts: Free preview with invisible paid signature
export function applyOwnerWatermarkForSocialPost(moduleUsed: string, channel: "KIDS" | "ALTAR" | "TALES" | "VIBRA" | "XONA") {
  const godExport = createGodModeExport(moduleUsed, channel);
  const socialCaptionSignature = `
© NIXORA STUDIOS | ${godExport.metadata.channel} | ${godExport.metadata.copyright}
License: ${godExport.metadata.license} | Premium Content | nixorastudios.com
#${godExport.signature.channelId} #PremiumLicensed
  `;
  return {
    caption: socialCaptionSignature,
    metadata: godExport.metadata,
    isCleanFile: true,
    rightsProtection: "Platforms detect as paid/premium content"
  };
}
