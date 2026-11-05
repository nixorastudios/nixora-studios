// Single source of truth for engine capabilities. Adding or updating an
// engine means editing one object here — UI lists render from this config.

export interface EngineEntry {
  id: string;
  name: string;
  models: string[];
  styles: string[];
  sizes: string[];
  /** True when the engine can receive a generated image from Text to Image. */
  acceptsImageHandoff: boolean;
}

const IMAGE_SIZES = ["1:1", "16:9", "9:16", "4:5", "3:1"];
const VIDEO_SIZES = ["16:9", "9:16", "1:1"];

export const ENGINES_CONFIG: EngineEntry[] = [
  { id: "text-to-image", name: "Text to Image", models: ["gpt-image-2.5"], styles: ["realistic", "anime", "3d", "typography"], sizes: IMAGE_SIZES, acceptsImageHandoff: false },
  { id: "text-to-video", name: "Text to Video", models: ["gemini-omni-1.1-flash"], styles: ["cinematic", "realistic", "anime", "3d"], sizes: VIDEO_SIZES, acceptsImageHandoff: true },
  { id: "photo-to-video", name: "Image to Video", models: ["gemini-omni-1.1-flash"], styles: ["cinematic", "realistic", "3d"], sizes: VIDEO_SIZES, acceptsImageHandoff: false },
  { id: "animation", name: "Animation", models: ["gemini-omni-1.1-flash"], styles: ["anime", "cartoon", "3d", "motion-graphics"], sizes: VIDEO_SIZES, acceptsImageHandoff: true },
  { id: "sound-effects", name: "Sound Effects", models: [], styles: ["foley", "cinematic"], sizes: [], acceptsImageHandoff: false },
  { id: "voice-over", name: "Voice Over", models: [], styles: ["narration", "character"], sizes: [], acceptsImageHandoff: false },
  { id: "music-daw", name: "Music Studio", models: [], styles: ["score", "beat"], sizes: [], acceptsImageHandoff: false },
  { id: "lipsync", name: "Lipsync", models: ["gemini-omni-1.1-flash"], styles: ["realistic", "anime", "3d"], sizes: VIDEO_SIZES, acceptsImageHandoff: true },
  { id: "video-editor", name: "Video Editor", models: [], styles: [], sizes: VIDEO_SIZES, acceptsImageHandoff: true },
  { id: "code-engine", name: "NIXORA Code Engine", models: [], styles: [], sizes: [], acceptsImageHandoff: false },
];

/** Engines a generated image can be pushed to from the Text to Image studio. */
export const HANDOFF_ENGINES = ENGINES_CONFIG.filter((e) => e.acceptsImageHandoff);

export const getEngineConfig = (id: string) => ENGINES_CONFIG.find((e) => e.id === id) ?? null;
