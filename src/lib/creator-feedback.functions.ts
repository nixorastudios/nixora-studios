import { createServerFn } from '@tanstack/react-start';
import { feedbackSchema } from './creator-feedback';

export const recordCreatorFeedback = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => feedbackSchema.parse(input))
  .handler(async ({ data }) => {
    // Deliberately public, narrowly scoped insert-only action. No rows are
    // ever read or returned; the privileged client never enters the browser
    // bundle. The table has RLS enabled with no policies (service-role only).
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { error } = await supabaseAdmin.from('creator_feedback').insert({
      prompt: data.prompt,
      style_used: data.styleUsed,
      feedback: data.feedback,
      preference: data.preference ?? null,
    });
    // Identical success either way: feedback must never block creation.
    if (error) console.error('creator_feedback insert failed', error.message);
    return { ok: true };
  });
