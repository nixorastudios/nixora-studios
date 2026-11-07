import { createFileRoute, Link } from '@tanstack/react-router';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { Lock, Wallet } from 'lucide-react';
import { loadStudioDashboard } from '@/lib/studio-core.functions';
import { StudioAccountShell } from '@/components/StudioAccountShell';
import { Button } from '@/components/ui/button';
import { studioHead } from '@/lib/studio-head';
import { TOOLS } from '@/lib/tools';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { hasVerifiedEmail, VERIFIED_WELCOME_KEY } from '@/lib/email-verification';

const studioQuery = queryOptions({ queryKey: ['studio-dashboard'], queryFn: () => loadStudioDashboard() });

export const Route = createFileRoute('/_authenticated/my-studio')({
  loader: ({ context }) => context.queryClient.ensureQueryData(studioQuery),
  head: () => studioHead('My Studio', 'Your NIXORA wallet, credits and engines.'),
  staticData: { sitemap: false },
  component: MyStudio,
});

function MyStudio() {
  const { data } = useSuspenseQuery(studioQuery);
  const [verifiedWelcome, setVerifiedWelcome] = useState(false);
  useEffect(() => {
    let active = true;
    const marker = sessionStorage.getItem(VERIFIED_WELCOME_KEY);
    if (!marker) return;
    void supabase.auth.getUser().then(({ data: account }) => {
      if (active && account.user?.id === marker && hasVerifiedEmail(account.user)) {
        setVerifiedWelcome(true);
        sessionStorage.removeItem(VERIFIED_WELCOME_KEY);
      }
    });
    return () => { active = false; };
  }, []);
  return <StudioAccountShell title="My Studio">
    {verifiedWelcome && <p role="status" className="text-primary">Email verified - Welcome to NIXORA</p>}
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 text-card-foreground">
      <div className="flex items-center gap-3"><Wallet className="size-8 text-primary" /><div><p className="text-sm text-muted-foreground">Wallet — one balance for all engines</p><p className="text-3xl font-black">{data.balance} Credits</p></div></div>
      <Button asChild><Link to="/pricing">Upgrade</Link></Button>
    </section>
    <section className="space-y-4"><h2 className="text-xl font-bold">Your 10 engines</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{TOOLS.map(t => <article key={t.slug} className="flex items-center justify-between rounded-xl border border-border p-4"><div><p className="font-semibold">{t.icon} {t.name}</p><p className="text-sm text-muted-foreground">Locked · opens Nov 23</p></div><Lock className="size-5 text-muted-foreground" aria-label="Locked" /></article>)}</div>
    </section>
    <Link to="/dashboard" className="text-sm underline">Projects and files</Link>
  </StudioAccountShell>;
}
