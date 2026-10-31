import { createServerFn } from '@tanstack/react-start';
import { persistWaitlistSignup, waitlistSchema } from './waitlist';

export const joinLaunchWaitlist = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => waitlistSchema.parse(input))
  .handler(async ({ data }) => {
    // Deliberately public, narrowly scoped insert-only action. No private rows
    // are read or returned; privileged client never enters the browser bundle.
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    return persistWaitlistSignup(data, async signup => {
      const { error } = await supabaseAdmin.from('waitlist_signups').insert(signup);
      return { error };
    });
  });