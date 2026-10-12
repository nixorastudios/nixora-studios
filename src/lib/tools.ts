export type ToolInput = "image" | "video" | "audio" | null;

export interface ToolConfig {
  slug: string;
  name: string;
  icon: string;
  description: string;
  input: ToolInput;
  output: "image" | "video";
}

export const TOOLS: ToolConfig[] = [
  { slug: "text-to-image", name: "Text to Image", icon: "🖼️", description: "Turn words into photos and art.", input: null, output: "image" },
  { slug: "image-to-video", name: "Image to Video", icon: "📼", description: "Bring still images to life.", input: "image", output: "video" },
  { slug: "text-to-video", name: "Text to Video", icon: "🎬", description: "Turn words into moving video.", input: null, output: "video" },
  { slug: "image-to-image", name: "Image to Image", icon: "🎨", description: "Restyle or transform an image.", input: "image", output: "image" },
  { slug: "video-to-video", name: "Video to Video", icon: "🎞️", description: "Restyle an existing clip.", input: "video", output: "video" },
  { slug: "audio-to-video", name: "Audio to Video", icon: "🎧", description: "Create visuals driven by audio.", input: "audio", output: "video" },
  { slug: "lipsync", name: "Lipsync", icon: "🗣️", description: "Sync a face's mouth to voice audio.", input: "audio", output: "video" },
  { slug: "upscale", name: "Upscale", icon: "🔍", description: "Increase image resolution and detail.", input: "image", output: "image" },
  { slug: "background-remover", name: "Background Remover", icon: "✂️", description: "Cut the subject out cleanly.", input: "image", output: "image" },
  { slug: "motion-control", name: "Motion Control", icon: "🕹️", description: "Direct camera and subject motion.", input: "image", output: "video" },
];

export const getTool = (slug: string) => TOOLS.find((t) => t.slug === slug);
