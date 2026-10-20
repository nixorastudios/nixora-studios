import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { LockKeyhole, X } from 'lucide-react';
import { TOOLS, type ToolConfig } from '@/lib/tools';
import cameraHero from '@/assets/launch-studio.jpg';

const title = 'NIXORA STUDIOS — Coming Soon · Global AI Video Studio';
const description = 'Ten creative AI engines. One global studio. NIXORA STUDIOS launches October 24, 2026.';
export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title }, { name: 'description', content: description }, { property: 'og:title', content: title }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: Index,
});

const draftKey = (slug: string) => `nixora_launch_prompt_${slug}`;

function Index() {
  const [selectedTool, setSelectedTool] = useState<ToolConfig | null>(null);
  const [prompt, setPrompt] = useState('');
  const [notice, setNotice] = useState('');
  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const closeTool = () => {
    setSelectedTool(null);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!selectedTool) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeTool();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [selectedTool]);

  const openTool = (tool: ToolConfig, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setNotice('');
    setPrompt(localStorage.getItem(draftKey(tool.slug)) ?? '');
    setSelectedTool(tool);
  };

  const saveDraft = (value: string) => {
    setPrompt(value);
    if (selectedTool) localStorage.setItem(draftKey(selectedTool.slug), value);
  };

  return <div className="launch-theme camera-home min-h-screen text-foreground">
    <main>
      <section className="camera-single-hero relative flex min-h-[80svh] items-center px-8 py-16 md:px-16">
        <img src={cameraHero} alt="" className="absolute inset-0 size-full object-cover object-right" aria-hidden="true" />
        <div className="camera-hero-shade absolute inset-0" aria-hidden="true" />
        <div className="relative max-w-4xl">
          <p className="mb-4 text-sm text-primary">A NEW ERA OF STORYTELLING</p>
          <h1 className="mb-4 text-5xl leading-tight font-black sm:text-6xl md:text-8xl">NIXORA STUDIOS.</h1>
          <p className="mb-6 text-xl text-foreground/80">Coming Soon — Global AI Video Studio</p>
          <p className="text-foreground/60">LAUNCHING OCTOBER 24, 2026</p>
        </div>
      </section>
      <section className="bg-background px-8 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-center text-3xl font-bold md:text-4xl">One studio. Ten engines.</h2>
          <p className="mb-12 text-center text-primary">TOOLS TO BUILD YOUR WORLD</p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {TOOLS.map(tool => <button type="button" key={tool.slug} data-tool={tool.slug} aria-haspopup="dialog" onClick={e => openTool(tool, e.currentTarget)} className="camera-engine flex min-h-24 w-full cursor-pointer flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-6 text-left text-card-foreground">
              <h3 className="font-bold">{tool.name}</h3>
              <span className="flex items-center gap-2 text-sm text-launch-card-muted">Coming soon <LockKeyhole className="size-4 shrink-0" aria-label="Locked" /></span>
            </button>)}
          </div>
        </div>
      </section>
    </main>
    <footer className="camera-footer border-t border-border px-8 py-10 text-center">
      <p>Nixora Studios © 2026 - GOD MODE ACTIVE</p>
      <a href="mailto:support@nixorastudios.com" className="mt-2 inline-block text-primary hover:underline">support@nixorastudios.com</a>
    </footer>
    {selectedTool && <div className="fixed inset-0 z-50 flex items-center justify-center bg-camera-scrim p-4 backdrop-blur-sm" onClick={closeTool}>
      <div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="tool-title" onClick={e => e.stopPropagation()} className="camera-modal max-h-[90svh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card p-8 text-card-foreground outline-none">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h3 id="tool-title" className="text-2xl font-black">{selectedTool.name}</h3>
          <button type="button" onClick={closeTool} aria-label="Close" className="cursor-pointer text-launch-card-muted hover:text-card-foreground"><X className="size-6" /></button>
        </div>
        <p className="mb-4 text-launch-card-muted">What do you want to create?</p>
        <textarea value={prompt} onChange={e => saveDraft(e.target.value)} placeholder={`Describe your ${selectedTool.name.toLowerCase()} idea... e.g., A cinematic shot of...`} className="h-32 w-full rounded-xl border-2 border-camera-line bg-card p-4 text-card-foreground outline-none focus:border-primary" />
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={() => setNotice(`${selectedTool.name} opens October 24, 2026. Nothing was generated — your draft stays on this device.`)} className="w-full cursor-pointer rounded-xl bg-primary py-3 font-bold text-primary-foreground hover:opacity-90">Generate with {selectedTool.name} — Coming Oct 24</button>
        </div>
        {notice && <p role="status" className="mt-4 text-center text-sm text-primary">{notice}</p>}
        <p className="mt-4 flex items-center justify-center gap-2 text-center text-sm text-launch-card-muted"><LockKeyhole className="size-4 shrink-0" aria-hidden="true" /> Module launches Oct 24, 2026.</p>
      </div>
    </div>}
  </div>;
}
