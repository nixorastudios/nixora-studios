import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { composeVideoPrompt, type VideoSettings, type StudioJob } from './video-studio';

const BASE = 'https://ai.gateway.lovable.dev/v1';
const MODEL = 'google/gemini-omni-1.1-flash';
type Admin = SupabaseClient<Database>;
type Row = Database['public']['Tables']['studio_video_jobs']['Row'];
export class VideoError extends Error {
  constructor(public status: number, message: string, public type?: string) { super(message); }
}
async function request(key: string, path: string, body?: unknown) {
  const response = await fetch(`${BASE}/videos${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'X-Lovable-AIG-SDK': 'fetch' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({})) as { message?: string; type?: string };
    throw new VideoError(response.status, error.message || `Video service returned ${response.status}.`, error.type);
  }
  return response;
}
export async function createGatewayVideo(key: string, settings: VideoSettings) {
  return (await request(key, '', {
    model: MODEL, input: composeVideoPrompt(settings),
    response_format: { type: 'video', resolution: settings.resolution, duration: `${settings.duration}s`, aspect_ratio: settings.ratio },
  })).json() as Promise<{ id: string; status: string; progress?: number }>;
}
async function recordBlock(admin: Admin, error: unknown) {
  if (error instanceof VideoError && [402, 403].includes(error.status)) {
    await admin.from('studio_video_service_state').upsert({ id: 'video', blocked: true, message: error.message, status_code: error.status });
  }
}
export async function startStudioVideo(admin: Admin, userId: string, key: string, settings: VideoSettings) {
  const { data: block } = await admin.from('studio_video_service_state').select('*').eq('id', 'video').maybeSingle();
  if (block?.blocked) throw new VideoError(block.status_code || 403, block.message || 'Video generation is paused until service access is restored.');
  const { data: reservation, error } = await admin.from('studio_video_jobs').insert({ user_id: userId, prompt: settings.prompt, settings, status: 'submitting' }).select().single();
  if (error || !reservation) throw new Error('Another video is already rendering. Please wait for it to finish.');
  try {
    const job = await createGatewayVideo(key, settings);
    const { data: saved, error: saveError } = await admin.from('studio_video_jobs').update({ gateway_id: job.id, status: job.status, progress: job.progress || 0 }).eq('id', reservation.id).select().single();
    if (saveError || !saved) throw new Error('Video submitted, but the job could not be saved. Do not resubmit.');
    return toJob(admin, saved);
  } catch (error) {
    await recordBlock(admin, error);
    // An uncertain network outcome must not automatically create a second billed job.
    await admin.from('studio_video_jobs').update({ status: error instanceof VideoError ? 'failed' : 'submission_unknown', error_message: error instanceof Error ? error.message : 'Submission could not be confirmed. Do not resubmit.' }).eq('id', reservation.id);
    throw error;
  }
}
async function toJob(admin: Admin, row: Row): Promise<StudioJob> {
  let url: string | undefined;
  if (row.storage_path) {
    const signed = await admin.storage.from('studio-videos').createSignedUrl(row.storage_path, 3600);
    url = signed.data?.signedUrl;
  }
  return { id: row.id, prompt: row.prompt, settings: row.settings as VideoSettings, status: row.status, progress: row.progress, createdAt: row.created_at, url, error: row.error_message || undefined };
}
export async function readStudioJobs(admin: Admin, userId: string) {
  const { data, error } = await admin.from('studio_video_jobs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(30);
  if (error) throw new Error('Your video library could not be loaded.');
  return Promise.all((data || []).map(row => toJob(admin, row)));
}
export async function refreshStudioVideo(admin: Admin, userId: string, key: string, id: string) {
  const { data: row } = await admin.from('studio_video_jobs').select('*').eq('id', id).eq('user_id', userId).maybeSingle();
  if (!row) throw new Error('Video not found.');
  if (row.storage_path || !row.gateway_id || ['failed', 'submission_unknown'].includes(row.status)) return toJob(admin, row);
  let job: { status: string; progress?: number; error?: { message?: string } };
  try { job = await (await request(key, `/${encodeURIComponent(row.gateway_id)}`)).json(); }
  catch (error) { await recordBlock(admin, error); throw error; }
  let path = row.storage_path;
  if (job.status === 'completed') {
    path = `${userId}/${id}.mp4`;
    const existing = await admin.storage.from('studio-videos').list(userId, { search: `${id}.mp4` });
    if (!existing.data?.some(file => file.name === `${id}.mp4`)) {
      const video = await request(key, `/${encodeURIComponent(row.gateway_id)}/content`);
      const { error } = await admin.storage.from('studio-videos').upload(path, await video.blob(), { contentType: 'video/mp4', upsert: false });
      if (error && !error.message.includes('already exists')) throw new Error('Video rendered, but saving failed. Refresh its status to save it; do not generate again.');
    }
  }
  const { data: updated, error } = await admin.from('studio_video_jobs').update({ status: job.status, progress: job.status === 'completed' ? 100 : Math.round(job.progress || 0), storage_path: path, error_message: job.error?.message || null }).eq('id', id).eq('user_id', userId).select().single();
  if (error || !updated) throw new Error('Video status could not be saved.');
  return toJob(admin, updated);
}