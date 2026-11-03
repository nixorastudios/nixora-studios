// Pure, browser-safe rules for the Text to Image engine (shared by UI, server routes and tests).

export const MODE_GROUPS: { group: string; modes: string[] }[] = [
  { group: "Create", modes: ["Create image", "Concept art", "Key frame", "Storyboard frame", "Character sheet", "Character turnaround", "Environment design", "Prop design", "Creature design", "Costume design", "Mood board", "Matte painting"] },
  { group: "Film & TV", modes: ["Movie poster", "Movie still", "Cinematic", "Film noir", "Epic fantasy", "Sci-fi", "Horror", "Documentary still", "Period drama", "Western", "Thriller", "Title card", "Series key art"] },
  { group: "Marketing", modes: ["Banner", "Billboard", "Product standard", "Product on white", "Lifestyle product", "Packaging mockup", "Advertising campaign", "Magazine cover", "Album cover", "Podcast cover", "Book cover", "Event flyer", "Social post", "YouTube thumbnail", "Website hero", "App store screenshot"] },
  { group: "Photography", modes: ["Realistic", "Portrait", "Fashion editorial", "Beauty close-up", "Street photography", "Architecture", "Interior design", "Food photography", "Landscape", "Aerial drone", "Wildlife", "Macro", "Sports action", "Night photography", "Black and white", "Studio headshot"] },
  { group: "AI Photoshop", modes: ["Turn image to professional", "Retouch", "Background replace", "Relight", "Colour grade", "Upscale detail", "Object removal", "Outfit change", "Style transfer", "Season change", "Day to night", "Sky replacement"] },
  { group: "3D", modes: ["3D render", "3D character", "Clay render", "Isometric 3D", "Low poly", "Product 3D", "Architectural visualisation", "Toy figure", "Game asset"] },
  { group: "2D & Illustration", modes: ["2D illustration", "Anime", "Cartoon", "Comic book", "Children's book", "Watercolour", "Oil painting", "Ink sketch", "Pencil drawing", "Vector flat", "Pixel art", "Graffiti", "Pop art", "Line art"] },
  { group: "Classical & Culture", modes: ["Classical painting", "Renaissance", "Baroque", "Art nouveau", "Art deco", "Ukiyo-e", "African art", "Afrofuturism", "Byzantine icon", "Stained glass"] },
  { group: "Design", modes: ["Logo concept", "Icon set", "Infographic", "Pattern", "Typography poster", "Brand mascot", "Sticker", "T-shirt print"] },
];
export const ALL_MODES = MODE_GROUPS.flatMap((g) => g.modes);

export const PLATFORMS = [
  { id: "none", label: "No platform", aspect: "1:1" },
  { id: "youtube", label: "YouTube", aspect: "16:9" },
  { id: "spotify", label: "Spotify", aspect: "1:1" },
  { id: "prime", label: "Prime Video", aspect: "16:9" },
  { id: "netflix", label: "Netflix", aspect: "16:9" },
  { id: "instagram", label: "Instagram", aspect: "4:5" },
  { id: "tiktok", label: "TikTok", aspect: "9:16" },
  { id: "facebook", label: "Facebook", aspect: "1:1" },
  { id: "billboard", label: "Billboard", aspect: "3:1" },
] as const;
export type Aspect = "1:1" | "16:9" | "9:16" | "4:5" | "3:1";
export const ASPECTS: Aspect[] = ["1:1", "16:9", "9:16", "4:5", "3:1"];
export const DIMENSIONS = ["2D", "3D"] as const;
export const RESOLUTIONS = ["Native", "2K", "4K", "8K", "16K"] as const;
export type Resolution = (typeof RESOLUTIONS)[number];
export const FORMATS = [
  { id: "png", label: "PNG", mime: "image/png" },
  { id: "jpg", label: "JPG / JPEG", mime: "image/jpeg" },
  { id: "webp", label: "WEBP", mime: "image/webp" },
] as const;

export const MAX_PROMPT = 3000;

/** Size sent to the image model; every value satisfies the model's 16-px and pixel-count rules. */
export function generationSize(aspect: Aspect): string {
  switch (aspect) {
    case "16:9": return "1536x864";
    case "9:16": return "864x1536";
    case "4:5": return "1024x1280";
    case "3:1": return "2304x768";
    default: return "1024x1024";
  }
}

const LONG_EDGE: Record<Exclude<Resolution, "Native">, number> = { "2K": 2048, "4K": 3840, "8K": 7680, "16K": 15360 };

/** Export size: the long edge matches the chosen K, the short edge keeps the image's own proportions. */
export function exportSize(res: Resolution, width: number, height: number) {
  if (res === "Native") return { width, height };
  const long = LONG_EDGE[res];
  const scale = long / Math.max(width, height);
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

export function buildImagePrompt(o: { prompt: string; mode: string; dimension: string; platform: string; hasReference: boolean }) {
  const parts = [o.prompt.trim(), `Style: ${o.mode}.`, o.dimension === "3D" ? "Rendered as a high-end 3D image." : "Rendered as a 2D image."];
  if (o.platform && o.platform !== "No platform") parts.push(`Composed for ${o.platform}.`);
  if (o.hasReference) parts.push("Keep the character and identity from the reference image consistent.");
  parts.push("Professional, award-winning quality, precise composition, no watermarks.");
  return parts.join(" ");
}

export function validateImagePrompt(prompt: unknown): string {
  if (typeof prompt !== "string" || !prompt.trim()) throw new Error("Enter a prompt first");
  if (prompt.length > MAX_PROMPT + 400) throw new Error("Your prompt is too long. Please shorten it.");
  return prompt.trim();
}

// ---- Smart prompt auto-setting ----

export type PromptStyleHint = "realistic" | "anime" | "3d";
export interface PromptHints { style?: PromptStyleHint | undefined; aspect?: Aspect | undefined; }

/** Read style and aspect hints straight out of the creator's own words. */
export function parsePromptHints(prompt: string): PromptHints {
  const t = prompt.toLowerCase();
  const style: PromptStyleHint | undefined =
    /\b(3d|three[- ]dimensional)\b/.test(t) ? "3d"
    : /\b(anime|cartoon|manga|illustration|illustrated)\b/.test(t) ? "anime"
    : /\b(realistic|photorealistic|photo[- ]?real|hyperrealistic|8k)\b/.test(t) ? "realistic"
    : undefined;
  const aspect: Aspect | undefined =
    /\b(16:9|widescreen|landscape)\b/.test(t) ? "16:9"
    : /\b(9:16|vertical|portrait orientation|tall)\b/.test(t) ? "9:16"
    : /\b4:5\b/.test(t) ? "4:5"
    : /\b(3:1|panorama|panoramic)\b/.test(t) ? "3:1"
    : /\b(1:1|square)\b/.test(t) ? "1:1"
    : undefined;
  return { style, aspect };
}

/** Vague = short and carries no style or size hint of its own. */
export function isVaguePrompt(prompt: string, hints: PromptHints = parsePromptHints(prompt)): boolean {
  const words = prompt.trim().split(/\s+/).filter(Boolean).length;
  return words > 0 && words < 10 && !hints.style && !hints.aspect;
}

/** Append a manual setting (e.g. "realistic style") to the prompt text. */
export function appendStyleHint(prompt: string, hint: string): string {
  const base = prompt.trim().replace(/[.,\s]+$/, "");
  return base ? `${base}, ${hint}` : hint;
}
