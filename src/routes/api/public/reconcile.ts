import { createFileRoute } from '@tanstack/react-router';
import { authenticateCronRequest } from '@/integrations/supabase/cron-auth';
import { z } from 'zod';

export const Route = createFileRoute('/api/public/reconcile')({
  staticData: { sitemap: false },
  server: { handlers: { POST: async ({ request }) => {
    const denied = await authenticateCronRequest(request);
    if (denied) return denied;
    try {
      z.object({ kind: z.literal('failed-credit-refunds') }).strict().parse(await request.json());
    } catch { return new Response('Invalid reconciliation request', { status: 400 }); }
    try {
      const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
      const { autoRefundFailed } = await import('@/lib/credits.server');
      const refunded = await autoRefundFailed(supabaseAdmin);
      return Response.json({ refunded }, { headers: { 'Cache-Control': 'no-store' } });
    } catch { return new Response('Reconciliation failed', { status: 500 }); }
  } } },
});