import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, Output, streamText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayRunIdFetch } from "@/lib/prompt-polish.server";

export type PromptTask = "create" | "modify" | "scenes";
export type PromptResult =
  | { ok: true; prompt: string; scenes: { title: string; prompt: string }[] }
  | { ok: false; error: string };

const schema = z
  .object({
    prompt: z.string().describe("The finished image prompt, 50 to 140 words of plain prose. For scene splits, a one-line summary of the whole story."),
    scenes: z.array(z.object({ title: z.string(), prompt: z.string() }).strict()).describe("Only for scene splits: 3 to 8 scenes in story order, each a complete standalone image prompt with the same characters described consistently. Otherwise an empty array."),
  })
  .strict();

const BASE = "You write prompts for a professional, international AI image studio. Keep every detail the creator gave. Add composition, lens, lighting, colour, texture and mood a world-class art director would specify. Never invent a brand, real person or price. Reply only with the requested fields.";
const TASK: Record<PromptTask, string> = {
  create: "Turn the creator's rough idea into one polished image prompt. Return an empty scenes array.",
  modify: "Rewrite the existing prompt applying the creator's change request exactly, keeping everything else. Return an empty scenes array.",
  scenes: "Divide the creator's story into individual movie scenes, one key-frame image prompt per scene, keeping characters, wardrobe and world consistent across scenes.",
};

export async function runImagePrompt(o: { task: PromptTask; text: string; change: string; style: string; apiKey: string; signal?: AbortSignal }): Promise<PromptResult> {
  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: o.apiKey,
    headers: { "Lovable-API-Key": o.apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  try {
    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      instructions: `${BASE} ${TASK[o.task]}`,
      messages: [{ role: "user", content: `Style: ${o.style}\nText: ${o.text}${o.task === "modify" ? `\nChange request: ${o.change}` : ""}` }],
      output: Output.object({ schema }),
      ...(o.signal ? { abortSignal: o.signal } : {}),
      providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] } },
    });
    const out = await result.output;
    return { ok: true, prompt: out.prompt.trim(), scenes: o.task === "scenes" ? out.scenes : [] };
  } catch (error) {
    if (error instanceof APICallError) {
      if (error.statusCode === 402) return { ok: false, error: "AI credits are unavailable right now. Please try again later." };
      if (error.statusCode === 429) return { ok: false, error: "The AI is busy. Please wait a moment and try again." };
    }
    return { ok: false, error: "The AI could not finish this prompt. Please try again." };
  }
}
