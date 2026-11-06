import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { lovable } from '@/integrations/lovable';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { studioHead } from '@/lib/studio-head';
import { safeAccountRedirect } from '@/lib/studio-core';

export const Route = createFileRoute('/login')({ ssr: false, validateSearch: (s: Record<string, unknown>) => ({ redirect: safeAccountRedirect(s['redirect']) }), head: () => studioHead('Sign in', 'Sign in to your private NIXORA studio.'), staticData: { sitemap: false }, component: Login });
function Login() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [signup, setSignup] = useState(false); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  async function social(provider: 'google' | 'lovable') {
    setBusy(true); setMessage('');
    try { sessionStorage.setItem('nixora_after_login', redirect); const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/auth` }); if (result.error) throw result.error; const { data } = await supabase.auth.getUser(); if (data.user) await navigate({ href: safeAccountRedirect(redirect) }); }
    catch { setMessage('Sign-in could not finish. Please try again.'); } finally { setBusy(false); }
  }
  return <main className="launch-theme flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground"><div className="w-full max-w-md space-y-6">
    <Link to="/" className="font-bold">NIXORA STUDIOS.</Link><h1 className="text-3xl font-bold">{signup ? 'Create your account' : 'Welcome back'}</h1>
    <div className="grid gap-3"><Button disabled={busy} onClick={() => social('google')}>Continue with Google</Button><Button variant="outline" disabled={busy} onClick={() => social('lovable')}>Continue with Lovable</Button></div>
    <form className="space-y-4" onSubmit={async e => { e.preventDefault(); setBusy(true); setMessage(''); sessionStorage.setItem('nixora_after_login', redirect); const result = signup ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth` } }) : await supabase.auth.signInWithPassword({ email, password }); setBusy(false); if (result.error) setMessage(result.error.message); else if (signup) setMessage('Check your email to verify your account before signing in.'); else await navigate({ href: safeAccountRedirect(redirect) }); }}>
      <label className="block text-sm">Email<Input type="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label className="block text-sm">Password<Input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} /></label>
      <Button type="submit" disabled={busy} className="w-full">{busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}</Button>
    </form><Button variant="ghost" onClick={() => setSignup(!signup)}>{signup ? 'Already have an account? Sign in' : 'Create an account'}</Button>
    <Button variant="ghost" onClick={async () => { if (!email) { setMessage('Enter your email first.'); return; } sessionStorage.setItem('nixora_after_login', '/profile'); const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth` }); setMessage(error ? error.message : 'If this account exists, a recovery email has been requested.'); }}>Forgot password</Button>
    {message && <p role="status" className="text-sm text-primary">{message}</p>}
  </div></main>;
}