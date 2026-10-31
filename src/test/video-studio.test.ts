import { describe, it, expect } from 'vitest';
import { composeVideoPrompt, DEFAULT_VIDEO_SETTINGS, stripStartFrame, videoSettingsSchema } from '../lib/video-studio';
import { buildGatewayBody } from '../lib/video-studio.server';
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

describe('image-to-video start frames', () => {
  const valid = { ...DEFAULT_VIDEO_SETTINGS, prompt: 'A sailboat crossing a calm ocean.' };
  const frame = 'data:image/jpeg;base64,AAAA';
  it('accepts an optional image start frame and rejects non-image data', () => {
    expect(videoSettingsSchema.safeParse({ ...valid, startFrame: frame }).success).toBe(true);
    expect(videoSettingsSchema.safeParse({ ...valid, startFrame: 'data:application/pdf;base64,AAAA' }).success).toBe(false);
    expect(videoSettingsSchema.safeParse(valid).success).toBe(true);
  });
  it('sends a chosen frame as the opening image with the image_to_video task', () => {
    const body = buildGatewayBody({ ...valid, startFrame: frame });
    const parts = body.input as Array<{ type: string; data?: string; mime_type?: string; text?: string }>;
    expect(parts[0]).toMatchObject({ type: 'image', data: 'AAAA', mime_type: 'image/jpeg' });
    expect(body.generation_config?.video_config.task).toBe('image_to_video');
    expect(parts[1]?.text).toContain('opening frame');
  });
  it('keeps plain text-to-video when no frame is chosen', () => {
    const body = buildGatewayBody(valid);
    expect(typeof body.input).toBe('string');
    expect(body.generation_config).toBeUndefined();
  });
  it('never stores the frame data in saved drafts or database rows', () => {
    expect(stripStartFrame({ ...valid, startFrame: frame })).toEqual(valid);
  });
});