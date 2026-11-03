import { describe, expect, it } from "vitest";
import { appendStyleHint, isVaguePrompt, parsePromptHints } from "@/lib/image-studio";
import { applyFeedback, readPreferences } from "@/lib/creator-feedback";
import { feedbackSchema } from "@/lib/creator-feedback";

describe("smart prompt auto-setting", () => {
  it("detects realistic style keywords", () => {
    expect(parsePromptHints("a photorealistic lion").style).toBe("realistic");
    expect(parsePromptHints("an 8k portrait of a queen").style).toBe("realistic");
  });
  it("detects anime and 3d styles", () => {
    expect(parsePromptHints("an anime city at dusk").style).toBe("anime");
    expect(parsePromptHints("a 3d mascot for my brand").style).toBe("3d");
  });
  it("detects aspect hints", () => {
    expect(parsePromptHints("a widescreen desert").aspect).toBe("16:9");
    expect(parsePromptHints("a vertical poster").aspect).toBe("9:16");
    expect(parsePromptHints("a square icon").aspect).toBe("1:1");
  });
  it("flags vague prompts only when short and hintless", () => {
    expect(isVaguePrompt("a cat")).toBe(true);
    expect(isVaguePrompt("a realistic cat")).toBe(false);
    expect(isVaguePrompt("a cat sitting on a red chair in a sunny kitchen window")).toBe(false);
    expect(isVaguePrompt("")).toBe(false);
  });
  it("appends manual settings to the prompt", () => {
    expect(appendStyleHint("a cat.", "realistic style")).toBe("a cat, realistic style");
    expect(appendStyleHint("", "16:9 aspect ratio")).toBe("16:9 aspect ratio");
  });
});

describe("creator feedback preferences", () => {
  it("reads legacy or broken storage safely", () => {
    expect(readPreferences(null)).toEqual({ liked_styles: [], disliked_styles: [] });
    expect(readPreferences("not json")).toEqual({ liked_styles: [], disliked_styles: [] });
  });
  it("likes and dislikes move styles between lists", () => {
    let p = applyFeedback({ liked_styles: [], disliked_styles: [] }, "Realistic", "up");
    expect(p.liked_styles).toContain("Realistic");
    p = applyFeedback(p, "Realistic", "down", "More vibrant");
    expect(p.liked_styles).not.toContain("Realistic");
    expect(p.disliked_styles).toContain("Realistic");
    expect(p.last_feedback).toBe("More vibrant");
  });
  it("validates feedback payloads", () => {
    expect(feedbackSchema.safeParse({ prompt: "a cat", styleUsed: "Realistic", feedback: "up" }).success).toBe(true);
    expect(feedbackSchema.safeParse({ prompt: "", styleUsed: "Realistic", feedback: "up" }).success).toBe(false);
    expect(feedbackSchema.safeParse({ prompt: "a cat", styleUsed: "Realistic", feedback: "sideways" }).success).toBe(false);
  });
});
