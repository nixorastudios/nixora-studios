import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { X } from 'lucide-react';
import { joinLaunchWaitlist } from '@/lib/waitlist.functions';
import { waitlistSchema } from '@/lib/waitlist';
import type { STUDIO_PRODUCTS } from '@/lib/studio-core';

export type CheckoutProduct = (typeof STUDIO_PRODUCTS)[number];
const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

// TEST MODE: no real payment is taken before launch. Both buttons only join the waitlist.
// TODO: Insert SQUAD_SANDBOX_PUBLIC_KEY here when keys arrive, then Paystack test key.
export function CheckoutModal({ product, onClose }: { product: CheckoutProduct; onClose: () => void }) {
  const join = useServerFn(joinLaunchWaitlist);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  const pay = async () => {
    const parsed = waitlistSchema.safeParse({ email, source: 'pricing-checkout', plan: product.code });
    if (!parsed.success) return setMsg('Enter a valid email address.');
    setBusy(true); setMsg('');
    try {
      const r = await join({ data: parsed.data });
      setMsg(r.ok ? `Checkout opens at launch Nov 23 — You are on the waitlist${r.position ? ` (#${r.position})` : ''}.` : r.error);
    } catch { setMsg('We could not save your signup. Please try again.'); }
    finally { setBusy(false); }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" onClick={onClose} role="presentation">
    <div role="dialog" aria-modal="true" aria-label={`Checkout ${product.name}`} onClick={e => e.stopPropagation()} className="relative w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 text-card-foreground">
      <button type="button" aria-label="Close checkout" onClick={onClose} className="absolute right-4 top-4"><X className="size-5" /></button>
      <p className="text-xs font-bold uppercase text-primary">Test mode — no payment taken</p>
      <h3 className="text-2xl font-bold">{product.name}</h3>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <dt className="text-muted-foreground">Credits</dt><dd className="font-bold">{product.credits.toLocaleString()}</dd>
        <dt className="text-muted-foreground">Price</dt><dd className="font-bold">{naira(product.naira)}{product.kind === 'subscription' ? ' / month' : ' one-time'}</dd>
      </dl>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" aria-label="Email" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground" />
      <button type="button" disabled={busy} onClick={pay} className="w-full rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground disabled:opacity-60">Pay with Squad — GTBank</button>
      <button type="button" disabled={busy} onClick={pay} className="w-full rounded-xl bg-muted px-4 py-3 font-bold text-muted-foreground disabled:opacity-60">Pay with Paystack (backup)</button>
      {msg && <p role="status" className="text-sm">{msg}</p>}
    </div>
  </div>;
}
