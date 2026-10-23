import { createServerFn, getRequest } from "@tanstack/react-start";

export const MAX_IDEA_LENGTH = 1200;

export type PolishInput = { idea: string; engine: string };

export function validatePolishInput(input: unknown): PolishInput {
  if (typeof input !== "object" || input === null) throw new Error("Enter your idea first");
  const { idea, engine } = input as Record<string, unknown>;
  if (typeof idea !== "string" || !idea.trim()) throw new Error("Enter your idea first");
  if (idea.length > MAX_IDEA_LENGTH) throw new Error("Your idea is too long. Please shorten it.");
  if (typeof engine !== "string" || !engine.trim() || engine.length > 60) throw new Error("Unknown engine");
  return { idea: idea.trim(), engine: engine.trim() };
}

export const polishVideoPrompt = createServerFn({ method: "POST" })
  .inputValidator(validatePolishInput)
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false as const, error: "AI is not connected yet. Please try again later." };

    const request = getRequest();
    const { polishVideoPrompt: runPolish, getLovableAiGatewayRunId } = await import("@/lib/prompt-polish.server");
    return runPolish({
      idea: data.idea,
      engine: data.engine,
      apiKey,
      runId: getLovableAiGatewayRunId(request),
      signal: request.signal,
    });
  });
