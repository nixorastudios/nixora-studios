import { createFileRoute } from '@tanstack/react-router';
import { previewDocument, type CodeFile } from '@/lib/code-engine';

// Public live page for a published Code Engine project. Read-only; only
// projects the owner explicitly published are served.
export const Route = createFileRoute('/projects/$slug')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const slug = String(params.slug ?? '').toLowerCase();
        if (!/^[a-z0-9-]{1,60}$/.test(slug)) return new Response('Not found', { status: 404 });
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
        const { data, error } = await supabaseAdmin
          .from('code_engine_projects')
          .select('name,files,published_at')
          .eq('publish_slug', slug)
          .not('published_at', 'is', null)
          .maybeSingle();
        if (error || !data || !Array.isArray(data.files) || data.files.length === 0) {
          return new Response('Not found', { status: 404 });
        }
        const html = previewDocument(data.files as CodeFile[]);
        return new Response(html, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=60',
            'X-Content-Type-Options': 'nosniff',
          },
        });
      },
    },
  },
});
