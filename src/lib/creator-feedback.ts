// Pure, browser-safe rules for creator style feedback (thumbs up/down after a
// generation). Shared by the studio UI, the server function and tests.

import { z } from "zod";

export const feedbackSchema = z.object({
  prompt: z.string().trim().min(1).max(3400),
  styleUsed: z.string().trim().min(1).max(80),
  feedback: z.enum(["up", "down"]),
  preference: z.string().trim().max(80).optional(),
});
export type CreatorFeedbackInput = z.infer<typeof feedbackSchema>;

export interface CreatorPreferences {
  liked_styles: string[];
  disliked_styles: string[];
  last_feedback?: string;
}

export const PREFS_KEY = "creator_preferences";

export function readPreferences(raw: string | null): CreatorPreferences {
  if (!raw) return { liked_styles: [], disliked_styles: [] };
  try {
    const p = JSON.parse(raw) as Partial<CreatorPreferences>;
    return {
      liked_styles: Array.isArray(p.liked_styles) ? p.liked_styles.filter((s) => typeof s === "string") : [],
      disliked_styles: Array.isArray(p.disliked_styles) ? p.disliked_styles.filter((s) => typeof s === "string") : [],
      last_feedback: typeof p.last_feedback === "string" ? p.last_feedback : undefined,
    };
  } catch {
    return { liked_styles: [], disliked_styles: [] };
  }
}

/** Record one thumbs up/down into the preference profile (deduplicated). */
export function applyFeedback(prefs: CreatorPreferences, style: string, feedback: "up" | "down", preference?: string): CreatorPreferences {
  const liked = new Set(prefs.liked_styles);
  const disliked = new Set(prefs.disliked_styles);
  if (feedback === "up") { liked.add(style); disliked.delete(style); }
  else { disliked.add(style); liked.delete(style); }
  return {
    liked_styles: [...liked],
    disliked_styles: [...disliked],
    last_feedback: preference ?? prefs.last_feedback,
  };
}
