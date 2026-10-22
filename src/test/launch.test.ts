import { describe, expect, it } from 'vitest';
import { addSignup, countdown, LAUNCH_AT, VISITOR_BASE, WAITLIST_BASE, saveLaunchDraft, saveLocalWaitlist, readLocalWaitlist } from '@/lib/launch';
import models from '@/lib/models.json';
import { TOOLS } from '@/lib/tools';
import { isOwner, validateSignature } from '@/lib/signature';
import { ENGINES } from '@/lib/engines';
import { addPngAttribution } from '@/lib/watermark';

describe('Launch rules', () => {
  it('saves tool, prompt and date in nixora_draft', () => {
    const saved = new Map<string, string>();
    saveLaunchDraft({ setItem: (key, value) => saved.set(key, value) }, 'TEXT TO IMAGE', 'A cinematic camera', new Date('2026-10-20T14:10:00Z'));
    expect(JSON.parse(saved.get('nixora_draft') ?? 'null')).toEqual({ tool: 'TEXT TO IMAGE', prompt: 'A cinematic camera', date: '2026-10-20T14:10:00.000Z' });
  });
  it('rejects empty prompts before writing a draft', () => {
    let writes = 0;
    expect(() => saveLaunchDraft({ setItem: () => { writes++; } }, 'TEXT TO IMAGE', '   ', new Date())).toThrow('Enter prompt first');
    expect(writes).toBe(0);
  });
  it('stores normalized emails as a JSON array in nixora_waitlist', () => {
    const saved = new Map<string, string>();
    const storage = { getItem: (key: string) => saved.get(key) ?? null, setItem: (key: string, value: string) => { saved.set(key, value); } };
    saveLocalWaitlist(storage, ' TEST@Example.com ');
    expect(JSON.parse(saved.get('nixora_waitlist') ?? 'null')).toEqual(['test@example.com']);
    expect(saveLocalWaitlist(storage, 'second@example.com')).toEqual(['test@example.com', 'second@example.com']);
    expect(readLocalWaitlist(storage).length).toBe(2);
  });
  it('preserves a legacy email when appending a new signup', () => {
    let value = 'old@example.com';
    const storage = { getItem: () => value, setItem: (_key: string, next: string) => { value = next; } };
    saveLocalWaitlist(storage, 'new@example.com');
    expect(JSON.parse(value)).toEqual(['old@example.com', 'new@example.com']);
  });
  it('counts a repeated normalized email only once', () => {
    let value = '["test@example.com"]';
    const storage = { getItem: () => value, setItem: (_key: string, next: string) => { value = next; } };
    expect(saveLocalWaitlist(storage, ' TEST@EXAMPLE.COM ')).toEqual(['test@example.com']);
    expect(readLocalWaitlist(storage).length).toBe(1);
  });
  it('handles malformed local waitlist data without throwing', () => {
    expect(readLocalWaitlist({ getItem: () => '{broken' })).toEqual([]);
    expect(readLocalWaitlist({ getItem: () => '[null, 5, "valid@example.com"]' })).toEqual(['valid@example.com']);
  });
  it('provides ten unconnected model placeholders for the existing cards', () => {
    expect(models).toHaveLength(10);
    expect(models.map(model => model.slug)).toEqual(TOOLS.map(tool => tool.slug));
    expect(models.every(model => model.model === null && model.status === 'placeholder')).toBe(true);
  });
  it('does not save an invalid waitlist email', () => {
    let writes = 0;
    expect(() => saveLocalWaitlist({ getItem: () => null, setItem: () => { writes++; } }, 'invalid')).toThrow();
    expect(writes).toBe(0);
  });
  it('launches November 23, 2026 at 10:31 UTC', () => {
    expect(LAUNCH_AT).toBe(Date.parse('2026-11-23T10:31:00Z'));
    expect(countdown(Date.parse('2026-11-16T10:31:00Z'))).toEqual([7, 0, 0, 0]);
  });
  it('never shows negative time after launch', () => expect(countdown(LAUNCH_AT + 1000)).toEqual([0, 0, 0, 0]));
  it('starts illustrative counters at the requested values', () => { expect(VISITOR_BASE).toBe(1365); expect(WAITLIST_BASE).toBe(847); });
  it('gives the first local signup number 848 and deduplicates email', () => {
    const first = addSignup([], ' Test@Example.com ');
    expect(first).toEqual({ emails: ['test@example.com'], position: 848 });
    expect(addSignup(first.emails, 'TEST@example.com')).toEqual(first);
  });
  it('rejects invalid emails without appending them', () => expect(() => addSignup([], 'invalid')).toThrow());
  it('never grants access by email and rejects empty legacy signatures', async () => {
    expect(isOwner('anyone@example.com')).toBe(false);
    expect(await validateSignature('')).toBe(false);
  });
  it('keeps exactly the ten engine ids with no channel entries', () => expect(ENGINES.map(e => e.slug)).toEqual(['text-to-image', 'text-to-video', 'photo-to-video', 'animation', 'sound-effects', 'voice-over', 'music-daw', 'lipsync', 'video-editor', 'code-engine']));
  it('writes supplied invisible attribution into a PNG text chunk', () => {
    const png = Uint8Array.from([137,80,78,71,13,10,26,10,0,0,0,0,73,69,78,68,174,66,96,130]);
    const result = addPngAttribution(png, 'test@example.com');
    expect(new TextDecoder().decode(result)).toContain('NIXORA Attribution\0test@example.com');
    expect(Array.from(result.slice(-12))).toEqual(Array.from(png.slice(-12)));
  });
});