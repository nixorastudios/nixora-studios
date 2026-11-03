// Text-to-Image preview test mode: on only for Lovable preview hosts and local dev.
// Production (nixorastudios.com and the published lovable.app slug) stays waitlist-only until launch.
const PREVIEW_LABEL = /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/;
const PREVIEW_SUFFIXES = [".lovable.app", ".gpt-eng.com", ".gptengineer.run"];

export function isImageEnginePreviewHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h === "127.0.0.1") return true;
  if (h.endsWith(".lovableproject.com") || h.endsWith(".lovableproject-dev.com")) return true;
  if (/^project--[a-z0-9-]+-dev\.lovable\.app$/.test(h)) return true;
  const first = h.split(".")[0] ?? "";
  return PREVIEW_LABEL.test(first) && PREVIEW_SUFFIXES.some((s) => h.endsWith(s));
}
