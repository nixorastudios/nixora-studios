import { describe, it, expect } from 'vitest';
import { parseVoiceOverCommand, LANGUAGES, parseVoiceId, voiceId } from '@/lib/voice-over';

const accents = LANGUAGES.flatMap(l => l.accents.map(a => a.label));

describe('voice over', () => {
  it('routes "Build voice over for" prompts from Code Engine', () => {
    expect(parseVoiceOverCommand('Build voice over for my product launch')).toBe('my product launch');
    expect(parseVoiceOverCommand('Build a landing page')).toBeNull();
  });
  it('offers the requested global accents', () => {
    for (const a of ['United States', 'United Kingdom', 'Australia', 'Canada', 'Nigerian — Yoruba accent', 'Nigerian — Igbo accent', 'Nigerian — Hausa accent', 'Ghanaian', 'Kenyan (Swahili)', 'South African', 'France', 'Spain', 'Germany', 'Italy', 'Portugal', 'India', 'Arabic (Standard)', 'Mandarin', 'Japan', 'Korea', 'Brazil', 'Mexico']) expect(accents).toContain(a);
  });
  it('round-trips voice ids and maps legacy ids', () => {
    expect(parseVoiceId(voiceId('ng-igbo', 'male')).accent.lang).toBe('en-NG');
    expect(parseVoiceId('female-us').accent.id).toBe('en-us');
  });
});
