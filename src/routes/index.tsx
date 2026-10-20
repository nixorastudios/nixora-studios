import { createFileRoute } from '@tanstack/react-router';
import { LockKeyhole } from 'lucide-react';
import { TOOLS } from '@/lib/tools';
import cameraHero from '@/assets/launch-studio.jpg';

const title = 'NIXORA STUDIOS — Coming Soon · Global AI Video Studio';
const description = 'Ten creative AI engines. One global studio. NIXORA STUDIOS launches October 24, 2026.';
export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title }, { name: 'description', content: description }, { property: 'og:title', content: title }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: Index,
});

function Index() {
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
            {TOOLS.map(tool => <article key={tool.slug} data-tool={tool.slug} className="camera-engine flex min-h-24 flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-6 text-card-foreground">
              <h3 className="font-bold">{tool.name}</h3>
              <span className="flex items-center gap-2 text-sm text-launch-card-muted">Coming soon <LockKeyhole className="size-4 shrink-0" aria-label="Locked" /></span>
            </article>)}
          </div>
        </div>
      </section>
    </main>
    <footer className="camera-footer border-t border-border px-8 py-10 text-center">
      <p>Nixora Studios © 2026 - GOD MODE ACTIVE</p>
      <a href="mailto:support@nixorastudios.com" className="mt-2 inline-block text-primary hover:underline">support@nixorastudios.com</a>
    </footer>
  </div>;
}
