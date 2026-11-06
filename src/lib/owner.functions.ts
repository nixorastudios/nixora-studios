import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Verifies the caller's owner role in the database; never trusts the browser.
export const getOwnerStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "owner" });
    if (error) return { isOwner: false };
    return { isOwner: data === true };
  });

// Owner-only overview: role verified first, then privileged reads.
export const getOwnerOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isOwner } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "owner" });
    if (isOwner !== true) throw new Error("Forbidden");
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const [waitlist, users, ledger, payments] = await Promise.all([
      admin.from("waitlist_signups").select("name,email,created_at,plan_code", { count: "exact" }).order("created_at", { ascending: false }).limit(1000),
      admin.auth.admin.listUsers({ page: 1, perPage: 200 }),
      admin.from("credit_ledger").select("credits").eq("type", "purchase").limit(10000),
      admin.from("payments").select("email,product_code,amount_kobo,provider,status,created_at").order("created_at", { ascending: false }).limit(200),
    ]);
    const ids = (users.data?.users ?? []).map(u => u.id);
    const { data: profs } = ids.length ? await admin.from("profiles").select("id,display_name").in("id", ids) : { data: [] };
    const nameOf = new Map((profs ?? []).map(p => [p.id, p.display_name]));
    const paid = (payments.data ?? []).filter(p => p.status === "success" || p.status === "paid");
    return {
      waitlistCount: waitlist.count ?? 0,
      waitlist: (waitlist.data ?? []).map(w => ({ name: w.name ?? "", email: w.email, date: w.created_at, plan: w.plan_code ?? "" })),
      totalUsers: users.data && "total" in users.data ? Number(users.data.total) : 0,
      users: (users.data?.users ?? []).map(u => ({ name: nameOf.get(u.id) || String(u.user_metadata?.full_name ?? ""), email: u.email ?? "", date: u.created_at })),
      creditsSold: (ledger.data ?? []).reduce((s, r) => s + Number(r.credits), 0),
      revenueNaira: paid.reduce((s, p) => s + Number(p.amount_kobo), 0) / 100,
      payments: (payments.data ?? []).map(p => ({ email: p.email, plan: p.product_code ?? "", amountNaira: Number(p.amount_kobo) / 100, gateway: p.provider, status: p.status, date: p.created_at })),
    };
  });
