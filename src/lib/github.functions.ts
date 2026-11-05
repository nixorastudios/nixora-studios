import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
import { projectFileSchema } from './code-engine';

const GATEWAY = 'https://connector-gateway.lovable.dev/github';

type Ctx = { supabase: any; userId: string };

async function requireOwner(context: Ctx) {
  const { data } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'owner' });
  if (data !== true) throw new Error('Only the owner can manage GitHub connections.');
}

function gatewayKeys() {
  const lovableKey = process.env['LOVABLE_API_KEY'];
  const githubKey = process.env['GITHUB_API_KEY'];
  if (!lovableKey || !githubKey) return null;
  return { lovableKey, githubKey };
}

async function gh(path: string, init: RequestInit = {}) {
  const keys = gatewayKeys();
  if (!keys) throw new Error('GitHub is not connected yet. Connect it from the Connections page.');
  const response = await fetch(`${GATEWAY}/${path.replace(/^\//, '')}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${keys.lovableKey}`,
      'X-Connection-Api-Key': keys.githubKey,
      ...(init.headers ?? {}),
    },
  });
  const body = await response.text();
  if (!response.ok) {
    console.error(`GitHub request failed [${response.status}]: ${body}`);
    throw new Error(`GitHub request failed [${response.status}]: ${body.slice(0, 300)}`);
  }
  return body ? JSON.parse(body) : null;
}

export const getGitHubStatus = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await requireOwner(context as unknown as Ctx);
  if (!gatewayKeys()) return { connected: false as const };
  try {
    const user = await gh('/user');
    return { connected: true as const, username: String(user.login), avatar: String(user.avatar_url ?? '') };
  } catch {
    return { connected: false as const, error: 'GitHub connection needs to be re-linked.' };
  }
});

export const listGitHubRepos = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await requireOwner(context as unknown as Ctx);
  const repos = await gh('/user/repos?per_page=100&sort=updated');
  return (repos as any[]).map(r => ({ name: String(r.name), fullName: String(r.full_name), private: r.private === true }));
});

const pushSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().trim().min(1).max(100),
  repo: z.string().regex(/^[\w.-]{1,100}$/, 'Choose a valid repository name.'),
  files: z.array(projectFileSchema).min(1).max(30),
});

export const pushProjectToGitHub = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(v => pushSchema.parse(v)).handler(async ({ data, context }) => {
  await requireOwner(context as unknown as Ctx);
  if (JSON.stringify(data.files).length > 1_000_000) throw new Error('Project exceeds the 1 MB push limit.');
  const user = await gh('/user');
  const owner = String(user.login);
  // Create the repository if it does not exist yet (422 = already exists).
  try {
    await gh('/user/repos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: data.repo, private: true, auto_init: true, description: `NIXORA CODE ENGINE project: ${data.name}` }) });
  } catch (e) {
    if (!(e instanceof Error && e.message.includes('[422]'))) throw e;
  }
  // Version number = current commit count + 1.
  let version = 1;
  try {
    const commits = await gh(`/repos/${owner}/${data.repo}/commits?per_page=100`);
    version = (commits as any[]).length + 1;
  } catch { /* empty repository */ }
  for (const file of data.files) {
    let sha: string | undefined;
    try {
      const existing = await gh(`/repos/${owner}/${data.repo}/contents/${file.path}`);
      sha = existing?.sha;
    } catch { /* new file */ }
    await gh(`/repos/${owner}/${data.repo}/contents/${file.path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `Version ${version}: ${data.name} (${file.path})`, content: btoa(unescape(encodeURIComponent(file.content))), ...(sha ? { sha } : {}) }),
    });
  }
  return { version, repo: `${owner}/${data.repo}`, url: `https://github.com/${owner}/${data.repo}` };
});

export const listGitHubCommits = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(v => z.object({ repo: z.string().regex(/^[\w.-]{1,100}$/) }).parse(v)).handler(async ({ data, context }) => {
  await requireOwner(context as unknown as Ctx);
  const user = await gh('/user');
  const commits = await gh(`/repos/${String(user.login)}/${data.repo}/commits?per_page=30`);
  return (commits as any[]).map(c => ({ sha: String(c.sha).slice(0, 7), message: String(c.commit?.message ?? '').slice(0, 120), date: String(c.commit?.author?.date ?? '') }));
});
