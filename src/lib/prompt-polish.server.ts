import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, Output, streamText } from "ai";
import { z } from "zod";

const LOVABLE_AIG_RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";
const GATEWAY_BASE_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL_ID = "openai/gpt-6-astra";

function createLovableAiGatewayRunIdFetch(initialRunId?: string) {
  let runId = initialRunId?.trim() || undefined;
  let resolveRunId: (value: string | undefined) => void = () => {};
  let runIdResolved = false;
  const runIdReady = new Promise<string | undefined>((resolve) => {
    resolveRunId = resolve;
  });

  const publishRunId = (value?: string) => {
    const nextRunId = value?.trim() || undefined;
    if (!runId && nextRunId) runId = nextRunId;
    if (!runIdResolved) {
      runIdResolved = true;
      resolveRunId(runId);
    }
  };
  if (runId) publishRunId(runId);

  return {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (runId && !headers.has(LOVABLE_AIG_RUN_ID_HEADER)) headers.set(LOVABLE_AIG_RUN_ID_HEADER, runId);
      try {
        const response = await fetch(input, { ...init, headers });
        publishRunId(response.headers.get(LOVABLE_AIG_RUN_ID_HEADER) ?? undefined);
        return response;
      } catch (error) {
        publishRunId(undefined);
        throw error;
      }
    },
    getRunId: () => runId,
  };
}

export function getLovableAiGatewayRunId(request: Request) {
  return request.headers.get(LOVABLE_AIG_RUN_ID_HEADER)?.trim() || undefined;
}

const polishedPromptSchema = z
  .object({
    title: z.string().describe("Short label for the shot, at most 8 words"),
    prompt: z
      .string()
      .describe("The polished generation prompt, 60 to 140 words, plain prose, no bullet points"),
  })
  .strict();

const INSTRUCTIONS = [
  "You write generation prompts for an AI video studio.",
  "The visitor gives a rough idea for one shot or clip. Turn it into one polished generation prompt.",
  "Keep every detail the visitor gave: subject, action, mood, place, characters, colour, dialogue.",
  "Add only what a video engine needs to render it: camera framing and movement, lens or shot type,",
  "lighting, colour grade, motion, pace, aspect-ratio feel, and sound or ambience cues.",
  "Never invent a brand, a real person, on-screen text, or a price.",
  "Write the prompt as flowing prose describing what the camera sees, not as advice to the visitor.",
  "Reply only with the requested fields.",
].join(" ");

export type PolishedPrompt = { ok: true; title: string; prompt: string } | { ok: false; error: string };

function safeError(error: unknown): string {
  if (error instanceof APICallError) {
    if (error.statusCode === 402) return "AI credits are unavailable right now. Please try again later.";
    if (error.statusCode === 429) return "The AI is busy. Please wait a moment and try again.";
    if (error.statusCode && error.statusCode >= 500) return "The AI service is temporarily unavailable. Please try again.";
    return "The AI could not finish this prompt. Please try again.";
  }
  if (error instanceof Error && error.name === "AbortError") return "Prompt polishing was cancelled.";
  return "The AI could not finish this prompt. Please try again.";
}

export async function polishVideoPrompt(options: {
  idea: string;
  engine: string;
  apiKey: string;
  runId: string | undefined;
  signal: AbortSignal | undefined;
}): Promise<PolishedPrompt> {
  const runIdFetch = createLovableAiGatewayRunIdFetch(options.runId);
  const provider = createOpenAI({
    baseURL: GATEWAY_BASE_URL,
    apiKey: options.apiKey,
    headers: { "Lovable-API-Key": options.apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  try {
    const result = streamText({
      model: provider.responses(MODEL_ID),
      instructions: INSTRUCTIONS,
      messages: [
        {
          role: "user",
          content: `Engine: ${options.engine}\nVisitor's idea: ${options.idea}`,
        },
      ],
      output: Output.object({ schema: polishedPromptSchema }),
      ...(options.signal ? { abortSignal: options.signal } : {}),
      providerOptions: {
        openai: {
          store: false,
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          include: ["reasoning.encrypted_content"],
        },
      },
    });

    const output = await result.output;
    const prompt = output.prompt.trim();
    if (!prompt) return { ok: false, error: "The AI returned an empty prompt. Please try again." };
    return { ok: true, title: output.title.trim(), prompt };
  } catch (error) {
    return { ok: false, error: safeError(error) };
  }
}
