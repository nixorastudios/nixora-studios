import { createFileRoute } from "@tanstack/react-router";
import { validateImagePrompt } from "@/lib/image-studio";

const MAX_FILE = 12 * 1024 * 1024;

export const Route = createFileRoute("/api/edit-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { verifyCaller, editImage, passThrough } = await import("@/lib/image-gateway.server");
        if (!(await verifyCaller(request))) return new Response("Please sign in to edit images.", { status: 401 });
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("AI is not connected yet.", { status: 500 });
        let form: FormData;
        try { form = await request.formData(); } catch { return new Response("Invalid upload", { status: 400 }); }
        try { form.set("prompt", validateImagePrompt(form.get("prompt"))); } catch (e) { return new Response((e as Error).message, { status: 400 }); }
        const files = form.getAll("image[]").filter((f): f is File => f instanceof File);
        if (!files.length || files.length > 4) return new Response("Add between one and four reference images.", { status: 400 });
        if (files.some((f) => !f.type.startsWith("image/") || f.size > MAX_FILE)) return new Response("Each reference must be an image under 12 MB.", { status: 400 });
        return passThrough(await editImage(apiKey, form));
      },
    },
  },
});
