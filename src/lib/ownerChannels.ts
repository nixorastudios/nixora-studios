// NIXORA STUDIOS - OWNER PRIVATE - 5 CHANNELS - GOD MODE ONLY - Asaba 2026
export const OWNER_CHANNELS = {
  KIDS: { name: "NIXORA KIDS", id: "NX_KIDS_001", platform: ["YouTube", "TikTok"] },
  ALTAR: { name: "LIVING ALTAR", id: "NX_ALTAR_002", platform: ["YouTube", "Facebook"] },
  TALES: { name: "AFRO TALES", id: "NX_TALES_003", platform: ["YouTube", "Spotify"] },
  VIBRA: { name: "VIBRA", id: "NX_VIBRA_004", platform: ["TikTok", "Instagram"] },
  XONA: { name: "XONA", id: "NX_XONA_005", platform: ["YouTube", "X"] },
} as const;

export const OWNER_SIGNATURE_META = {
  owner: "NIXORA STUDIOS",
  license: "PAID_SUBSCRIPTION_RIGHTS_RESERVED",
  rights: "Commercial Premium - Not Free Content",
  contact: "nixorastudios.com",
  hash: "NX-OWNER-2026-PREMIUM",
  year: 2026,
  location: "Asaba, Delta State, Nigeria",
};

export function injectOwnerSignature(fileName: string, channelId: keyof typeof OWNER_CHANNELS) {
  const channel = OWNER_CHANNELS[channelId];
  return {
    file: fileName,
    ...OWNER_SIGNATURE_META,
    channel: channel.name,
    channelId: channel.id,
    signatureVersion: "v1.0-GOD-MODE",
    timestamp: new Date().toISOString(),
    note: "Premium licensed. Free preview carries paid rights."
  };
}
