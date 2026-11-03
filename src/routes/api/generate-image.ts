import { createFileRoute } from "@tanstack/react-router";
import { validateImagePrompt } from "@/lib/image-studio";
import { isImageEnginePreviewHost } from "@/lib/featureFlags";

export const Route = createFileRoute("/api/generate-image")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isImageEnginePreviewHost(new URL(request.url).hostname)) return new Response("Text to Image launches Nov 23, 2026. Join the waitlist.", { status: 403 });
        const { verifyCaller, generateImage, passThrough, safeSize } = await import("@/lib/image-gateway.server");
        if (!(await verifyCaller(request))) return new Response("Please sign in to generate images.", { status: 401 });
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("AI is not connected yet.", { status: 500 });
        let body: Record<string, unknown>;
        try { body = await request.json(); } catch { return new Response("Invalid request", { status: 400 }); }
        let prompt: string;
        try { prompt = validateImagePrompt(body["prompt"]); } catch (e) { return new Response((e as Error).message, { status: 400 }); }
        return passThrough(await generateImage(apiKey, prompt, safeSize(body["size"]), body["stream"] !== false));
      },
    },
  },
});
