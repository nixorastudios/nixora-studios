import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getOwnerStatus } from '@/lib/owner.functions';
import { pushProjectToGitHub } from '@/lib/github.functions';
import { LANGUAGES, parseVoiceId, voiceId, voiceLabel, type Gender, MAX_SCRIPT, VOICE_HANDOFF_KEY, generateWithApi, readLocalJobs, saveLocalJob, speakInBrowser, type VoiceId, type VoiceJob } from '@/lib/voice-over';

export const Route = createFileRoute('/tools/voice-over')({
  head: () => ({
    meta: [
      { title: 'Voice Over Engine — NIXORA STUDIOS' },
      { name: 'description', content: 'Type a script, pick from global languages and accents, adjust speed and pitch, and hear your voice over.' },
      { property: 'og:title', content: 'Voice Over Engine — NIXORA STUDIOS' },
      { property: 'og:description', content: 'Script-to-voice narration in global languages and accents.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  staticData: { sitemap: false },
  component: VoiceOver,
});

function VoiceOver() {
  const [script, setScript] = useState('');
  const [voice, setVoice] = useState<VoiceId>(voiceId('ng-yoruba', 'female'));
  const sel = parseVoiceId(voice);
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [audio, setAudio] = useState<Blob | null>(null);
  const [status, setStatus] = useState('');
  const [jobs, setJobs] = useState<VoiceJob[]>([]);

  useEffect(() => {
    setJobs(readLocalJobs());
    const h = sessionStorage.getItem(VOICE_HANDOFF_KEY);
    if (h) { setScript(h); sessionStorage.removeItem(VOICE_HANDOFF_KEY); setStatus('Script received from CODE ENGINE.'); }
    speechSynthesis?.getVoices();
    return () => speechSynthesis?.cancel();
  }, []);

  const generate = async () => {
    if (!script.trim()) return setStatus('Type a script first.');
    setStatus('Generating…');
    const blob = await generateWithApi({ script, voice, speed, pitch });
    if (blob) { setAudio(blob); setStatus('Studio voice ready.'); return; }
    setAudio(null);
    if (!('speechSynthesis' in window)) return setStatus('This browser has no built-in voices.');
    setSpeaking(true); setStatus('Demo voice playing (browser voice).');
    speakInBrowser(script, voice, speed, pitch, () => setSpeaking(false));
  };
  const stop = () => { speechSynthesis.cancel(); setSpeaking(false); };

  const download = (ext: 'mp3' | 'wav') => {
    if (!audio) return;
    const a = document.createElement('a'); a.href = URL.createObjectURL(audio); a.download = `nixora-voice.${ext}`; a.click();
  };

  const save = async () => {
    if (!script.trim()) return setStatus('Type a script first.');
    const job: VoiceJob = { id: crypto.randomUUID(), script, voice, speed, pitch, provider: audio ? 'api' : 'browser', createdAt: new Date().toISOString() };
    saveLocalJob(job); setJobs(readLocalJobs());
    const { data } = await supabase.auth.getUser();
    if (!data.user) return setStatus('Saved on this device - Login to save to Cloud');
    setStatus('Saving to NIXORA Cloud…');
    const { error } = await supabase.from('voice_jobs').insert({ id: job.id, user_id: data.user.id, script, voice, speed, pitch, provider: job.provider });
    if (error) return setStatus(`Saved on this device; NIXORA Cloud save failed: ${error.message}`);
    let msg = '✅ Saved to NIXORA Cloud - Available on any device';
    // GitHub backup is owner-only (server-side role check).
    try {
      const { isOwner } = await getOwnerStatus();
      if (isOwner) {
        const r = await pushProjectToGitHub({ data: { projectId: job.id, name: `Voice draft ${job.createdAt.slice(0, 10)}`, repo: 'nixora-voice-drafts', files: [{ path: `voice-drafts/${job.id}.json`, content: JSON.stringify({ ...job, voiceLabel: voiceLabel(job.voice) }, null, 2) }] } });
        msg += ` · Pushed to GitHub (${r.repo})`;
      }
    } catch (e) { msg += ` · GitHub push failed: ${e instanceof Error ? e.message.slice(0, 120) : 'unknown error'}`; }
    setStatus(msg);
  };

  const card = 'rounded-[20px] bg-[#FFFFFF] p-6 text-[#0a0a0a] shadow-lg';
  const btn = 'rounded-full px-5 py-2 text-sm font-semibold transition disabled:opacity-40';
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-8 text-[#FFFFFF]">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link to="/" className="text-sm text-[#FF6B00]">‹ Back to Home</Link>
        <h1 className="text-4xl font-bold tracking-tight">🎙️ Voice Over <span className="text-[#FF6B00]">Engine</span></h1>
        <section className={card}>
          <label className="text-sm font-semibold" htmlFor="script">Script</label>
          <textarea id="script" value={script} maxLength={MAX_SCRIPT} onChange={e => setScript(e.target.value)} rows={7} placeholder="Type what the voice should say…" className="mt-2 w-full rounded-xl border border-[#d4d4d4] p-3 outline-none focus:border-[#FF6B00]" />
          <p className="text-right text-xs text-[#737373]">{script.length}/{MAX_SCRIPT}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="text-sm font-semibold">Language / country
              <select value={sel.language.id} onChange={e => { const l = LANGUAGES.find(x => x.id === e.target.value)!; setVoice(voiceId(l.accents[0]!.id, sel.gender)); }} className="mt-1 w-full rounded-xl border border-[#d4d4d4] p-2 text-sm outline-none focus:border-[#FF6B00]">
                {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label} ({l.region})</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold">Accent
              <select value={sel.accent.id} onChange={e => setVoice(voiceId(e.target.value, sel.gender))} className="mt-1 w-full rounded-xl border border-[#d4d4d4] p-2 text-sm outline-none focus:border-[#FF6B00]">
                {sel.language.accents.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
            </label>
            <div className="text-sm font-semibold">Voice
              <div className="mt-1 grid grid-cols-2 gap-1 rounded-xl border border-[#d4d4d4] p-1" role="group" aria-label="Male or female voice">
                {(['male', 'female'] as Gender[]).map(g => <button key={g} onClick={() => setVoice(voiceId(sel.accent.id, g))} aria-pressed={sel.gender === g} className={`rounded-lg py-1.5 text-sm ${sel.gender === g ? 'bg-[#FF6B00] text-[#FFFFFF]' : ''}`}>{g === 'male' ? 'Male' : 'Female'}</button>)}
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-[#737373]">Browser demo uses device voices. Real global voices unlock with real TTS service (OpenAI / ElevenLabs) - same voice on every device worldwide.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm">Speed: {speed.toFixed(1)}×<input type="range" min={0.5} max={2} step={0.1} value={speed} onChange={e => setSpeed(+e.target.value)} className="w-full accent-[#FF6B00]" /></label>
            <label className="text-sm">Pitch: {pitch.toFixed(1)}<input type="range" min={0} max={2} step={0.1} value={pitch} onChange={e => setPitch(+e.target.value)} className="w-full accent-[#FF6B00]" /></label>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <button onClick={generate} disabled={speaking} className={`${btn} bg-[#FF6B00] text-[#FFFFFF]`}>Generate Voice</button>
            {speaking ? <button onClick={stop} className={`${btn} bg-[#0a0a0a] text-[#FFFFFF]`}>Stop</button> : <button onClick={generate} className={`${btn} bg-[#0a0a0a] text-[#FFFFFF]`}>▶ Play</button>}
            <button onClick={() => download('mp3')} disabled={!audio} className={`${btn} border border-[#0a0a0a]`}>Download MP3</button>
            <button onClick={() => download('wav')} disabled={!audio} className={`${btn} border border-[#0a0a0a]`}>Download WAV</button>
            <button onClick={save} className={`${btn} border border-[#FF6B00] text-[#FF6B00]`}>Save to project</button>
          </div>
          {status && <p className="mt-3 text-sm text-[#525252]" role="status">{status}</p>}
          {!audio && <p className="mt-2 text-xs text-[#737373]">Demo mode uses your browser's voices — downloads unlock once the studio voice service is connected.</p>}
        </section>
        {jobs.length > 0 && (
          <section className={card}>
            <h2 className="font-semibold">Saved voice overs</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {jobs.slice(0, 10).map(j => (
                <li key={j.id} className="flex items-center justify-between gap-3 border-b border-[#eeeeee] pb-2">
                  <span className="truncate">{j.script} <span className="text-xs text-[#737373]">— {voiceLabel(j.voice)}</span></span>
                  <button className="shrink-0 text-[#FF6B00]" onClick={() => { setScript(j.script); setVoice(j.voice); setSpeed(j.speed); setPitch(j.pitch); }}>Load</button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
