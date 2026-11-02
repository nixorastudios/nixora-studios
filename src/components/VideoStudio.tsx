import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { ArrowLeft, ArrowUpRight, Check, Clapperboard, Download, Film, ImagePlus, Loader2, LogOut, Maximize, Play, RefreshCw, Save, Sparkles, Volume2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { variantPrompt } from '@/lib/video-studio';
import { generateStudioVideo, getStudioVideo, listStudioVideos } from '@/lib/video-studio.functions';
import { polishVideoPrompt } from '@/lib/prompt-polish.functions';
import { DEFAULT_VIDEO_SETTINGS, loadStartFrameDataUrl, stripStartFrame, videoSettingsSchema, type StudioJob, type VideoSettings } from '@/lib/video-studio';
import sample from '@/assets/video-studio-sample.jpg';

const samples = [
  { name: 'The last explorer', tag: 'SCI-FI · LANDSCAPE', prompt: 'A lone astronaut stands on a black volcanic coastline, looking out over the Atlantic as the sun breaks through storm clouds. The camera slowly pushes toward the astronaut; waves roll naturally against the rocks.' },
  { name: 'A quiet morning', tag: 'DOCUMENTARY · LIFESTYLE', prompt: 'A ceramic artist shapes a clay bowl at a spinning pottery wheel in a sunlit workshop. Close-up of careful hands and wet clay, soft dust in the morning light, natural realistic movement.' },
  { name: 'Into the city', tag: 'COMMERCIAL · URBAN', prompt: 'A cyclist rides through a rain-soaked city at blue hour. The camera tracks alongside, reflections ripple on the road, warm shop lights contrast against the cool evening sky.' },
];
const field = 'w-full rounded-md border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-primary';
export type StudioVariant = 'video' | 'animation' | 'lipsync';
const VARIANTS = {
  video: { tag: 'ENGINE 02 / MOTION', title: 'Text to video', label: 'SCENE DESCRIPTION', ph: 'Describe the subject, setting, and what happens…', audio: 'Sound direction', draft: 'nixora_video_studio_draft', preset: {} },
  animation: { tag: 'ENGINE 04 / ANIMATION', title: 'Animation', label: 'HOW SHOULD IT MOVE?', ph: 'e.g. the character turns, smiles and waves while leaves drift past…', audio: 'Sound direction', draft: 'nixora_animation_draft', preset: { style: 'Animation' as const, camera: 'Locked-off' as const } },
  lipsync: { tag: 'ENGINE 08 / LIPSYNC', title: 'Lipsync', label: 'SCENE & PERFORMANCE', ph: 'e.g. the woman looks into the camera and speaks warmly…', audio: 'Spoken line (exact words the character says)', draft: 'nixora_lipsync_draft', preset: { camera: 'Locked-off' as const, audio: '' } },
};
export function VideoStudio({ variant = 'video' }: { variant?: StudioVariant } = {}) {
  const V = VARIANTS[variant];
  const [settings, setSettings] = useState<VideoSettings>({ ...DEFAULT_VIDEO_SETTINGS, ...V.preset });
  const [userId, setUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [jobs, setJobs] = useState<StudioJob[]>([]);
  const [selected, setSelected] = useState<StudioJob | null>(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [consent, setConsent] = useState(false);
  const [view, setView] = useState<'preview' | 'library'>('preview');
  const [sampleIndex, setSampleIndex] = useState(0);
  const [frameBusy, setFrameBusy] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const create = useServerFn(generateStudioVideo);
  const refresh = useServerFn(getStudioVideo);
  const list = useServerFn(listStudioVideos);
  const polish = useServerFn(polishVideoPrompt);
  const active = jobs.find(job => ['submitting', 'queued', 'in_progress'].includes(job.status));

  useEffect(() => {
    try { const draft = localStorage.getItem(V.draft); if (draft) setSettings({ ...DEFAULT_VIDEO_SETTINGS, ...V.preset, ...JSON.parse(draft) }); } catch { /* Default settings remain usable. */ }
    try { const handoff = sessionStorage.getItem('nixora_handoff_image'); if (handoff) { sessionStorage.removeItem('nixora_handoff_image'); fetch(handoff).then(r => r.blob()).then(loadStartFrameDataUrl).then(frame => { setSettings(s => ({ ...s, startFrame: frame })); setNotice(variant === 'lipsync' ? 'Your image is loaded as the speaking character. Type the exact line they should say, then generate.' : 'Your image from Text to Image is set as the opening frame. Describe the motion, then generate.'); }).catch(() => {}); } } catch { /* no handoff */ }
    supabase.auth.getSession().then(({ data }) => { setUserId(data.session?.user.id || null); setAuthReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => { setUserId(session?.user.id || null); setAuthReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!userId) { setJobs([]); setSelected(null); return; }
    let cancelled = false;
    list().then(rows => { if (!cancelled) { setJobs(rows); setSelected(rows[0] || null); } }).catch(() => setNotice('Your library could not be loaded.'));
    return () => { cancelled = true; };
  }, [userId]);
  useEffect(() => {
    if (!active || !userId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const result = await refresh({ data: { id: active.id } });
        if (cancelled) return;
        if (!result.ok) { setNotice(result.error); return; }
        setJobs(old => old.map(job => job.id === result.job.id ? result.job : job));
        setSelected(result.job);
        if (result.job.error) setNotice(result.job.error);
        if (['queued', 'in_progress', 'submitting'].includes(result.job.status)) timer = setTimeout(poll, 8000);
      } catch (error) { if (!cancelled) setNotice(error instanceof Error ? error.message : 'Status unavailable. Refresh the video status to continue.'); }
    };
    timer = setTimeout(poll, 8000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [active?.id, userId]);

  const update = <K extends keyof VideoSettings>(key: K, value: VideoSettings[K]) => setSettings(old => ({ ...old, [key]: value }));
  const save = () => { try { localStorage.setItem(V.draft, JSON.stringify(stripStartFrame(settings))); setNotice('Shot draft saved on this device.'); } catch { setNotice('Your browser could not save this draft.'); } };
  const onFramePicked = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try { update('startFrame', await loadStartFrameDataUrl(file)); setNotice(''); }
    catch { setNotice('That image could not be prepared. Try a JPG, PNG or WebP photo instead.'); }
  };
  const animateStill = async () => {
    setFrameBusy(true);
    try {
      const blob = await (await fetch(sample)).blob();
      update('startFrame', await loadStartFrameDataUrl(blob));
      setNotice('The concept still is set as your opening frame. Describe the motion, then generate.');
    } catch { setNotice('The still could not be prepared as a start frame.'); }
    finally { setFrameBusy(false); }
  };
  const signIn = async (provider: 'google' | 'lovable') => {
    save();
    try { const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/tools/text-to-video` }); if (result.error) setNotice(result.error.message); }
    catch { setNotice('Sign-in could not finish. Please try again.'); }
  };
  const generate = async () => {
    if (variant !== 'video' && !settings.startFrame) { setNotice('Add a character or image first — it is the starting frame for this engine.'); return; }
    if (variant === 'lipsync' && settings.audio.trim().length < 2) { setNotice('Type the exact line the character should say.'); return; }
    const parsed = videoSettingsSchema.safeParse({ ...settings, prompt: variantPrompt(variant, settings), consent });
    if (!parsed.success) { setNotice(parsed.error.issues[0]?.message || 'Check your shot settings.'); return; }
    if (!userId) { setNotice('Sign in to generate and keep your videos private.'); return; }
    setBusy(true); setNotice('');
    try {
      const result = await create({ data: parsed.data });
      if (!result.ok) { setNotice(result.error); return; }
      setJobs(old => [result.job, ...old]); setSelected(result.job); setView('preview');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Submission could not be confirmed. Do not resubmit automatically.'); }
    finally { setBusy(false); }
  };
  const polishIdea = async () => {
    if (!settings.prompt.trim()) { setNotice('Describe your scene first.'); return; }
    setPolishing(true); setNotice('');
    try { const result = await polish({ data: { idea: settings.prompt, engine: 'TEXT TO VIDEO' } }); if (result.ok) update('prompt', result.prompt); else setNotice(result.error); }
    catch { setNotice('Prompt polishing could not finish. Your original idea is unchanged.'); }
    finally { setPolishing(false); }
  };
  const refreshSelected = async () => {
    if (!selected) return;
    try { const result = await refresh({ data: { id: selected.id } }); if (result.ok) { setSelected(result.job); setJobs(old => old.map(job => job.id === result.job.id ? result.job : job)); } else setNotice(result.error); }
    catch { setNotice('Status could not be refreshed.'); }
  };
  const download = async () => {
    if (!selected?.url) return;
    try { const response = await fetch(selected.url); if (!response.ok) throw new Error(); const url = URL.createObjectURL(await response.blob()); const link = document.createElement('a'); link.href = url; link.download = `nixora-${selected.id}.mp4`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
    catch { setNotice('Download could not finish. Refresh the video status and try again.'); }
  };
  const rendering = selected && ['queued', 'in_progress', 'submitting'].includes(selected.status);

  return <div className="video-studio min-h-screen bg-background text-foreground">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4 lg:px-8">
      <div className="flex items-center gap-4"><Button asChild variant="ghost" size="icon" title="Back to home"><Link to="/"><ArrowLeft /></Link></Button><Link to="/" className="text-lg font-extrabold">NIXORA<span className="text-primary">.</span></Link><span className="hidden border-l border-border pl-4 text-xs text-muted-foreground sm:block">PRODUCTION STUDIO</span></div>
      <div className="flex items-center gap-3"><span className="text-xs text-muted-foreground">TEXT TO VIDEO · EARLY PREVIEW</span>{userId && <Button variant="ghost" size="icon" title="Sign out" onClick={() => supabase.auth.signOut()}><LogOut /></Button>}</div>
    </header>
    <div className="mx-auto max-w-[1600px] px-5 py-7 lg:px-8">
      <div className="mb-7 flex items-end justify-between gap-4"><div><p className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary"><Clapperboard className="size-4" /> {V.tag}</p><h1 className="text-3xl font-bold sm:text-4xl">{V.title}<span className="text-primary">.</span></h1></div><span className="hidden text-sm text-muted-foreground md:block">Your vision. Every frame.</span></div>
      <div className="grid gap-7 xl:grid-cols-[390px_minmax(0,1fr)]">
        <section aria-label="Shot direction" className="min-w-0 space-y-5">
          <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">01 / Shot direction</h2><Button variant="ghost" size="icon" onClick={save} title="Save shot draft"><Save /></Button></div>
          <div className="rounded-lg border border-border bg-card p-4"><label htmlFor="video-prompt" className="text-xs font-semibold text-muted-foreground">{V.label}</label><textarea id="video-prompt" className="mt-3 min-h-40 w-full resize-y bg-transparent text-sm leading-6 outline-none" placeholder={V.ph} maxLength={4000} value={settings.prompt} onChange={e => update('prompt', e.target.value)} /><div className="flex items-center justify-between border-t border-border pt-2"><span className="text-xs text-muted-foreground">{settings.prompt.length}/4000</span><Button variant="ghost" size="sm" onClick={polishIdea} disabled={polishing || settings.prompt.length > 1200}><Sparkles />{polishing ? 'Polishing…' : 'Polish my idea with AI'}</Button></div></div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between"><span className="text-xs font-semibold text-muted-foreground">START FRAME · OPTIONAL</span>{settings.startFrame && <Button variant="ghost" size="icon" title="Remove start frame" onClick={() => update('startFrame', undefined)}><X /></Button>}</div>
            {settings.startFrame ? <img src={settings.startFrame} alt="Chosen opening frame" className="mt-3 max-h-44 w-full rounded object-cover" /> : <label className="mt-3 flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-border p-5 text-center text-xs text-muted-foreground transition-colors hover:border-primary"><ImagePlus className="size-5 text-primary" />Choose an image — it becomes the opening frame<input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onFramePicked} /></label>}
            <p className="mt-2 text-[11px] text-muted-foreground">The image stays the first frame; describe the motion. Match the aspect ratio to your image for the cleanest result.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">{(['style', 'camera', 'lighting'] as const).map(key => <label key={key} className={key === 'lighting' ? 'col-span-2 text-xs text-muted-foreground' : 'text-xs text-muted-foreground'}>{key === 'camera' ? 'Camera movement' : key === 'style' ? 'Visual treatment' : 'Lighting'}<select value={settings[key]} onChange={e => update(key, e.target.value as VideoSettings[typeof key])} className={`${field} mt-2`}>{(key === 'style' ? ['Cinematic','Documentary','Animation','Commercial'] : key === 'camera' ? ['Slow dolly','Locked-off','Tracking','Aerial','Handheld'] : ['Golden hour','Natural daylight','Studio softbox','Neon night','Moody low-key']).map(option => <option key={option}>{option}</option>)}</select></label>)}</div>
          <div className="border-t border-border pt-5"><h2 className="mb-4 text-sm font-semibold">02 / Output settings</h2><div className="grid grid-cols-2 gap-3"><label className="text-xs text-muted-foreground">Aspect ratio<select className={`${field} mt-2`} value={settings.ratio} onChange={e => update('ratio', e.target.value as VideoSettings['ratio'])}><option value="16:9">16:9 · Landscape</option><option value="9:16">9:16 · Portrait</option></select></label><label className="text-xs text-muted-foreground">Resolution<select className={`${field} mt-2`} value={settings.resolution} onChange={e => update('resolution', e.target.value as VideoSettings['resolution'])}><option>720p</option><option>1080p</option></select></label></div><label className="mt-4 block text-xs text-muted-foreground">Duration <span className="float-right text-foreground">{settings.duration} seconds</span><input type="range" min={3} max={10} step={1} value={settings.duration} onChange={e => update('duration', Number(e.target.value))} className="mt-3 w-full accent-primary" /></label></div>
          <label className="block text-xs text-muted-foreground"><span className="mb-2 flex items-center gap-2"><Volume2 className="size-3" /> {V.audio}</span><input value={settings.audio} placeholder={variant === 'lipsync' ? 'e.g. Welcome to NIXORA STUDIOS.' : undefined} onChange={e => update('audio', e.target.value)} maxLength={500} className={field} /></label>
          <details className="text-xs text-muted-foreground"><summary className="cursor-pointer">Exclusions</summary><textarea aria-label="Exclusions" value={settings.exclusions} onChange={e => update('exclusions', e.target.value)} maxLength={500} className={`${field} mt-3`} /></details>
          <label className="flex gap-3 text-xs leading-5 text-muted-foreground"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1 accent-primary" />AI processing consent: I agree to send this prompt and any chosen start frame image to the video provider. Generation uses workspace AI credits; this is not the launch credit wallet.</label>
          {authReady && !userId && <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => signIn('google')}>Sign in with Google</Button><Button variant="outline" onClick={() => signIn('lovable')}>Sign in with Lovable</Button></div>}
          <Button className="h-12 w-full text-sm font-bold" onClick={generate} disabled={busy || !!active || !authReady}>{busy || active ? <Loader2 className="animate-spin" /> : <Film />}{busy ? 'Submitting shot…' : active ? 'Rendering in progress' : 'Generate video'}<ArrowUpRight /></Button>
          {notice && <p role="status" className="break-words rounded-md border border-border p-3 text-sm leading-5 text-foreground">{notice}</p>}
        </section>
        <section aria-label="Video output" className="min-w-0">
          <div className="mb-4 flex items-center justify-between border-b border-border"><div className="flex gap-2"><Button variant="ghost" onClick={() => setView('preview')} className={view === 'preview' ? 'video-active-tab' : 'text-muted-foreground'}><Play />Preview</Button><Button variant="ghost" onClick={() => setView('library')} className={view === 'library' ? 'video-active-tab' : 'text-muted-foreground'}><Film />My renders <span className="text-xs">{jobs.length}</span></Button></div><span className="text-xs text-muted-foreground">{selected?.url ? 'SAVED PRIVATELY' : 'GEMINI OMNI'}</span></div>
          {view === 'preview' ? <><div className="video-screen relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-border bg-card">
            {selected?.url ? <video ref={videoRef} key={selected.url} src={selected.url} controls playsInline className="size-full object-contain" /> : <img src={sample} width={1536} height={864} alt="3D render of a golden vintage film camera wrapped in flowing orange silk" className={`size-full object-cover ${rendering ? 'opacity-30' : ''}`} />}
            {!selected && <span className="absolute left-4 top-4 rounded border border-border bg-background/80 px-2 py-1 text-[10px] font-semibold">CONCEPT STILL · NOT A GENERATED VIDEO</span>}
            {!selected && <Button size="sm" variant="outline" className="absolute bottom-4 right-4" onClick={animateStill} disabled={frameBusy}>{frameBusy ? <Loader2 className="animate-spin" /> : <ImagePlus />}{frameBusy ? 'Preparing…' : 'Animate this still'}</Button>}
            {rendering && <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/50"><Loader2 className="size-8 animate-spin text-primary" /><p className="font-semibold">Rendering your shot</p><p className="text-sm text-muted-foreground">{selected.status.replaceAll('_', ' ')}{selected.progress > 0 ? ` · ${selected.progress}%` : ''}</p></div>}
            {selected?.status === 'failed' && <div className="absolute inset-0 flex items-center justify-center bg-background/80 p-8 text-center"><p>{selected.error || 'This generation could not finish.'}</p></div>}
          </div><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><div className="text-xs text-muted-foreground">{selected ? `${selected.settings.resolution} / ${selected.settings.ratio} / ${selected.settings.duration}s` : '16:9 / CINEMATIC CONCEPT'}<span className="ml-3 text-primary">{selected?.url ? 'COMPLETE' : rendering ? 'IN PRODUCTION' : 'READY TO CREATE'}</span></div><div className="flex gap-1"><Button variant="ghost" size="icon" title="Refresh video status" onClick={refreshSelected} disabled={!selected}><RefreshCw /></Button><Button variant="ghost" size="icon" title="Fullscreen video" onClick={() => videoRef.current?.requestFullscreen()} disabled={!selected?.url}><Maximize /></Button><Button variant="outline" size="sm" onClick={download} disabled={!selected?.url}><Download />Download MP4</Button></div></div>
          <div className="mt-9 border-t border-border pt-6"><div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold">A starting point for your next scene</h2><span className="text-xs text-muted-foreground">PROMPT STUDIES</span></div><div className="grid gap-3 sm:grid-cols-3">{samples.map((item, index) => <Button key={item.name} variant="outline" className={`h-auto min-h-28 flex-col items-start whitespace-normal p-4 text-left ${sampleIndex === index ? 'border-primary bg-primary/5' : ''}`} onClick={() => { setSampleIndex(index); update('prompt', item.prompt); }}><span className="text-[10px] text-primary">{item.tag}</span><span className="text-sm font-semibold">{item.name}</span><span className="flex w-full justify-between text-xs text-muted-foreground">Use this idea <ArrowUpRight className="size-3" /></span></Button>)}</div></div></> : <div className="grid gap-4 sm:grid-cols-2">{jobs.length ? jobs.map(job => <article key={job.id} className="overflow-hidden rounded-lg border border-border bg-card">{job.url ? <video src={job.url} controls preload="metadata" className="aspect-video w-full object-contain" /> : <div className="flex aspect-video items-center justify-center text-muted-foreground"><Clapperboard className="size-8" /></div>}<div className="space-y-3 p-4"><p className="line-clamp-2 text-sm">{job.prompt}</p><p className="text-xs text-muted-foreground">{job.status.replaceAll('_',' ')} · {job.settings.duration}s · {job.settings.resolution}</p><Button variant="outline" size="sm" onClick={() => { setSelected(job); setView('preview'); }}>Open render</Button></div></article>) : <div className="col-span-full py-20 text-center text-muted-foreground"><Film className="mx-auto mb-4 size-8" /><p>{userId ? 'Your first film starts with a scene.' : 'Sign in to view your private renders.'}</p></div>}</div>}
          <p className="mt-8 flex items-center gap-2 text-xs text-muted-foreground"><Check className="size-3 text-video-success" /> Private outputs · Single-shot generation · Generated soundtrack</p>
        </section>
      </div>
    </div>
  </div>;
}