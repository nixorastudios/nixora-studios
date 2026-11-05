import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
import { PROFESSIONS, checkCodeFiles, projectFileSchema, publishSlug } from './code-engine';

const saveSchema = z.object({ id: z.string().uuid(), name: z.string().trim().min(1).max(100), profession: z.enum(PROFESSIONS), idea: z.string().max(12000), files: z.array(projectFileSchema).max(30) });
export const saveCodeProject = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(v => saveSchema.parse(v)).handler(async ({ data, context }) => {
  if (JSON.stringify(data.files).length > 1_000_000) throw new Error('Project exceeds the 1 MB save limit.');
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data: row, error } = await supabaseAdmin.from('code_engine_projects').select('id,user_id,idea,profession').eq('id', data.id).maybeSingle();
  if (error) throw new Error('Could not check project access.');
  if (row && row.user_id !== context.userId) throw new Error('Project access denied.');
  const reset = row && (row.idea !== data.idea || row.profession !== data.profession);
  const { error: saveError } = await supabaseAdmin.from('code_engine_projects').upsert({ ...data, files: data.files, user_id: context.userId, updated_at: new Date().toISOString(), ...(reset ? { plan: null, approved: false } : {}) });
  if (saveError) throw new Error('Cloud save failed. Your local copy is unchanged.');
  return { ok: true };
});
export const listCodeProjects = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from('code_engine_projects').select('id,name,profession,idea,plan,approved,files,updated_at').order('updated_at', { ascending: false }).limit(50);
  if (error) throw new Error('Could not load your Cloud projects.');
  return data ?? [];
});
export const approveCodePlan = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(v => z.object({ id: z.string().uuid() }).parse(v)).handler(async ({ data, context }) => {
  const { data: project, error } = await context.supabase.from('code_engine_projects').select('plan').eq('id', data.id).single();
  if (error || !project?.plan) throw new Error('Generate a plan first.');
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { error: update } = await supabaseAdmin.from('code_engine_projects').update({ approved: true }).eq('id', data.id).eq('user_id', context.userId);
  if (update) throw new Error('Could not approve the plan.');
  return { ok: true };
});
export const listCodeVersions = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(v => z.object({ id: z.string().uuid() }).parse(v)).handler(async ({ data, context }) => {
  const { data: rows, error } = await context.supabase.from('code_engine_versions').select('id,files,summary,created_at').eq('project_id', data.id).order('created_at', { ascending: false }).limit(30);
  if (error) throw new Error('Could not load project history.');
  return rows ?? [];
});

export const deleteCodeProject = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(v => z.object({ id: z.string().uuid() }).parse(v)).handler(async ({ data, context }) => {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  await supabaseAdmin.from('code_engine_versions').delete().eq('project_id', data.id).eq('user_id', context.userId);
  const { error } = await supabaseAdmin.from('code_engine_projects').delete().eq('id', data.id).eq('user_id', context.userId);
  if (error) throw new Error('Could not delete the project.');
  return { ok: true };
});

export const publishCodeProject = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(v => z.object({ id: z.string().uuid() }).parse(v)).handler(async ({ data, context }) => {
  const { data: project, error } = await context.supabase.from('code_engine_projects').select('name,files').eq('id', data.id).single();
  if (error || !project) throw new Error('Save the project to Cloud before publishing.');
  const checks = checkCodeFiles(Array.isArray(project.files) ? project.files as { path: string; content: string }[] : []);
  if (!checks.passed) throw new Error(`Publishing blocked: ${checks.errors.join(' ')}`);
  const base = publishSlug(String(project.name));
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  // Find a free slug: name, name-2, name-3 …
  for (let attempt = 0; attempt < 20; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const { data: taken } = await supabaseAdmin.from('code_engine_projects').select('id').eq('publish_slug', slug).neq('id', data.id).maybeSingle();
    if (taken) continue;
    const { error: update } = await supabaseAdmin.from('code_engine_projects').update({ publish_slug: slug, published_at: new Date().toISOString() }).eq('id', data.id).eq('user_id', context.userId);
    if (update) throw new Error('Could not publish the project.');
    return { slug, path: `/projects/${slug}` };
  }
  throw new Error('No free publish link available for this name. Rename the project and try again.');
});

export const unpublishCodeProject = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(v => z.object({ id: z.string().uuid() }).parse(v)).handler(async ({ data, context }) => {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { error } = await supabaseAdmin.from('code_engine_projects').update({ published_at: null }).eq('id', data.id).eq('user_id', context.userId);
  if (error) throw new Error('Could not unpublish the project.');
  return { ok: true };
});