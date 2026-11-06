import { ENGINE_CREDIT_COSTS, STUDIO_PRODUCTS } from '@/lib/studio-core';

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export function OptionAPricing({ ctaHref = '#early-access-form', ctaLabel = 'Join Waitlist — Priority Access' }: { ctaHref?: string; ctaLabel?: string }) {
  const groups = [
    { title: 'Monthly subscriptions', items: STUDIO_PRODUCTS.filter(p => p.kind === 'subscription') },
    { title: 'One-time credit packs — no subscription', items: STUDIO_PRODUCTS.filter(p => p.kind === 'pack') },
  ];
  return <div className="space-y-12">
    {groups.map(g => <div key={g.title}>
      <h3 className="mb-6 text-center text-xl font-bold text-primary">{g.title}</h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {g.items.map(p => {
          const popular = 'popular' in p && p.popular;
          return <div key={p.code} className={`relative flex flex-col rounded-2xl bg-card p-8 text-card-foreground ${popular ? 'border-2 border-primary' : ''}`}>
            {popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">Most Popular</span>}
            <h4 className="text-xl font-bold">{p.name}</h4>
            <p className="mt-1 text-3xl font-black text-primary">{p.credits.toLocaleString()} Credits</p>
            <p className="mt-4 font-bold">{naira(p.naira)}{p.kind === 'subscription' ? ' / month' : ' one-time'}</p>
            {p.seats > 1 && <p className="text-sm text-launch-card-muted">{p.seats} seats</p>}
            <a href={ctaHref} className={`mt-6 inline-flex items-center justify-center rounded-xl px-4 py-3 text-center font-bold transition-colors ${popular ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground'}`}>{ctaLabel}</a>
          </div>;
        })}
      </div>
    </div>)}
    <p className="mx-auto max-w-2xl text-center text-sm text-launch-footer">Credit cost — one wallet for all engines: Image {ENGINE_CREDIT_COSTS.image} · Voice minute {ENGINE_CREDIT_COSTS.voiceMinute} · Song {ENGINE_CREDIT_COSTS.song} · Video 5-sec {ENGINE_CREDIT_COSTS.videoFiveSeconds} · Code App {ENGINE_CREDIT_COSTS.codeApp}.</p>
    <p className="mx-auto max-w-2xl text-center text-sm text-launch-footer">Payments: Squad by HabariPay / GTBank MAIN, Paystack BACKUP — Secured by GTBank Squad. No payment today; checkout opens at launch.</p>
  </div>;
}

export function BackToHome() {
  return <a href="/" className="inline-flex items-center rounded-md border border-border px-3 py-2 text-sm font-semibold hover:border-primary hover:text-primary">‹ Back to Home</a>;
}
