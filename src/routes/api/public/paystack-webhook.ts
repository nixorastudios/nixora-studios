import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/public/paystack-webhook')({
  staticData: { sitemap: false },
  server: { handlers: { POST: async ({ request }) => {
    const key = process.env['PAYSTACK_SECRET_KEY'];
    if (!key) return new Response('Payment integration not configured', { status: 503 });
    if (Number(request.headers.get('content-length')) > 262144) return new Response('Payload too large', { status: 413 });
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > 262144) return new Response('Payload too large', { status: 413 });
    const { verifyPaystackWebhook, handlePaystackWebhook } = await import('@/lib/payments.server');
    if (!verifyPaystackWebhook(raw, request.headers.get('x-paystack-signature'), key)) return new Response('Invalid signature', { status: 401 });
    try {
      const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
      await handlePaystackWebhook(supabaseAdmin, raw);
      return new Response('ok', { status: 200 });
    } catch {
      // Never acknowledge failed fulfillment; Paystack can retry. Do not expose evidence or provider payloads.
      return new Response('Webhook could not be reconciled', { status: 500 });
    }
  } } },
});