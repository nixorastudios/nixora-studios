import { z } from 'zod';

const startFrameSchema = z
  .string()
  .regex(/^data:image\/(?:png|jpeg|webp);base64,/, 'The start frame must be a PNG, JPEG or WebP image.')
  .max(3_500_000, 'The start frame image is too large even after compression.');

export const videoSettingsSchema = z.object({
  prompt: z.string().trim().min(10, 'Describe your scene in at least 10 characters.').max(4000),
  duration: z.number().int().min(3).max(10),
  ratio: z.enum(['16:9', '9:16']),
  resolution: z.enum(['720p', '1080p']),
  style: z.enum(['Cinematic', 'Documentary', 'Animation', 'Commercial']),
  camera: z.enum(['Slow dolly', 'Locked-off', 'Tracking', 'Aerial', 'Handheld']),
  lighting: z.enum(['Golden hour', 'Natural daylight', 'Studio softbox', 'Neon night', 'Moody low-key']),
  audio: z.string().max(500),
  exclusions: z.string().max(500),
  startFrame: startFrameSchema.optional(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Confirm generation usage before continuing.' }) }),
});
export type VideoSettings = z.infer<typeof videoSettingsSchema>;
export const DEFAULT_VIDEO_SETTINGS: VideoSettings = {
  prompt: '', duration: 5, ratio: '16:9', resolution: '720p', style: 'Cinematic',
  camera: 'Slow dolly', lighting: 'Golden hour', audio: 'Natural ambience, no dialogue.',
  exclusions: 'No watermarks, no added text, no abrupt cuts.', consent: true,
};
export function composeVideoPrompt(settings: VideoSettings) {
  return `${settings.prompt}\nVisual style: ${settings.style}. Camera: ${settings.camera}. Lighting: ${settings.lighting}.\nA ${settings.duration}-second single continuous shot. Maintain consistent subjects, natural motion, coherent spatial relationships and physically plausible action. Consider micro-detail, expression and timing.\nAudio direction: ${settings.audio || 'Natural ambience. No dialogue.'}\nExclusions: ${settings.exclusions || 'No added text or watermarks.'}`;
}
export type StudioJob = {
  id: string; prompt: string; settings: VideoSettings; status: string; progress: number;
  createdAt: string; url?: string | undefined; error?: string | undefined;
};
// Keeps large frame data out of device drafts and database rows.
export function stripStartFrame(settings: VideoSettings): VideoSettings {
  const { startFrame: _frame, ...rest } = settings;
  return rest;
}
const MAX_START_FRAME_CHARS = 3_200_000;
// Client-side downscale/compress so the frame fits the generation request comfortably.
export async function loadStartFrameDataUrl(source: File | Blob) {
  const objectUrl = URL.createObjectURL(source);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('The image could not be decoded.'));
      element.src = objectUrl;
    });
    const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.9, 0.8, 0.7, 0.6]) {
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      if (dataUrl.length <= MAX_START_FRAME_CHARS) return dataUrl;
    }
    throw new Error('The image is too large to use as a start frame.');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

// Engine-specific direction layered over the creator's prompt; the opening frame keeps identity.
export function variantPrompt(variant: 'video' | 'animation' | 'lipsync', settings: Pick<VideoSettings, 'prompt' | 'audio'>) {
  const base = settings.prompt.trim();
  if (variant === 'animation') return `Animate the provided opening image. Keep the same characters, design, colours and composition; bring them to life with smooth, expressive animated motion. ${base}`.slice(0, 4000);
  if (variant === 'lipsync') return `The person in the provided opening image speaks directly, with accurate lip-sync, natural facial expression and blinking, keeping their exact identity and appearance. They say exactly: "${settings.audio.trim()}". ${base}`.slice(0, 4000);
  return base;
}
