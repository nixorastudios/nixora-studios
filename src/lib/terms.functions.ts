import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

// Records terms acceptance for the signed-in user. Called by the future
// checkout guard; the user id always comes from the verified bearer token.
export const acceptCurrentTerms = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const request = getRequest();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim().slice(0, 128) ?? null;
    const userAgent = request.headers.get('user-agent')?.slice(0, 1024) ?? null;
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { acceptTerms } = await import('./terms.server');
    await acceptTerms(supabaseAdmin, context.userId, ip, userAgent);
    return { ok: true as const };
  });
