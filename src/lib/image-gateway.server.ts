import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://ai.gateway.lovable.dev";
const MODEL = "openai/gpt-image-2.5-sunburst";
const SIZES = new Set(["1024x1024", "1536x864", "864x1536", "1024x1280", "2304x768"]);

/** Returns the signed-in user's id, or null. Image generation costs credits, so only signed-in users may call it. */
export async function verifyCaller(request: Request): Promise<string | null> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!token || !url || !key) return null;
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await sb.auth.getClaims(token);
  return error || !data?.claims?.sub ? null : String(data.claims.sub);
}

export function safeSize(size: unknown) {
  return typeof size === "string" && SIZES.has(size) ? size : "1024x1024";
}

export function generateImage(apiKey: string, prompt: string, size: string, stream: boolean) {
  return fetch(`${BASE_URL}/v1/images/generations`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, prompt, size, quality: "high", ...(stream ? { stream: true, partial_images: 1 } : {}) }),
  });
}

export function editImage(apiKey: string, form: FormData) {
  const streaming = form.get("stream") !== "false";
  form.set("model", MODEL);
  form.set("quality", "high");
  form.set("size", safeSize(form.get("size")));
  if (streaming) {
    form.set("stream", "true");
    form.set("partial_images", "1");
  } else {
    form.delete("stream");
    form.delete("partial_images");
  }
  return fetch(`${BASE_URL}/v1/images/edits`, { method: "POST", headers: { Authorization: `Bearer ${apiKey}` }, body: form });
}

export function passThrough(upstream: Response) {
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json", "Cache-Control": "no-store" },
  });
}
