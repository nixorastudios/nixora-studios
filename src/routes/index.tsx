import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Aperture, LockKeyhole } from 'lucide-react';
import { TOOLS } from '@/lib/tools';
import { LAUNCH_AT, VISITOR_BASE, WAITLIST_BASE } from '@/lib/launch';

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

function Index() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  return <div className="launch-theme launch-backdrop min-h-screen text-foreground">
    <div className="mx-auto max-w-5xl px-5 py-6 md:px-10">
      <header className="flex items-center gap-2 text-sm font-bold text-primary"><Aperture className="size-6" />NIXORA STUDIOS</header>
      <main>
        <section className="py-16 text-center md:py-24">
          <span className="inline-block rounded-full border border-primary px-4 py-1 text-xs font-medium uppercase text-primary">A new era of storytelling</span>
          <h1 className="mt-6 text-5xl font-bold md:text-[64px] md:leading-tight">NIXORA STUDIOS.</h1>
          <h2 className="mt-4 text-xl font-medium md:text-2xl">Coming Soon - Global AI Video Studio</h2>
          <p className="mt-6 text-sm text-muted-foreground"><span className="tabular-nums">{VISITOR_BASE.toLocaleString('en-US')}</span> visitors | <span className="tabular-nums">{WAITLIST_BASE}</span> on waitlist</p>
          <p className="mt-8 text-xs uppercase text-muted-foreground">Launching October 24, 2026</p>
          <p className="mt-2 font-mono text-4xl tabular-nums text-primary" aria-label="Launch countdown">{now === null ? '--:--:--' : timer(now)}</p>
        </section>
        <section className="pb-12">
          <p className="text-center text-xs uppercase text-primary">Tools to build your world</p>
          <h2 className="mt-2 text-center text-2xl font-medium">One studio. Ten engines.</h2>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {TOOLS.map((tool, i) => <article key={tool.slug} data-tool={tool.slug} className="flex items-center justify-between rounded-lg border border-border bg-[var(--launch-card)] p-4">
              <div><span className="font-mono text-xs text-primary">{i + 1}</span><h3 className="text-sm font-semibold">{tool.name}</h3><p className="text-xs text-muted-foreground">Coming soon</p></div>
              <LockKeyhole className="size-4 text-muted-foreground" />
            </article>)}
          </div>
        </section>
      </main>
      <footer className="flex flex-col items-center gap-2 border-t border-border py-6 text-center text-xs text-muted-foreground">
        <p>Nixora Studios © 2026 - GOD MODE ACTIVE</p>
        <a href="mailto:support@nixorastudios.com" className="text-primary hover:underline">support@nixorastudios.com</a>
        <p className="flex items-center gap-2"><span className="launch-dot size-1.5 rounded-full bg-primary" />Coming Soon</p>
      </footer>
    </div>
  </div>;
}
