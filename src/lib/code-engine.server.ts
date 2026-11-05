import { createClient } from '@supabase/supabase-js';
import { createOpenAI } from '@ai-sdk/openai';
import { Output, streamText } from 'ai';
import { z } from 'zod';
import { PROFESSIONS, assertCanBuild, checkCodeFiles, codePlanSchema, codeBuildSchema } from './code-engine';
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId, getLovableAiGatewayResponseHeaders } from './code-engine/run-id.ts';

const requestSchema = z.object({ id: z.string().uuid(), action: z.enum(['plan','build','fix','feature','suggest']), instruction: z.string().max(12000).default(''), reference: z.string().max(2_000_000).regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/).nullable().optional() });
const guide = `You are NIXORA CODE ENGINE, a professional creative prototyping assistant. Adapt to the selected profession. Give concise decision summaries, never hidden internal reasoning. Do not claim engineering certification, structural safety, production readiness, executed tests or actual deployments. Identify unsafe engineering assumptions and require a licensed professional for real structural/mechanical work. No secrets, real payments, network dependencies or tracking in generated projects. Plans must contain five concise steps labeled Understand, Plan, Design, Build, Check, warnings, remaining needs, and clearly labeled approximate time and cost ranges. AI usage is billed separately in workspace credits; never invent exact pricing. For builds produce a complete runnable plain HTML/CSS/JavaScript prototype with index.html and optional style.css/script.js. All assets must be inline SVG, CSS, or data URIs; no external imports or libraries. Include real interactions, polished responsive layouts, accessible controls and correct calculations. For engineering projects create a labeled conceptual browser visualization, not a certified blueprint. Keep files under 500 KB total. The scene field describes an optional conceptual primitive 3D view, never an exact CAD result. Only kind building, car, machine, sculpture or none. Never claim missing database, payments, domain, GitHub or hosting integrations exist. After build list concrete remaining needs and actual changes. Follow the approved plan; fix syntax/runtime errors reported by the user. Refuse unsafe ideas with warnings rather than building dangerous instructions.`;

