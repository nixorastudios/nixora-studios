import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { loadStudioAdmin } from '@/lib/studio-core.functions';
import { StudioAccountShell } from '@/components/StudioAccountShell';
import { Button } from '@/components/ui/button';
import { studioHead } from '@/lib/studio-head';
export const Route = createFileRoute('/_authenticated/admin')({ head: () => studioHead('Owner administration', 'Private owner totals, accounts and payments.'), staticData: { sitemap: false }, component: Admin });
function Admin() { const [page, setPage] = useState(1); const { data, error, isPending } = useQuery({ queryKey: ['studio-admin', page], queryFn: () => loadStudioAdmin({ data: { page } }), retry: false });
  return <StudioAccountShell title="Owner administration">{isPending ? <p>Checking owner access…</p> : error ? <p role="alert" className="text-destructive">Owner access required, or overview unavailable.</p> : data && <>
    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">{[['Users', data.totalUsers ?? 'Unavailable'], ['Waitlist', data.waitlist], ['Projects', data.totalProjects], ['Payments', data.totalPayments]].map(([label, value]) => <div key={label}><p className="text-sm text-muted-foreground">{label}</p><p className="text-3xl font-bold">{value}</p></div>)}</div>
    <section className="space-y-3"><h2 className="text-xl font-bold">Payment setup — test only</h2><p>Squad — {data.providers.squad.configured ? 'Key configured; activation pending verification' : 'Not configured'}</p><p className="text-sm text-muted-foreground">{data.providers.squad.reason}</p><p>Paystack backup — {data.providers.paystack.ready ? 'Test key configured' : 'Genuine test key required'}</p><p className="text-sm text-muted-foreground">Payment keys are entered through secure project secret settings, never saved in this page. Live payments remain disabled.</p></section>
    <section><h2 className="mb-3 text-xl font-bold">Users</h2>{data.users.map(u => <div key={u.id} className="break-all border-b border-border py-3 text-sm">{u.email} · {u.verified ? 'Verified' : 'Unverified'}</div>)}</section>
    <section><h2 className="mb-3 text-xl font-bold">Projects</h2>{data.projects.map(p => <div key={p.id} className="border-b border-border py-3"><p>{p.name}</p><p className="break-all text-xs text-muted-foreground">{p.user_id}</p></div>)}</section>
    <section><h2 className="mb-3 text-xl font-bold">Payments and alerts</h2>{!data.payments.length && <p className="text-muted-foreground">No recorded payments.</p>}{data.payments.map(p => <div key={p.id} className="border-b border-border py-3 text-sm"><p>{p.provider} · ₦{(p.amount_kobo / 100).toLocaleString()} · {p.status}</p><p className="break-all text-muted-foreground">{p.reference}</p></div>)}</section>
    <div className="flex gap-3"><Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button><span className="self-center">Page {page}</span><Button variant="outline" disabled={data.users.length < 20 && data.projects.length < 20 && data.payments.length < 20} onClick={() => setPage(page + 1)}>Next</Button></div>
  </>}</StudioAccountShell>;
}