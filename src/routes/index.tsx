import { createFileRoute, Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { polishVideoPrompt } from '@/lib/prompt-polish.functions';
import { useEffect, useRef, useState } from 'react';
import { LockKeyhole, X } from 'lucide-react';
import { TOOLS, type ToolConfig } from '@/lib/tools';
import cameraHero from '@/assets/launch-studio.jpg';
import { Button } from '@/components/ui/button';
import { readLocalWaitlist, saveLaunchDraft, saveLocalWaitlist } from '@/lib/launch';
import models from '@/lib/models.json';

const homepageTools = models.flatMap(model => {
  const tool = TOOLS.find(tool => tool.slug === model.slug);
  return tool ? [tool] : [];
});

const title = 'NIXORA STUDIOS — Coming Soon · Global AI Video Studio';
const description = '10 engines in 1. One global studio. NIXORA STUDIOS launches November 23, 2026.';
export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title }, { name: 'description', content: description }, { property: 'og:title', content: title }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  staticData: { sitemap: true },
  component: Index,
});

const draftKey = (slug: string) => `nixora_launch_prompt_${slug}`;

const VIDEO_ENGINES = new Set(['text-to-video', 'photo-to-video', 'animation', 'lipsync', 'video-editor']);

function Index() {
  const [selectedTool, setSelectedTool] = useState<ToolConfig | null>(null);
  const [prompt, setPrompt] = useState('');
  const [notice, setNotice] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [polishing, setPolishing] = useState(false);
  const runPolish = useServerFn(polishVideoPrompt);
  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try { setWaitlistCount(readLocalWaitlist(localStorage).length); } catch { /* Browser storage may be unavailable. */ }
  }, []);

  const closeTool = () => {
    setSelectedTool(null);
    setShowSuccess(false);
    setEmail('');
    setPolishing(false);
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
    setShowSuccess(false);
    setEmail('');
    setPolishing(false);
    setPrompt(localStorage.getItem(draftKey(tool.slug)) ?? '');
    setSelectedTool(tool);
  };

  const saveDraft = (value: string) => {
    setPrompt(value);
    if (selectedTool) localStorage.setItem(draftKey(selectedTool.slug), value);
  };

  const confirmDraft = () => {
    if (!selectedTool) return;
    if (!prompt.trim()) return window.alert('Enter prompt first');
    try {
      saveLaunchDraft(localStorage, selectedTool.name, prompt, new Date());
      setNotice('');
      setShowSuccess(true);
    } catch {
      setNotice('Your draft could not be saved. Please allow browser storage and try again.');
    }
  };

  const polishIdea = async () => {
    if (!selectedTool) return;
    if (!prompt.trim()) { setNotice('Enter your idea first'); return; }
    setPolishing(true);
    setNotice('');
    try {
      const result = await runPolish({ data: { idea: prompt, engine: selectedTool.name } });
      if (result.ok) {
        saveDraft(result.prompt);
        setNotice(`AI wrote a fuller version (“${result.title}”). Edit it freely — nothing has been generated.`);
      } else {
        setNotice(result.error);
      }
    } catch {
      setNotice('The AI could not finish this prompt. Please try again.');
    } finally {
      setPolishing(false);
    }
  };

  const joinWaitlist = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const emails = saveLocalWaitlist(localStorage, email);
      setWaitlistCount(emails.length);
      window.alert('Your email and idea are saved on this device only. They have not been sent to NIXORA STUDIOS, and no launch email will be sent.');
      closeTool();
      setPrompt('');
    } catch (error) {
      setNotice(error instanceof Error && error.message === 'Enter a valid email address.' ? error.message : 'Your email could not be saved. Please allow browser storage and try again.');
    }
  };

  const [earlyEmail, setEarlyEmail] = useState('');
  const joinEarlyAccess = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const emails = saveLocalWaitlist(localStorage, earlyEmail);
      setWaitlistCount(emails.length);
      window.alert('Your email is saved on this device only. It has not been sent to NIXORA STUDIOS, and no launch email will be sent.');
      setEarlyEmail('');
    } catch (error) {
      window.alert(error instanceof Error && error.message === 'Enter a valid email address.' ? error.message : 'Your email could not be saved. Please allow browser storage and try again.');
    }
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
          <p className="text-foreground/60">LAUNCHING NOVEMBER 23, 2026 - 10 ENGINES IN 1</p>
        </div>
      </section>
      <section id="engines" className="bg-background px-8 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-center text-3xl font-bold md:text-4xl">One studio. Ten engines.</h2>
          <p className="mb-12 text-center text-primary">TOOLS TO BUILD YOUR WORLD</p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {homepageTools.map(tool => <button type="button" key={tool.slug} data-tool={tool.slug} aria-haspopup="dialog" onClick={e => openTool(tool, e.currentTarget)} className="camera-engine flex min-h-24 w-full cursor-pointer flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-6 text-left text-card-foreground">
              <h3 className="font-bold">{tool.name}</h3>
              <span className="flex items-center gap-2 text-sm text-launch-card-muted">Coming soon <LockKeyhole className="size-4 shrink-0" aria-label="Locked" /></span>
            </button>)}
          </div>
        </div>
      </section>
    </main>
      <section id="early-access" className="border-t border-border bg-background px-8 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-center text-3xl font-bold md:text-4xl">Early Access — One Studio, Ten Engines</h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-foreground/70">Why juggle multiple subscriptions? NIXORA brings text-to-image, video, animation, voice, music, sound, lipsync, editing and code into one credit wallet.</p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col rounded-2xl bg-card p-8 text-card-foreground">
              <h3 className="text-xl font-bold">Starter</h3>
              <p className="mt-1 text-3xl font-black text-primary">100 Credits</p>
              <p className="mt-2 text-sm text-launch-card-muted">Perfect to explore</p>
              <p className="mt-4 font-bold">Early value ₦5,000</p>
              <p className="text-sm text-launch-card-muted">$5 USD</p>
              <p className="text-sm text-primary">Waitlist: 50% OFF on launch</p>
              <a href="#early-access-form" className="mt-6 inline-flex items-center justify-center rounded-xl border-2 border-primary px-4 py-3 text-center font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground">Join Waitlist — Priority Access</a>
            </div>
            <div className="relative flex flex-col rounded-2xl border-2 border-primary bg-card p-8 text-card-foreground">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">Most Popular</span>
              <h3 className="text-xl font-bold">Creator</h3>
              <p className="mt-1 text-3xl font-black text-primary">500 Credits + 100 Bonus</p>
              <p className="mt-2 text-sm text-launch-card-muted">For creators &amp; YouTubers</p>
              <p className="mt-4 font-bold">Early value ₦20,000</p>
              <p className="text-sm text-launch-card-muted">$20 USD</p>
              <p className="text-sm text-primary">Waitlist: 50% OFF</p>
              <a href="#early-access-form" className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-center font-bold text-primary-foreground transition-colors hover:bg-primary/90">Join Waitlist — Priority Access</a>
            </div>
            <div className="flex flex-col rounded-2xl bg-card p-8 text-card-foreground">
              <h3 className="text-xl font-bold">Studio</h3>
              <p className="mt-1 text-3xl font-black text-primary">2000 Credits + 500 Bonus</p>
              <p className="mt-2 text-sm text-launch-card-muted">For agencies &amp; teams</p>
              <p className="mt-4 font-bold">Early value ₦60,000</p>
              <p className="text-sm text-launch-card-muted">$60 USD</p>
              <p className="text-sm text-primary">Waitlist: 50% OFF + Priority Support</p>
              <a href="#early-access-form" className="mt-6 inline-flex items-center justify-center rounded-xl border-2 border-primary px-4 py-3 text-center font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground">Join Waitlist — Priority Access</a>
            </div>
          </div>
          <form id="early-access-form" onSubmit={joinEarlyAccess} className="mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:flex-row">
            <input type="email" required aria-label="Email for early access" placeholder="Enter your email for early access" value={earlyEmail} onChange={e => setEarlyEmail(e.target.value)} className="flex-1 rounded-xl border-2 border-camera-line bg-card p-3 text-card-foreground outline-none focus:border-primary" />
            <Button type="submit" className="h-auto whitespace-normal rounded-xl bg-launch-join px-6 py-3 font-bold text-launch-join-foreground hover:bg-launch-join/90">Join Waitlist 🚀</Button>
          </form>
          <p className="mt-3 text-center text-xs text-launch-card-muted">Saved on this device only. Not sent to NIXORA STUDIOS; no launch email will be sent.</p>
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-launch-footer">No payment today. Join waitlist to lock your discount. 1 credit = 1 generation. Failed generations auto-refunded in 24h. Paystack (NGN) + Stripe (USD) at launch Nov 23.</p>
        </div>
      </section>
    <footer className="camera-footer border-t border-border px-8 py-12">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-black text-foreground">NIXORA STUDIOS.</p>
          <p className="mt-1 text-primary">Global AI Video Studio</p>
          <p className="mt-3 text-launch-card-muted">© 2026 NIXORASTUDIOS LTD | RC 9950450</p>
        </div>
        <nav aria-label="Product">
          <p className="mb-3 font-bold text-foreground">Product</p>
          <ul className="flex flex-col gap-2 text-launch-card-muted">
            <li><a href="#engines" className="hover:text-primary">Text to Video</a></li>
            <li><a href="#engines" className="hover:text-primary">Image to Video</a></li>
            <li><a href="#engines" className="hover:text-primary">Animation</a></li>
            <li><a href="#engines" className="hover:text-primary">Music Studio</a></li>
            <li><a href="#engines" className="hover:text-primary">Code Engine</a></li>
          </ul>
        </nav>
        <nav aria-label="Legal pages">
          <p className="mb-3 font-bold text-foreground">Legal</p>
          <ul className="flex flex-col gap-2 text-launch-card-muted">
            <li><Link to="/terms" className="underline text-link hover:text-link/80">Terms</Link></li>
            <li><Link to="/privacy" className="underline text-link hover:text-link/80">Privacy</Link></li>
            <li><Link to="/refund" className="underline text-link hover:text-link/80">Refund</Link></li>
            <li><Link to="/security" className="underline text-link hover:text-link/80">Security</Link></li>
            <li><Link to="/contact" className="underline text-link hover:text-link/80">Contact</Link></li>
          </ul>
        </nav>
        <div>
          <p className="mb-3 font-bold text-foreground">Contact</p>
          <p><a href="mailto:support@nixorastudios.com" className="underline text-link hover:text-link/80">support@nixorastudios.com</a></p>
          <p className="mt-1"><a href="mailto:hello@nixorastudios.com" className="underline text-link hover:text-link/80">hello@nixorastudios.com</a></p>
          <p className="mt-3 text-launch-card-muted">81 Friday Momomi Egwuogwu Street, Amachai 2, Okpanam, Asaba, Delta State, Nigeria</p>
          <p className="mt-3 flex flex-wrap gap-2" aria-label="Security badges">
            <span className="rounded-md border border-border px-2 py-1 text-xs text-launch-card-muted">SSL Secured</span>
            <span className="rounded-md border border-border px-2 py-1 text-xs text-launch-card-muted">Paystack Secured</span>
          </p>
        </div>
      </div>
    </footer>
    {selectedTool && <div className="fixed inset-0 z-50 flex items-center justify-center bg-camera-scrim p-4 backdrop-blur-sm" onClick={closeTool}>
      <div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="tool-title" onClick={e => e.stopPropagation()} className="camera-modal max-h-[90svh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card p-8 text-card-foreground outline-none">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h3 id="tool-title" className="text-2xl font-black">{selectedTool.name}</h3>
          <Button type="button" variant="ghost" size="icon" onClick={closeTool} aria-label="Close" className="text-launch-card-muted hover:text-card-foreground"><X className="size-6" /></Button>
        </div>
        <p className="mb-4 text-launch-card-muted">What do you want to create?</p>
        <textarea aria-label="What do you want to create?" value={prompt} readOnly={showSuccess} onChange={e => saveDraft(e.target.value)} placeholder={`Describe your ${selectedTool.name.toLowerCase()} idea... e.g., A cinematic shot of...`} className="h-32 w-full rounded-xl border-2 border-camera-line bg-card p-4 text-card-foreground outline-none focus:border-primary" />
        {showSuccess ? <form onSubmit={joinWaitlist} className="mt-4 rounded-xl border border-launch-success-line bg-launch-success p-4 text-center">
          <p role="status" className="text-lg font-bold text-launch-success-foreground">✅ Draft Saved on this device!</p>
          <p className="mt-1 break-words text-sm text-launch-card-muted">Your idea: “{prompt.slice(0, 50)}{prompt.length > 50 ? '…' : ''}”</p>
          <p className="mt-3 font-bold text-primary">Want us to build this first on Nov 23 launch?</p>
          <input type="email" required aria-label="Email for early access" placeholder="Enter email for early access" value={email} onChange={e => setEmail(e.target.value)} className="mt-3 w-full rounded-xl border-2 border-primary/25 bg-card p-3 text-card-foreground outline-none focus:border-primary" />
          <p className="mt-2 text-sm text-launch-card-muted">Saved on this device only. Not sent to NIXORA STUDIOS; no launch email will be sent.</p>
          <p role="status" className="mt-2 text-sm text-launch-card-muted">Local waitlist: {waitlistCount} {waitlistCount === 1 ? 'email' : 'emails'} saved on this device.</p>
          <Button type="submit" className="mt-3 h-auto w-full whitespace-normal rounded-xl bg-launch-join py-3 font-bold text-launch-join-foreground hover:bg-launch-join/90">Join Waitlist + Lock My Idea 🚀</Button>
        </form> : <div className="mt-6 flex flex-col gap-3">
          {VIDEO_ENGINES.has(selectedTool.slug) && <Button type="button" variant="outline" onClick={polishIdea} disabled={polishing} className="h-auto w-full whitespace-normal rounded-xl py-3 font-bold">{polishing ? 'Writing your prompt…' : '✨ Polish my idea with AI'}</Button>}
          <Button type="button" onClick={confirmDraft} className="h-auto w-full whitespace-normal rounded-xl py-3 font-bold">Generate with {selectedTool.name} — Coming Nov 23</Button>
        </div>}
        {notice && <p role="status" className="mt-4 text-center text-sm text-primary">{notice}</p>}
        <p className="mt-4 flex items-center justify-center gap-2 text-center text-sm text-launch-card-muted"><LockKeyhole className="size-4 shrink-0" aria-hidden="true" /> Module launches Nov 23, 2026.</p>
      </div>
    </div>}
  </div>;
}
