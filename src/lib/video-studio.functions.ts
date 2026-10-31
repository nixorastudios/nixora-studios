import { createServerFn } from '@tanstack/react-start';
import { setResponseStatus } from '@tanstack/react-start/server';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { videoSettingsSchema } from './video-studio';
import { z } from 'zod';

export const generateStudioVideo = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => videoSettingsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const key = process.env['LOVABLE_API_KEY'];
    if (!key) return { ok: false as const, error: 'Video generation is not configured.' };
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { startStudioVideo, VideoError } = await import('./video-studio.server');
    try { return { ok: true as const, job: await startStudioVideo(supabaseAdmin, context.userId, key, data) }; }
    catch (error) {
      if (error instanceof VideoError) setResponseStatus(error.status);
      return { ok: false as const, error: error instanceof Error ? error.message : 'Video could not be submitted.' };
    }
  });
export const listStudioVideos = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { readStudioJobs } = await import('./video-studio.server');
    return readStudioJobs(supabaseAdmin, context.userId);
  });
export const getStudioVideo = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const key = process.env['LOVABLE_API_KEY'];
    if (!key) return { ok: false as const, error: 'Video generation is not configured.' };
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { refreshStudioVideo, VideoError } = await import('./video-studio.server');
    try { return { ok: true as const, job: await refreshStudioVideo(supabaseAdmin, context.userId, key, data.id) }; }
    catch (error) {
      if (error instanceof VideoError) setResponseStatus(error.status);
      return { ok: false as const, error: error instanceof Error ? error.message : 'Video status unavailable.' };
    }
  });