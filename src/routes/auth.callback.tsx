import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { hasVerifiedEmail, VERIFIED_WELCOME_KEY } from '@/lib/email-verification';
import { studioHead } from '@/lib/studio-head';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/auth/callback')({
  ssr: false,
  head: () => studioHead('Email verification', 'Verify your email and enter your NIXORA studio.'),
  staticData: { sitemap: false },
  component: VerificationCallback,
});

function VerificationCallback() {
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    async function finish() {
      const query = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.slice(1));
      if (query.has('error') || hash.has('error')) throw new Error('Invalid verification link');
      const { data: session } = await supabase.auth.getSession();
      const code = query.get('code');
      if (!session.session && code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;
      }
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user || !hasVerifiedEmail(data.user)) throw new Error('Verification required');
      if (!active) return;
      // Remove callback tokens from browser history before entering the private studio.
      window.history.replaceState(null, '', '/auth/callback');
      sessionStorage.setItem(VERIFIED_WELCOME_KEY, data.user.id);
      sessionStorage.removeItem('nixora_after_login');
      await navigate({ to: '/my-studio', replace: true });
    }
    void finish().catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [navigate]);
  return <main className="launch-theme min-h-screen bg-background p-8 text-foreground">
    <p role="status">{failed ? 'This verification link has expired or could not finish. Sign in to request a new verification email.' : 'Verifying your email…'}</p>
    {failed && <Button asChild className="mt-4"><Link to="/login" search={{ redirect: '/my-studio' }}>Return to Sign In</Link></Button>}
  </main>;
}