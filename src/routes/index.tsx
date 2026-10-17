import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { ArrowUpRight, LockKeyhole, Sparkles, Mail, Aperture, Image, Clapperboard, WandSparkles, AudioLines, Mic, Music2, ScanFace, Film, Code2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TOOLS } from '@/lib/tools';
import { addSignup, countdown, LAUNCH_AT, VISITOR_BASE, WAITLIST_BASE, WAITLIST_KEY } from '@/lib/launch';
import studioImage from '@/assets/launch-studio.jpg';

const title = 'NIXORA STUDIOS — Coming Soon · Global AI Video Studio';
const description = 'Ten creative AI engines. One global studio. Join the NIXORA STUDIOS early-access preview ahead of launch on October 24, 2026.';
export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title }, { name: 'description', content: description }, { property: 'og:title', content: title }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: Index,
});
const icons = [Image, Clapperboard, Film, WandSparkles, AudioLines, Mic, Music2, ScanFace, Film, Code2];
function Index() {
  const [now, setNow] = useState<number | null>(null);
  const [visitors, setVisitors] = useState(VISITOR_BASE);
  const [entries, setEntries] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState<number | null>(null);
  const [notice, setNotice] = useState<'privacy' | 'terms' | 'owner' | null>(null);
  useEffect(() => {
    setNow(Date.now());
    try { const stored: unknown = JSON.parse(localStorage.getItem(WAITLIST_KEY) || '[]'); if (Array.isArray(stored)) setEntries(stored.filter((v): v is string => typeof v === 'string')); } catch { /* keep form available */ }
    const clock = setInterval(() => setNow(Date.now()), 1000);
    const activity = setInterval(() => setVisitors(v => v + 1), 5000);
    return () => { clearInterval(clock); clearInterval(activity); };
  }, []);
  const remaining = now === null ? null : countdown(now);
  function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const result = addSignup(entries, email);
      localStorage.setItem(WAITLIST_KEY, JSON.stringify(result.emails));
      setEntries(result.emails); setSaved(result.position); setEmail('');
      toast.success(`You're #${result.position} on this device's preview waitlist!`, { description: 'Saved locally. Email notifications are not connected yet.' });
      console.info('NIXORA early-access signup saved locally');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not save on this device.'); }
  }
  return <div className="launch-theme min-h-screen bg-background text-foreground">
    <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 md:px-10">
      <a href="#" className="flex items-center gap-2 text-sm font-bold text-primary" aria-label="NIXORA STUDIOS home"><Aperture className="size-6" />NIXORA STUDIOS<span className="ml-2 hidden font-normal text-muted-foreground sm:inline">/</span></a>
      <span className="hidden text-xs text-muted-foreground md:block">THE NEXT CHAPTER IN CREATION</span>
      <Button variant="outline" className="rounded-full border-border text-xs" onClick={() => document.getElementById('early-access-email')?.focus()}>Get early access <ArrowUpRight /></Button>
    </header>
    <main>
      <section className="launch-hero relative isolate overflow-hidden border-y border-border">
        <img src={studioImage} alt="Chrome cinema camera wrapped in flowing orange silk" width={1600} height={912} className="absolute inset-0 -z-20 h-full w-full object-cover" fetchPriority="high" />
        <div className="launch-scrim absolute inset-0 -z-10" />
        <div className="mx-auto max-w-7xl px-5 py-14 md:px-10 md:py-20">
          <div className="max-w-2xl">
            <div className="mb-7 flex items-center gap-2 text-xs font-medium uppercase text-primary"><span className="launch-dot size-1.5 rounded-full bg-primary" />A new era of storytelling</div>
            <h1 className="launch-heading font-semibold">NIXORA<br />STUDIOS<span className="text-primary">.</span></h1>
            <p className="mt-5 text-xl font-medium md:text-2xl">Coming Soon — Global AI Video Studio</p>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">From the first spark to the final frame.<br />Ten creative engines. Limitless possibilities.</p>
            <form onSubmit={submit} className="mt-8 max-w-lg">
              <label className="sr-only" htmlFor="early-access-email">Enter Email to Get Early Access</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input id="early-access-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter email to get early access" className="h-12 flex-1 bg-background/80 text-foreground" />
                <Button type="submit" className="h-12 px-6">Notify Me <ArrowUpRight /></Button>
              </div>
              <p role="status" className="mt-3 text-xs leading-5 text-muted-foreground">{saved ? `You're #${saved}. Saved on this device — notifications aren't connected yet.` : 'Early-access preview · email saved on this device only.'}</p>
            </form>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
              <span className="flex items-center gap-2"><span className="launch-dot size-1.5 rounded-full bg-primary" /><span className="font-mono tabular-nums">{visitors.toLocaleString('en-US')}</span> visitors</span>
              <span className="flex items-center gap-2"><Sparkles className="size-3.5 text-primary" /><span className="font-mono tabular-nums">{WAITLIST_BASE + entries.length}</span> on waitlist</span>
              <span className="text-muted-foreground">Demo activity</span>
            </div>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-5 pb-8 md:px-10">
          <div><p className="text-xs uppercase text-muted-foreground">The countdown is on</p><p className="mt-1 text-sm">{now !== null && now >= LAUNCH_AT ? 'Launch day has arrived' : 'Launching October 24, 2026'}</p></div>
          <div className="flex gap-5" aria-label="Launch countdown">{['Days', 'Hours', 'Minutes', 'Seconds'].map((label, i) => <div key={label} className="w-12 text-center"><span className="block font-mono text-2xl tabular-nums md:text-3xl">{remaining ? String(remaining[i]).padStart(2, '0') : '—'}</span><span className="mt-1 block text-[10px] uppercase text-muted-foreground">{label}</span></div>)}</div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-10">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs uppercase text-primary">Your complete creative toolkit</p><h2 className="mt-2 text-2xl font-medium">One studio. Ten engines.</h2></div><span className="flex items-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-3.5" />Unlocking at launch</span></div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{TOOLS.map((tool, i) => { const Icon = icons[i] ?? Code2; return <article data-tool={tool.slug} key={tool.slug} className="launch-engine group rounded-lg bg-card p-4 text-card-foreground transition-colors duration-300 hover:bg-primary hover:text-primary-foreground"><div className="flex justify-between text-xs opacity-50"><span className="font-mono">{String(i + 1).padStart(2, '0')}</span><LockKeyhole className="size-3.5" /></div><Icon className="my-5 size-7 blur-[0.4px]" /><h3 className="text-xs font-semibold">{tool.name}</h3><p className="mt-1 text-[11px] opacity-60">Coming soon</p></article>; })}</div>
      </section>
    </main>
    <footer className="border-t border-border"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-6 text-xs text-muted-foreground md:px-10"><span>© 2026 NIXORA STUDIOS</span><div className="flex flex-wrap items-center gap-4"><Button variant="link" className="h-auto p-0 text-xs text-muted-foreground" onClick={() => setNotice('privacy')}>Privacy</Button><Button variant="link" className="h-auto p-0 text-xs text-muted-foreground" onClick={() => setNotice('terms')}>Terms</Button><a href="mailto:support@nixorastudios.com" className="hover:text-primary">Contact</a><a href="https://nixorastudios.com" target="_blank" rel="noreferrer" className="hover:text-primary">nixorastudios.com <ArrowUpRight className="inline size-3" /></a><Button variant="link" className="h-auto p-0 text-xs text-muted-foreground" onClick={() => setNotice('owner')}>Owner admin access</Button></div></div></footer>
    <Dialog open={notice !== null} onOpenChange={open => { if (!open) setNotice(null); }}><DialogContent><DialogTitle>{notice === 'privacy' ? 'Early-access privacy' : notice === 'terms' ? 'Preview terms' : 'Owner Studio access'}</DialogTitle><DialogDescription>{notice === 'privacy' ? 'This preview stores your email only in this browser. It is not sent to NIXORA STUDIOS or an email service. You can remove it using the button below or by clearing site data.' : notice === 'terms' ? 'This is a coming-soon preview. Visitor and waitlist figures are demonstration numbers, not verified totals. No paid services or email notifications are active.' : 'Secure owner sign-in is not connected yet. An email address or a public hash cannot unlock owner access.'}</DialogDescription>{notice === 'privacy' && <Button onClick={() => { try { localStorage.removeItem(WAITLIST_KEY); setEntries([]); setSaved(null); toast.success('Local early-access data removed.'); } catch { toast.error('Could not clear browser storage.'); } }}>Remove my local data</Button>}</DialogContent></Dialog>
  </div>;
}
