import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/api/code-engine')({
  staticData: { sitemap: false },
  server: { handlers: { POST: async ({ request }) => {
    const { handleCodeEngine } = await import('@/lib/code-engine.server');
    return handleCodeEngine(request);
  } } },
});