import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/public/squad-webhook')({
  staticData: { sitemap: false },
  server: { handlers: { POST: async () => {
    // No invented event schema or unverified signature serialization may grant credits.
    // Confirm current Squad merchant contract and a signed sandbox fixture before enabling.
    return new Response('Squad integration awaiting verified provider configuration', { status: 503 });
  } } },
});