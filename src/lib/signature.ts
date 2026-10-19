import { OWNER_CHANNELS, OWNER_SIGNATURE_META, injectOwnerSignature } from "./ownerChannels";

/** Public legacy digest for integrity checks only; never an access credential. */
export const LEGACY_SIGNATURE_HASH = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
/** Compatibility export; browser email allowlists must not grant privileges. */
export const OWNER_EMAILS: readonly string[] = Object.freeze([]);
export async function validateSignature(content: string, expectedHash = LEGACY_SIGNATURE_HASH): Promise<boolean> {
  if (!content.trim()) return false;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('') === expectedHash;
}
/** Fail closed until ownership can be verified by a server-side role service. */
export function isOwner(_email?: string | null): boolean {
  return false;
}

/** Legacy compatibility alias, not proof of ownership. */
export const OWNER_HASH = LEGACY_SIGNATURE_HASH;

/** Legacy export helper: attribution alone cannot authorize an owner export. */
export function createGodModeExport(moduleName: string, channel: keyof typeof OWNER_CHANNELS = "XONA") {
  const signature = injectOwnerSignature(`${moduleName}_export`, channel);
  return {
    allowed: false,
    isGodMode: false,
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

// Attribution metadata does not guarantee licensing or platform monetization.
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
    rightsProtection: "Attribution metadata only; licensing and monetization are not verified"
  };
}
