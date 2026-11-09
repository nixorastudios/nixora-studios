import { describe, it, expect } from 'vitest';
import { parseVoiceOverCommand, VOICES } from '@/lib/voice-over';

describe('voice over', () => {
  it('routes "Build voice over for" prompts from Code Engine', () => {
    expect(parseVoiceOverCommand('Build voice over for my product launch')).toBe('my product launch');
    expect(parseVoiceOverCommand('Build a landing page')).toBeNull();
  });
  it('offers exactly the four requested voices', () => {
    expect(VOICES.map(v => v.label)).toEqual(['Male Nigerian', 'Female Nigerian', 'Male US', 'Female US']);
  });
});
