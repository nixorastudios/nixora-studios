import { describe, it, expect } from 'vitest';
import { composeVideoPrompt, DEFAULT_VIDEO_SETTINGS, videoSettingsSchema } from '../lib/video-studio';
describe('text-to-video generation rules', () => {
  const valid = { ...DEFAULT_VIDEO_SETTINGS, prompt: 'A sailboat crossing a calm ocean.' };
  it('requires an explicit usage confirmation', () => {
    expect(videoSettingsSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
    expect(videoSettingsSchema.safeParse(valid).success).toBe(true);
  });
  it('accepts only supported 3–10 second clips', () => {
    expect(videoSettingsSchema.safeParse({ ...valid, duration: 2 }).success).toBe(false);
    expect(videoSettingsSchema.safeParse({ ...valid, duration: 11 }).success).toBe(false);
    expect(videoSettingsSchema.safeParse({ ...valid, duration: 3 }).success).toBe(true);
    expect(videoSettingsSchema.safeParse({ ...valid, duration: 10 }).success).toBe(true);
  });
  it('rejects unsupported shapes and resolutions', () => {
    expect(videoSettingsSchema.safeParse({ ...valid, ratio: '1:1' }).success).toBe(false);
    expect(videoSettingsSchema.safeParse({ ...valid, resolution: '8k' }).success).toBe(false);
  });
  it('preserves scene and chosen cinematic direction in the provider prompt', () => {
    const prompt = composeVideoPrompt({ ...valid, camera: 'Tracking', audio: 'Ocean waves.', exclusions: 'No dialogue.' });
    expect(prompt).toContain(valid.prompt);
    expect(prompt).toContain('Camera: Tracking');
    expect(prompt).toContain('Ocean waves.');
    expect(prompt).toContain('No dialogue.');
  });
});