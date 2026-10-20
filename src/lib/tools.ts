export type ToolInput = "image" | "video" | "audio" | null;

export interface ToolConfig {
  slug: string;
  name: string;
  icon: string;
  description: string;
  input: ToolInput;
  output: "image" | "video" | "audio";
  work: string;
  category: string;
}

export const TOOLS: ToolConfig[] = [
  { slug: "text-to-image", name: "TEXT TO IMAGE", icon: "🖼️", description: "Generate visual concepts from text prompts", input: null, output: "image", work: "Generate Visual Concepts", category: "visual" },
  { slug: "text-to-video", name: "TEXT TO VIDEO", icon: "🎬", description: "Create motion stories from text", input: null, output: "video", work: "Create Motion Stories", category: "video" },
  { slug: "photo-to-video", name: "IMAGE TO VIDEO", icon: "📼", description: "Animate still images into motion", input: "image", output: "video", work: "Animate Still Images", category: "video" },
  { slug: "animation", name: "ANIMATION", icon: "✨", description: "Create moving graphics and characters", input: "image", output: "video", work: "Create Moving Graphics", category: "visual" },
  { slug: "sound-effects", name: "SOUND EFFECTS", icon: "🔊", description: "Produce audio effects and foley", input: null, output: "audio", work: "Produce Audio Effects", category: "audio" },
  { slug: "voice-over", name: "VOICE OVER", icon: "🎙️", description: "Synthesize voice narrations for scenes", input: null, output: "audio", work: "Synthesize Voice Narrations", category: "audio" },
  { slug: "music-daw", name: "MUSIC STUDIO", icon: "🎹", description: "Compose music tracks and beats", input: null, output: "audio", work: "Compose Music Tracks", category: "audio" },
  { slug: "lipsync", name: "LIPSYNC", icon: "🗣️", description: "Sync lip movements to voice", input: "audio", output: "video", work: "Sync Lip Movements", category: "video" },
  { slug: "video-editor", name: "VIDEO EDITOR", icon: "🎞️", description: "Edit final footage and cuts", input: "video", output: "video", work: "Edit Final Footage", category: "video" },
  { slug: "code-engine", name: "CODE ENGINE", icon: "💻", description: "Integrate system logic - Final integration module", input: null, output: "image", work: "Integrate System Logic", category: "system" },
];

export const getTool = (slug: string) => TOOLS.find((t) => t.slug === slug);

export const TOTAL_MODULES = TOOLS.length; // 10
