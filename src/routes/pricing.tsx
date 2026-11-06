import { createFileRoute } from '@tanstack/react-router';
import { OptionAPricing, BackToHome } from '@/components/OptionAPricing';

export const Route = createFileRoute('/pricing')({
  head: () => ({ meta: [
    { title: 'Pricing — NIXORA STUDIOS' },
    { name: 'description', content: 'NIXORA STUDIOS subscriptions and credit packs: one wallet for all ten AI engines.' },
    { property: 'og:title', content: 'Pricing — NIXORA STUDIOS' },
    { property: 'og:description', content: 'PRO, ULTRA and BUSINESS plans plus one-time credit packs, one wallet for all engines.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: Pricing,
});

function Pricing() {
  return <main className="launch-theme min-h-screen bg-background text-foreground"><div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
    <BackToHome />
    <h1 className="text-center text-3xl font-bold md:text-4xl">Pricing — One Studio, Ten Engines</h1>
    <OptionAPricing ctaHref="/#early-access-form" />
  </div></main>;
}
