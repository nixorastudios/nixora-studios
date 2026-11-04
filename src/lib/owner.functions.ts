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

// Owner-only overview: role verified first, then privileged counts.
export const getOwnerOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isOwner } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "owner" });
    if (isOwner !== true) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin.from("waitlist_signups").select("*", { count: "exact", head: true });
    return { waitlistCount: count ?? 0 };
  });
