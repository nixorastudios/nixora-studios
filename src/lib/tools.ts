export type ToolInput = "image" | "video" | "audio" | null;

export interface ToolConfig {
  slug: string;
  name: string;
  icon: string;
  description: string;
  input: ToolInput;
  output: "image" | "video" | "audio";
}

export const TOOLS: ToolConfig[] = [
  { slug: "text-to-image", name: "TEXT TO IMAGE", icon: "🖼️", description: "Turn words into photos and art.", input: null, output: "image" },
  { slug: "text-to-video", name: "TEXT TO VIDEO", icon: "🎬", description: "Turn words into moving video.", input: null, output: "video" },
  { slug: "photo-to-video", name: "IMAGES TO VIDEO", icon: "📼", description: "Bring still images to life.", input: "image", output: "video" },
  { slug: "animation", name: "ANIMATION", icon: "✨", description: "Generate animated scenes and motion.", input: "image", output: "video" },
  { slug: "sound-effects", name: "SOUND EFFECTS", icon: "🔊", description: "Create sound effects from a description.", input: null, output: "audio" },
  { slug: "voice-over", name: "VOICE OVER", icon: "🎙️", description: "Turn scripts into spoken voice over.", input: null, output: "audio" },
  { slug: "music-daw", name: "MUSIC STUDIO", icon: "🎹", description: "Compose beats and full tracks.", input: null, output: "audio" },
  { slug: "lipsync", name: "LIPSYNC", icon: "🗣️", description: "Sync a face's mouth to voice audio.", input: "audio", output: "video" },
  { slug: "video-editor", name: "VIDEO EDITOR", icon: "🎞️", description: "Cut, restyle and finish clips.", input: "video", output: "video" },
  { slug: "code-engine", name: "CODE ENGINE", icon: "💻", description: "Generate code and live previews from a prompt.", input: null, output: "image" },
];

export const getTool = (slug: string) => TOOLS.find((t) => t.slug === slug);
