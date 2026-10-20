import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Image, Clapperboard, Film, Sparkles, Volume2, Mic, Piano, Speech, Scissors, Code2, LockKeyhole } from 'lucide-react';
import { TOOLS } from '@/lib/tools';
import { LAUNCH_AT } from '@/lib/launch';
import cameraHero from '@/assets/launch-studio.jpg';

const title = 'NIXORA STUDIOS — Coming Soon · Global AI Video Studio';
const description = 'Ten creative AI engines. One global studio. NIXORA STUDIOS launches October 24, 2026.';
export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title }, { name: 'description', content: description }, { property: 'og:title', content: title }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: Index,
});

function timer(now: number) {
  const s = Math.max(0, Math.floor((LAUNCH_AT - now) / 1000));
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}`;
}

const engineIcons = [Image, Clapperboard, Film, Sparkles, Volume2, Mic, Piano, Speech, Scissors, Code2];

function Index() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  return <div className="launch-theme camera-home min-h-screen text-foreground">
    <div className="camera-wallpaper" style={{ backgroundImage: `url(${cameraHero})` }} aria-hidden="true" />
    <div className="camera-overlay" aria-hidden="true" />
    <div className="relative mx-auto max-w-6xl px-6 md:px-10">
      <header className="pt-9 md:pt-12"><p className="camera-wordmark font-extrabold">NIXORASTUDIOS</p></header>
      <main>
        <section className="camera-hero flex items-center py-16 md:py-24">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase text-primary">A NEW ERA OF STORYTELLING</p>
            <h1 className="mt-5 text-5xl leading-tight font-extrabold md:text-[72px]">NIXORA<br className="hidden md:block" /> STUDIOS.</h1>
            <p className="mt-5 text-base text-foreground/85 md:text-lg">Coming Soon — Global AI Video Studio</p>
            <p className="mt-10 text-xs uppercase text-foreground/70">Launching October 24, 2026</p>
            <p className="mt-3 font-mono text-4xl tabular-nums text-primary md:text-5xl" aria-label="Launch countdown">{now === null ? '--:--:--' : timer(now)}</p>
          </div>
        </section>
        <section className="pb-16 md:pb-20">
          <h2 className="text-center text-sm font-bold uppercase text-primary">TOOLS TO BUILD YOUR WORLD</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {TOOLS.map((tool, i) => {
              const Icon = engineIcons[i] ?? Sparkles;
              return <article key={tool.slug} data-tool={tool.slug} className="camera-engine flex min-h-32 items-center gap-5 rounded-[20px] bg-card p-6 text-card-foreground">
                <Icon className="size-8 shrink-0 text-primary" strokeWidth={1.6} aria-hidden="true" />
                <div className="min-w-0 flex-1"><h3 className="text-base font-extrabold">{tool.name}</h3><p className="mt-2 text-sm text-launch-card-muted">Coming soon</p></div>
                <LockKeyhole className="size-4 shrink-0 text-launch-card-muted" aria-label="Locked" />
              </article>;
            })}
          </div>
        </section>
      </main>
    </div>
      <footer className="camera-footer relative flex flex-col items-center gap-3 py-8 text-center text-xs text-muted-foreground">
        <p>© 2026 NIXORA STUDIOS</p>
        <a href="mailto:support@nixorastudios.com" className="text-primary hover:underline">support@nixorastudios.com</a>
        <p className="flex items-center gap-2"><span className="launch-dot size-1.5 rounded-full bg-primary" />Coming Soon</p>
      </footer>
  </div>;
}
