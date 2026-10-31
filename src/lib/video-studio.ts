import { z } from 'zod';

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