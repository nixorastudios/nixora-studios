import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getOwnerOverview, getOwnerStatus } from "@/lib/owner.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/owner")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Owner Studio — NIXORA STUDIOS" },
    { name: "description", content: "Private owner controls for NIXORA STUDIOS." },
    { property: "og:title", content: "Owner Studio — NIXORA STUDIOS" },
    { property: "og:description", content: "Private owner controls for NIXORA STUDIOS." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  staticData: { sitemap: false },
  component: OwnerPage,
});

type Overview = Awaited<ReturnType<typeof getOwnerOverview>>;
// Shown only until real test-key payments exist; clearly labelled as demo.
const DEMO_PAYMENTS = [
  { email: "demo.buyer1@example.com", plan: "ultra", amountNaira: 60000, gateway: "squad", status: "TEST (demo)", date: "" },
  { email: "demo.buyer2@example.com", plan: "medium", amountNaira: 15000, gateway: "paystack", status: "TEST (demo)", date: "" },
];
const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

function downloadCsv(rows: Overview["waitlist"]) {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = ["Name,Email,Date,Plan", ...rows.map(r => [r.name, r.email, r.date, r.plan].map(esc).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "nixora-waitlist.csv"; a.click(); URL.revokeObjectURL(a.href);
}

function OwnerPage() {
  const checkOwner = useServerFn(getOwnerStatus);
  const loadOverview = useServerFn(getOwnerOverview);
  const [state, setState] = useState<"loading" | "signedOut" | "denied" | "owner">("loading");
  const [data, setData] = useState<Overview | null>(null);
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [msg, setMsg] = useState("");

  const refresh = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return setState("signedOut");
    try {
      const { isOwner } = await checkOwner();
      if (!isOwner) return setState("denied");
      setState("owner"); setData(await loadOverview());
    } catch { setState("denied"); }
  };
  useEffect(() => { void refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signIn = async (e: FormEvent) => {
    e.preventDefault(); setMsg("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return setMsg(error.message);
    setState("loading"); await refresh();
  };

  const payments = data && data.payments.length ? data.payments : DEMO_PAYMENTS;
  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto max-w-6xl space-y-8">
        <Link to="/" className="text-sm underline">‹ Back to Home</Link>
        <h1 className="text-3xl font-bold">Owner Studio</h1>
        {state === "loading" && <p className="text-muted-foreground">Checking access…</p>}
        {state === "signedOut" && (
          <form onSubmit={signIn} className="max-w-sm space-y-3">
            <p className="text-muted-foreground">Sign in with the owner account email and password.</p>
            <Input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <Input type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <Button type="submit" className="w-full">Sign in</Button>
            {msg && <p className="text-sm text-destructive">{msg}</p>}
          </form>
        )}
        {state === "denied" && <div className="space-y-3"><p className="text-destructive">This account does not have owner access.</p><Button variant="outline" onClick={async () => { await supabase.auth.signOut(); setState("signedOut"); }}>Sign out</Button></div>}
        {state === "owner" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[["Total Waitlist", data?.waitlistCount], ["Total Users", data?.totalUsers], ["Total Credits Sold", data?.creditsSold], ["Total Revenue NGN", data ? naira(data.revenueNaira) : undefined]].map(([label, v]) => (
                <div key={String(label)} className="rounded-xl border border-border bg-card p-5 text-card-foreground"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-black">{v ?? "…"}</p></div>
              ))}
            </div>
            <section className="space-y-3">
              <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Waitlist</h2><Button variant="outline" disabled={!data?.waitlist.length} onClick={() => data && downloadCsv(data.waitlist)}>Export CSV</Button></div>
              <div className="overflow-x-auto rounded-xl border border-border"><table className="w-full text-sm"><thead className="bg-muted text-left"><tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Date</th><th className="p-3">Plan clicked</th></tr></thead>
                <tbody>{data?.waitlist.map(w => <tr key={w.email} className="border-t border-border"><td className="p-3">{w.name || "—"}</td><td className="p-3">{w.email}</td><td className="p-3">{new Date(w.date).toLocaleDateString()}</td><td className="p-3 uppercase">{w.plan || "—"}</td></tr>)}</tbody></table>
                {data && !data.waitlist.length && <p className="p-4 text-muted-foreground">No signups yet.</p>}</div>
            </section>
            <section className="space-y-3">
              <h2 className="text-xl font-bold">Users</h2>
              <div className="overflow-x-auto rounded-xl border border-border"><table className="w-full text-sm"><thead className="bg-muted text-left"><tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Joined</th></tr></thead>
                <tbody>{data?.users.map(u => <tr key={u.email} className="border-t border-border"><td className="p-3">{u.name || "—"}</td><td className="p-3">{u.email}</td><td className="p-3">{new Date(u.date).toLocaleDateString()}</td></tr>)}</tbody></table>
                {data && !data.users.length && <p className="p-4 text-muted-foreground">No users yet.</p>}</div>
            </section>
            <section className="space-y-3">
              <h2 className="text-xl font-bold">Payments {data && !data.payments.length && <span className="text-sm font-normal text-muted-foreground">— demo data until test keys are added</span>}</h2>
              <div className="overflow-x-auto rounded-xl border border-border"><table className="w-full text-sm"><thead className="bg-muted text-left"><tr><th className="p-3">Email</th><th className="p-3">Plan</th><th className="p-3">Amount</th><th className="p-3">Gateway</th><th className="p-3">Status</th></tr></thead>
                <tbody>{payments.map((p, i) => <tr key={i} className="border-t border-border"><td className="p-3">{p.email}</td><td className="p-3 uppercase">{p.plan || "—"}</td><td className="p-3">{naira(p.amountNaira)}</td><td className="p-3 capitalize">{p.gateway}</td><td className="p-3">{p.status}</td></tr>)}</tbody></table></div>
            </section>
            <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); setData(null); setState("signedOut"); }}>Sign out</Button>
          </>
        )}
      </div>
    </main>
  );
}
