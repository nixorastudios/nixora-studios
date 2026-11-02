import { describe, expect, it } from "vitest";
import { ALL_MODES, exportSize, generationSize } from "@/lib/image-studio";
import { validatePromptTask } from "@/lib/image-prompt.functions";

describe("text to image rules", () => {
  it("offers about 100 image types including the ones asked for", () => {
    expect(ALL_MODES.length).toBeGreaterThanOrEqual(100);
    for (const m of ["Banner", "Key frame", "Billboard", "Realistic", "Cinematic", "Product standard", "Turn image to professional"]) expect(ALL_MODES).toContain(m);
  });
  it("exports 4K and 16K by long edge, keeping proportions", () => {
    expect(exportSize("4K", 1536, 864)).toEqual({ width: 3840, height: 2160 });
    expect(exportSize("16K", 1536, 864)).toEqual({ width: 15360, height: 8640 });
    expect(exportSize("Native", 1024, 1024)).toEqual({ width: 1024, height: 1024 });
  });
  it("sends model-safe sizes", () => {
    expect(generationSize("9:16")).toBe("864x1536");
  });
  it("modify needs a change request", () => {
    expect(() => validatePromptTask({ task: "modify", text: "a cat", change: "" })).toThrow();
  });
});
