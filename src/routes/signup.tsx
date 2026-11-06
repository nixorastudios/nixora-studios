import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { studioHead } from '@/lib/studio-head';
import { BackToHome } from '@/components/OptionAPricing';

export const Route = createFileRoute('/signup')({ ssr: false, head: () => studioHead('Create account', 'Create your NIXORA STUDIOS account.'), staticData: { sitemap: false }, component: Signup });

function Signup() {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault(); setMessage('');
    if (name.trim().length < 2) return setMessage('Enter your full name.');
    if (password.length < 8) return setMessage('Password must be at least 8 characters.');
    if (password !== confirm) return setMessage('Passwords do not match.');
    setBusy(true);
    sessionStorage.setItem('nixora_after_login', '/my-studio');
    const { error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: `${window.location.origin}/auth`, data: { full_name: name.trim() } } });
    setBusy(false);
    setMessage(error ? error.message : 'Account created. Check your email to confirm, then sign in.');
  }
  return <main className="launch-theme min-h-screen bg-background px-6 py-10 text-foreground"><div className="mx-auto w-full max-w-md space-y-6">
    <BackToHome />
    <h1 className="text-3xl font-bold">Create Account</h1>
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm">Full Name<Input required maxLength={120} value={name} onChange={e => setName(e.target.value)} /></label>
      <label className="block text-sm">Email<Input type="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label className="block text-sm">Password<Input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} /></label>
      <label className="block text-sm">Confirm Password<Input type="password" required minLength={8} value={confirm} onChange={e => setConfirm(e.target.value)} /></label>
      <Button type="submit" className="w-full" disabled={busy}>{busy ? 'Creating…' : 'Create Account'}</Button>
    </form>
    {message && <p role="status" className="text-sm text-primary">{message}</p>}
    <p className="text-sm">Already have an account? <Link to="/login" search={{ redirect: '/my-studio' }} className="text-primary underline">Sign In</Link></p>
  </div></main>;
}
