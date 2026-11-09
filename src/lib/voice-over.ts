// Voice Over engine: pure helpers + browser demo playback + a ready hook for real TTS.
export const VOICE_HANDOFF_KEY = 'nixora_voice_handoff';
export const VOICE_STORAGE_KEY = 'nixora_voice_jobs';
export const MAX_SCRIPT = 5000;

export type Gender = 'male' | 'female';
export type Accent = { id: string; label: string; lang: string };
export type Language = { id: string; label: string; region: string; accents: Accent[] };
/** Global catalog: pick language (country group) -> accent -> male/female. */
export const LANGUAGES: Language[] = [
  { id: 'english', label: 'English', region: 'English', accents: [
    { id: 'en-us', label: 'United States', lang: 'en-US' }, { id: 'en-gb', label: 'United Kingdom', lang: 'en-GB' },
    { id: 'en-au', label: 'Australia', lang: 'en-AU' }, { id: 'en-ca', label: 'Canada', lang: 'en-CA' } ] },
  { id: 'african-english', label: 'African English', region: 'Africa', accents: [
    { id: 'ng-yoruba', label: 'Nigerian — Yoruba accent', lang: 'en-NG' }, { id: 'ng-igbo', label: 'Nigerian — Igbo accent', lang: 'en-NG' },
    { id: 'ng-hausa', label: 'Nigerian — Hausa accent', lang: 'en-NG' }, { id: 'gh', label: 'Ghanaian', lang: 'en-GH' },
    { id: 'ke', label: 'Kenyan (Swahili)', lang: 'sw-KE' }, { id: 'za', label: 'South African', lang: 'en-ZA' } ] },
  { id: 'french', label: 'French', region: 'Europe', accents: [{ id: 'fr-fr', label: 'France', lang: 'fr-FR' }] },
  { id: 'spanish', label: 'Spanish', region: 'Europe / Americas', accents: [{ id: 'es-es', label: 'Spain', lang: 'es-ES' }, { id: 'es-mx', label: 'Mexico', lang: 'es-MX' }] },
  { id: 'german', label: 'German', region: 'Europe', accents: [{ id: 'de-de', label: 'Germany', lang: 'de-DE' }] },
  { id: 'italian', label: 'Italian', region: 'Europe', accents: [{ id: 'it-it', label: 'Italy', lang: 'it-IT' }] },
  { id: 'portuguese', label: 'Portuguese', region: 'Europe / Americas', accents: [{ id: 'pt-pt', label: 'Portugal', lang: 'pt-PT' }, { id: 'pt-br', label: 'Brazil', lang: 'pt-BR' }] },
  { id: 'hindi', label: 'Hindi', region: 'Asia', accents: [{ id: 'hi-in', label: 'India', lang: 'hi-IN' }] },
  { id: 'arabic', label: 'Arabic', region: 'Asia', accents: [{ id: 'ar-sa', label: 'Arabic (Standard)', lang: 'ar-SA' }] },
  { id: 'chinese', label: 'Chinese', region: 'Asia', accents: [{ id: 'zh-cn', label: 'Mandarin', lang: 'zh-CN' }] },
  { id: 'japanese', label: 'Japanese', region: 'Asia', accents: [{ id: 'ja-jp', label: 'Japan', lang: 'ja-JP' }] },
  { id: 'korean', label: 'Korean', region: 'Asia', accents: [{ id: 'ko-kr', label: 'Korea', lang: 'ko-KR' }] },
];
/** Stored voice id: "<accentId>:<gender>", e.g. "ng-igbo:female". */
export type VoiceId = string;
export const voiceId = (accentId: string, gender: Gender) => `${accentId}:${gender}`;
export function parseVoiceId(id: VoiceId): { language: Language; accent: Accent; gender: Gender } {
  const [aid, g] = id.split(':');
  for (const language of LANGUAGES) { const accent = language.accents.find(a => a.id === aid); if (accent) return { language, accent, gender: g === 'male' ? 'male' : 'female' }; }
  // Legacy ids from the first version (male-ng, female-us, ...)
  const legacy = /^(male|female)-(ng|us)$/.exec(id);
  if (legacy) return parseVoiceId(voiceId(legacy[2] === 'ng' ? 'ng-yoruba' : 'en-us', legacy[1] as Gender));
  return { language: LANGUAGES[0], accent: LANGUAGES[0].accents[0], gender: 'female' };
}
export const voiceLabel = (id: VoiceId) => { const v = parseVoiceId(id); return `${v.language.label} · ${v.accent.label} · ${v.gender === 'male' ? 'Male' : 'Female'}`; };

export type VoiceJob = { id: string; script: string; voice: VoiceId; speed: number; pitch: number; provider: 'browser' | 'api'; createdAt: string };

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Recognises Code Engine prompts like "Build voice over for my product launch". Returns the script or null. */
export function parseVoiceOverCommand(text: string): string | null {
  const m = text.trim().match(/^build\s+(?:a\s+)?voice[\s-]?over\s+for\s*:?\s*([\s\S]*)$/i);
  return m ? (m[1] ?? '').trim() : null;
}

export function readLocalJobs(): VoiceJob[] {
  try { const v = JSON.parse(localStorage.getItem(VOICE_STORAGE_KEY) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
}
export function saveLocalJob(job: VoiceJob) {
  localStorage.setItem(VOICE_STORAGE_KEY, JSON.stringify([job, ...readLocalJobs().filter(j => j.id !== job.id)].slice(0, 50)));
}

function pickVoice(id: VoiceId): SpeechSynthesisVoice | undefined {
  const { accent, gender } = parseVoiceId(id);
  const cfg = { lang: accent.lang, gender };
  const all = speechSynthesis.getVoices();
  const norm = (l: string) => l.replace('_', '-');
  const byLang = all.filter(v => norm(v.lang).startsWith(cfg.lang));
  const base = cfg.lang.split('-')[0];
  const pool = byLang.length ? byLang : all.filter(v => norm(v.lang).startsWith(base));
  const gendered = pool.find(v => (cfg.gender === 'female' ? /female|woman|samantha|zira|aria|jenny|ezinne/i : /male|man|daniel|david|guy|abeo/i).test(v.name) && !(cfg.gender === 'male' && /female/i.test(v.name)));
  return gendered ?? pool[0];
}

/** DEMO: plays through the browser's built-in voices. Browsers expose no audio stream, so this cannot be downloaded. */
export function speakInBrowser(script: string, voice: VoiceId, speed: number, pitch: number, onEnd: () => void) {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(script);
  const v = pickVoice(voice); if (v) u.voice = v;
  u.lang = parseVoiceId(voice).accent.lang;
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
