import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { PromptTask } from "@/lib/image-prompt.server";

export function validatePromptTask(input: unknown) {
  const o = (input ?? {}) as Record<string, unknown>;
  const task = o["task"];
  if (task !== "create" && task !== "modify" && task !== "scenes") throw new Error("Unknown prompt action");
  const text = typeof o["text"] === "string" ? o["text"].trim() : "";
  if (!text) throw new Error("Write an idea or prompt first");
  if (text.length > 3000) throw new Error("Your text is too long. Please shorten it.");
  const change = typeof o["change"] === "string" ? o["change"].trim().slice(0, 600) : "";
  if (task === "modify" && !change) throw new Error("Describe what to change");
  const style = typeof o["style"] === "string" ? o["style"].slice(0, 60) : "Create image";
  return { task: task as PromptTask, text, change, style };
}

export const imagePromptAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validatePromptTask)
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false as const, error: "AI is not connected yet." };
    const { runImagePrompt } = await import("@/lib/image-prompt.server");
    return runImagePrompt({ ...data, apiKey, signal: getRequest().signal });
  });
