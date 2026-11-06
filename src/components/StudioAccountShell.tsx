import { Link, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import type { ReactNode } from 'react';

export function StudioAccountShell({ title, children }: { title: string; children: ReactNode }) {
  const navigate = useNavigate();
  const cache = useQueryClient();
  return <main className="launch-theme min-h-screen bg-background text-foreground">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-5">
      <Link to="/" className="font-bold">NIXORA STUDIOS.</Link>
      <nav className="flex flex-wrap items-center gap-4 text-sm" aria-label="Account">
        <Link to="/dashboard">Dashboard</Link><Link to="/profile">Profile</Link><Link to="/checkout">Credits</Link>
        <Button variant="ghost" size="icon" aria-label="Sign out" title="Sign out" onClick={async () => { await cache.cancelQueries(); cache.clear(); await supabase.auth.signOut(); await navigate({ to: '/login', replace: true }); }}><LogOut /></Button>
      </nav>
    </header>
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-10"><h1 className="text-3xl font-bold">{title}</h1>{children}</div>
  </main>;
}