export async function handleCodeEngine(request: Request) {
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!token || !url || !key) return new Response('Sign in to use NIXORA CODE ENGINE.', { status: 401 });
  const client = createClient(url, key, { global: { headers: { Authorization: `Bearer ${token}` }, fetch: (input, init) => { const h = new Headers(init?.headers); h.set('apikey', key); return fetch(input, { ...init, headers: h }); } }, auth: { persistSession: false, autoRefreshToken: false } });
  const { data: claims, error: authError } = await client.auth.getClaims(token);
  const userId = claims?.claims?.sub;
  if (authError || !userId) return new Response('Sign in again to continue.', { status: 401 });
  let data: z.infer<typeof requestSchema>;
  try { data = requestSchema.parse(await request.json()); } catch { return new Response('Invalid project request.', { status: 400 }); }
  const { data: project, error } = await client.from('code_engine_projects').select('*').eq('id', data.id).single();
  if (error || !project || project.user_id !== userId) return new Response('Project access denied.', { status: 403 });
  if (!PROFESSIONS.includes(project.profession as typeof PROFESSIONS[number])) return new Response('Select a supported profession.', { status: 400 });
  if (data.action !== 'plan' && data.action !== 'suggest') {
    try { assertCanBuild({ plan: project.plan ? codePlanSchema.parse(project.plan) : null, approved: project.approved }); } catch { return new Response('Approve the plan before building.', { status: 409 }); }
  }
  if (!project.idea.trim()) return new Response('Enter your project idea first.', { status: 400 });
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data: blocked, error: blockError } = await supabaseAdmin.from('code_engine_ai_blocks').select('reason').eq('user_id', userId).maybeSingle();
  if (blockError) return new Response('Could not check AI access.', { status: 503 });
  if (blocked) return new Response(blocked.reason, { status: 403 });
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) return new Response('AI configuration is missing. Connect Lovable AI first.', { status: 500 });
  const run = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  let upstreamFailure: { status: number; message: string } | undefined;
  const provider = createOpenAI({ baseURL: 'https://ai.gateway.lovable.dev/v1', apiKey, headers: { 'Lovable-API-Key': apiKey, 'X-Lovable-AIG-SDK': 'vercel-ai-sdk' }, fetch: async (input, init) => {
    const response = await run.fetch(input, init);
    if (!response.ok) {
      const body = await response.clone().json().catch(() => ({})) as { message?: string; error?: { message?: string; type?: string } };
      const message = body.message ?? body.error?.message ?? `AI request failed (${response.status}).`;
      upstreamFailure = { status: response.status, message };
      if (response.status === 402 || response.status === 403) await supabaseAdmin.from('code_engine_ai_blocks').upsert({ user_id: userId, reason: message });
    }
    return response;
  } });
  const planning = data.action === 'plan' || data.action === 'suggest';
  const result = streamText({
    model: provider.responses('openai/gpt-6-astra'), instructions: guide,
    messages: [{ role: 'user', content: [{ type: 'text', text: JSON.stringify({ action: data.action, profession: project.profession, idea: project.idea, approvedPlan: project.approved ? project.plan : null, files: planning ? [] : project.files, instruction: data.instruction }) }, ...(data.reference ? [{ type: 'image' as const, image: data.reference }] : [])] }],
    output: planning ? Output.object({ schema: codePlanSchema }) : Output.object({ schema: codeBuildSchema }),
    abortSignal: request.signal, maxRetries: 0,
    providerOptions: { openai: { forceReasoning: true, reasoningEffort: 'medium', reasoningSummary: 'auto', store: false, include: ['reasoning.encrypted_content'] } },
  });
  const iterator = result.fullStream[Symbol.asyncIterator]();
  const first = await iterator.next().catch(() => undefined);
  await run.waitForRunId();
  if (upstreamFailure) return new Response(upstreamFailure.message, { status: upstreamFailure.status });
  const encoder = new TextEncoder();
  const stream = new ReadableStream({ async start(controller) {
    const emit = (event: string, value: unknown) => controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(value)}\n\n`));
    try {
      emit('status', { message: planning ? 'Preparing your plan…' : 'Building your approved project…' });
      let part = first;
      while (part && !part.done) {
        if (part.value.type === 'reasoning-delta') emit('summary', { text: part.value.text });
        if (part.value.type === 'error') throw part.value.error;
        part = await iterator.next();
      }
      const output = await result.output;
      if (planning) {
        const plan = codePlanSchema.parse(output);
        if (data.action === 'plan') {
          const { error: save } = await supabaseAdmin.from('code_engine_projects').update({ plan, approved: false, updated_at: new Date().toISOString() }).eq('id', data.id).eq('user_id', userId);
          if (save) throw new Error('Plan generated but Cloud save failed.');
        }
        emit('result', { type: 'plan', data: plan, action: data.action });
      } else {
        const build = codeBuildSchema.parse(output);
        if (JSON.stringify(build.files).length > 1_000_000) throw new Error('Generated project is too large to save.');
        const checks = checkCodeFiles(build.files);
        const { error: save } = await supabaseAdmin.from('code_engine_projects').update({ files: build.files, updated_at: new Date().toISOString() }).eq('id', data.id).eq('user_id', userId);
        if (save) throw new Error('Build generated but Cloud save failed.');
        const { error: versionError } = await supabaseAdmin.from('code_engine_versions').insert({ project_id: data.id, user_id: userId, files: build.files, summary: build.summary });
        if (versionError) throw new Error('Project saved, but version backup failed.');
        emit('result', { type: 'build', data: build, checks });
      }
      const usage = await result.totalUsage;
      emit('usage', { inputTokens: usage.inputTokens, outputTokens: usage.outputTokens, credits: null, runId: run.getRunId() });
    } catch (e) {
      emit('error', { message: request.signal.aborted ? 'Generation stopped.' : upstreamFailure?.message ?? (e instanceof Error ? e.message : 'The AI could not complete this request.') });
    } finally { controller.close(); }
  } });
  const headers = getLovableAiGatewayResponseHeaders(undefined, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store' });
  if (run.getRunId()) headers.set('X-Lovable-AIG-Run-ID', run.getRunId() ?? '');
  return new Response(stream, { headers });
}