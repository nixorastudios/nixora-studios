import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { getOwnerOverview, getOwnerStatus } from "@/lib/owner.functions";
import { Button } from "@/components/ui/button";

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

function OwnerPage() {
  const checkOwner = useServerFn(getOwnerStatus);
  const loadOverview = useServerFn(getOwnerOverview);
  const [state, setState] = useState<"loading" | "signedOut" | "denied" | "owner">("loading");
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return active && setState("signedOut");
      try {
        const { isOwner } = await checkOwner();
        if (!active) return;
        if (!isOwner) return setState("denied");
        setState("owner");
        const o = await loadOverview();
        if (active) setCount(o.waitlistCount);
      } catch { if (active) setState("denied"); }
    });
    return () => { active = false; };
  }, [checkOwner, loadOverview]);

  const signIn = (p: "google" | "lovable") => lovable.auth.signInWithOAuth(p, { redirect_uri: `${window.location.origin}/owner` });

  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-3xl font-bold">Owner Studio</h1>
        {state === "loading" && <p className="text-muted-foreground">Checking access…</p>}
        {state === "signedOut" && (
          <div className="space-y-3">
            <p className="text-muted-foreground">Sign in with your verified owner account.</p>
            <div className="flex gap-2"><Button onClick={() => signIn("google")}>Sign in with Google</Button><Button variant="outline" onClick={() => signIn("lovable")}>Sign in with Lovable</Button></div>
          </div>
        )}
        {state === "denied" && <p className="text-destructive">This account does not have owner access.</p>}
        {state === "owner" && (
          <div className="space-y-4 rounded-xl border border-border p-6">
            <p>Owner access verified.</p>
            <p className="text-lg">Waitlist signups: <strong>{count ?? "…"}</strong></p>
            <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); setState("signedOut"); }}>Sign out</Button>
          </div>
        )}
        <Link to="/" className="text-sm underline">Back to Home</Link>
      </div>
    </main>
  );
}
