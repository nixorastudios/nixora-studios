import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VOICES, MAX_SCRIPT, VOICE_HANDOFF_KEY, generateWithApi, readLocalJobs, saveLocalJob, speakInBrowser, type VoiceId, type VoiceJob } from '@/lib/voice-over';

export const Route = createFileRoute('/tools/voice-over')({
  head: () => ({
    meta: [
      { title: 'Voice Over Engine — NIXORA STUDIOS' },
      { name: 'description', content: 'Type a script, pick a Nigerian or US voice, adjust speed and pitch, and hear your voice over.' },
      { property: 'og:title', content: 'Voice Over Engine — NIXORA STUDIOS' },
      { property: 'og:description', content: 'Script-to-voice narration with Nigerian and US voices.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  staticData: { sitemap: false },
  component: VoiceOver,
});

function VoiceOver() {
  const [script, setScript] = useState('');
  const [voice, setVoice] = useState<VoiceId>('female-ng');
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
    if (!data.user) return setStatus('Saved on this device. Sign in to also save to your cloud.');
    const { error } = await supabase.from('voice_jobs').insert({ script, voice, speed, pitch, provider: job.provider });
    setStatus(error ? `Saved on this device; cloud save failed: ${error.message}` : 'Saved on this device and to your cloud.');
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
          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            {VOICES.map(v => (
              <button key={v.id} onClick={() => setVoice(v.id)} className={`rounded-xl border-2 p-3 text-sm font-medium ${voice === v.id ? 'border-[#FF6B00] bg-[#FF6B00]/10' : 'border-[#e5e5e5]'}`}>{v.label}</button>
            ))}
          </div>
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
                  <span className="truncate">{j.script}</span>
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
