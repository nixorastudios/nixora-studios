import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { lovable } from '@/integrations/lovable';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { studioHead } from '@/lib/studio-head';
import { safeAccountRedirect } from '@/lib/studio-core';
import { BackToHome } from '@/components/OptionAPricing';
import { hasVerifiedEmail, isEmailUnconfirmed, VERIFICATION_REDIRECT_URL } from '@/lib/email-verification';

export const Route = createFileRoute('/login')({ ssr: false, validateSearch: (s: Record<string, unknown>) => ({ redirect: safeAccountRedirect(s['redirect']) }), head: () => studioHead('Sign in', 'Sign in to your private NIXORA studio.'), staticData: { sitemap: false }, component: Login });
function Login() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  async function social(provider: 'google' | 'lovable') {
    setBusy(true); setMessage('');
    try { sessionStorage.setItem('nixora_after_login', redirect); const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/auth` }); if (result.error) throw result.error; const { data } = await supabase.auth.getUser(); if (data.user) await navigate({ href: safeAccountRedirect(redirect) }); }
    catch { setMessage('Sign-in could not finish. Please try again.'); } finally { setBusy(false); }
  }
  async function passwordSignIn(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMessage(''); setNeedsVerification(false);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        const unconfirmed = isEmailUnconfirmed(error);
        setNeedsVerification(unconfirmed);
        setMessage(unconfirmed ? 'Please verify your email first. Resend link' : error.message);
        return;
      }
      const { data, error: userError } = await supabase.auth.getUser();
      if (userError || !hasVerifiedEmail(data.user)) {
        await supabase.auth.signOut();
        setNeedsVerification(!userError);
        setMessage(userError ? 'Unable to verify your account. Please sign in again.' : 'Please verify your email first. Resend link');
        return;
      }
      await navigate({ href: safeAccountRedirect(redirect) });
    } catch { setMessage('Sign-in could not finish. Please try again.'); }
    finally { setBusy(false); }
  }
  async function resendVerification() {
    if (!email.trim()) { setMessage('Enter your email first.'); return; }
    setBusy(true);
    try {
      sessionStorage.setItem('nixora_after_login', redirect);
      const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: VERIFICATION_REDIRECT_URL } });
      setMessage(error ? error.message : 'Check your email - click link to verify - check spam too.');
    } catch { setMessage('Unable to request a verification email. Please try again.'); }
    finally { setBusy(false); }
  }
  return <main className="launch-theme min-h-screen bg-background px-6 py-10 text-foreground"><div className="mx-auto w-full max-w-md space-y-6">
    <BackToHome /><h1 className="text-3xl font-bold">Sign In</h1>
    <form onSubmit={passwordSignIn} className="space-y-4"><label className="block text-sm">Email<Input type="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} /></label><label className="block text-sm">Password<Input type="password" required value={password} onChange={e => setPassword(e.target.value)} /></label><Button type="submit" className="w-full" disabled={busy}>Sign In</Button></form>
    <p className="text-sm">Don't have account? <Link to="/signup" className="text-primary underline">Create Account</Link></p>
    <p className="text-center text-xs text-muted-foreground">or</p>
    <div className="grid gap-3"><Button disabled={busy} onClick={() => social('google')}>Continue with Google</Button><Button variant="outline" disabled={busy} onClick={() => social('lovable')}>Continue with Lovable</Button></div>
    <Button variant="ghost" onClick={async () => { if (!email) { setMessage('Enter your email first.'); return; } sessionStorage.setItem('nixora_after_login', '/profile'); const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth` }); setMessage(error ? error.message : 'If this account exists, a recovery email has been requested.'); }}>Forgot password</Button>
    {message && <p role="status" className="text-sm text-primary">{message}</p>}
    {needsVerification && <Button variant="outline" className="w-full" disabled={busy} onClick={resendVerification}>Resend Verification Email</Button>}
  </div></main>;
}