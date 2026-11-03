import { describe, expect, it } from "vitest";
import { isImageEnginePreviewHost } from "@/lib/featureFlags";

describe("image engine preview flag", () => {
  it("is on for the Lovable preview", () => {
    expect(isImageEnginePreviewHost("id-preview--9053a68c-53d9-4eb5-a587-cb75342eb89c.lovable.app")).toBe(true);
  });
  it("is off for nixorastudios.com", () => {
    expect(isImageEnginePreviewHost("nixorastudios.com")).toBe(false);
    expect(isImageEnginePreviewHost("www.nixorastudios.com")).toBe(false);
  });
  it("is off for the published lovable.app site", () => {
    expect(isImageEnginePreviewHost("nixorastudios.lovable.app")).toBe(false);
  });
});
