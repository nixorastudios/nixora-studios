// Voice Over engine: pure helpers + browser demo playback + a ready hook for real TTS.
export const VOICE_HANDOFF_KEY = 'nixora_voice_handoff';
export const VOICE_STORAGE_KEY = 'nixora_voice_jobs';
export const MAX_SCRIPT = 5000;

export type VoiceId = 'male-ng' | 'female-ng' | 'male-us' | 'female-us';
export const VOICES: { id: VoiceId; label: string; lang: string; gender: 'male' | 'female' }[] = [
  { id: 'male-ng', label: 'Male Nigerian', lang: 'en-NG', gender: 'male' },
  { id: 'female-ng', label: 'Female Nigerian', lang: 'en-NG', gender: 'female' },
  { id: 'male-us', label: 'Male US', lang: 'en-US', gender: 'male' },
  { id: 'female-us', label: 'Female US', lang: 'en-US', gender: 'female' },
];

export type VoiceJob = { id: string; script: string; voice: VoiceId; speed: number; pitch: number; provider: 'browser' | 'api'; createdAt: string };

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Recognises Code Engine prompts like "Build voice over for my product launch". Returns the script or null. */
export function parseVoiceOverCommand(text: string): string | null {
  const m = text.trim().match(/^build\s+(?:a\s+)?voice[\s-]?over\s+for\s*:?\s*([\s\S]*)$/i);
  return m ? m[1].trim() : null;
}

export function readLocalJobs(): VoiceJob[] {
  try { const v = JSON.parse(localStorage.getItem(VOICE_STORAGE_KEY) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
}
export function saveLocalJob(job: VoiceJob) {
  localStorage.setItem(VOICE_STORAGE_KEY, JSON.stringify([job, ...readLocalJobs().filter(j => j.id !== job.id)].slice(0, 50)));
}

function pickVoice(id: VoiceId): SpeechSynthesisVoice | undefined {
  const cfg = VOICES.find(v => v.id === id)!;
  const all = speechSynthesis.getVoices();
  const byLang = all.filter(v => v.lang.replace('_', '-').startsWith(cfg.lang));
  const pool = byLang.length ? byLang : all.filter(v => v.lang.startsWith('en'));
  const gendered = pool.find(v => (cfg.gender === 'female' ? /female|woman|samantha|zira|aria|jenny|ezinne/i : /male|man|daniel|david|guy|abeo/i).test(v.name) && !(cfg.gender === 'male' && /female/i.test(v.name)));
  return gendered ?? pool[0];
}

/** DEMO: plays through the browser's built-in voices. Browsers expose no audio stream, so this cannot be downloaded. */
export function speakInBrowser(script: string, voice: VoiceId, speed: number, pitch: number, onEnd: () => void) {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(script);
  const v = pickVoice(voice); if (v) u.voice = v;
  u.lang = VOICES.find(x => x.id === voice)!.lang;
  u.rate = clamp(speed, 0.5, 2); u.pitch = clamp(pitch, 0, 2);
  u.onend = onEnd; u.onerror = onEnd;
  speechSynthesis.speak(u);
}

/**
 * REAL TTS HOOK — not connected yet. When ready, implement a server route (e.g. /api/voice-over)
 * that calls ElevenLabs or OpenAI TTS with a server-side key, and return the audio Blob here.
 * Returning a Blob enables Download MP3/WAV and private cloud audio storage automatically.
 */
export async function generateWithApi(_job: Pick<VoiceJob, 'script' | 'voice' | 'speed' | 'pitch'>): Promise<Blob | null> {
  // TODO: const res = await fetch('/api/voice-over', { method: 'POST', body: JSON.stringify(_job) }); return res.blob();
  return null;
}
