import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

async function openCard(name: RegExp) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/"] }),
    context: { queryClient: new QueryClient() },
  });
  await router.load();
  render(<RouterProvider router={router} />);

  const card = await screen.findByRole("button", { name });
  fireEvent.click(card);
  return screen.findByRole("dialog");
}

describe("AI prompt polish", () => {
  it("offers AI polish for a video engine", async () => {
    await openCard(/TEXT TO VIDEO/i);
    const button = await screen.findByRole("button", { name: /Polish my idea with AI/i });
    expect(button).toBeEnabled();
  });

  it("does not offer AI polish for an audio engine", async () => {
    await openCard(/SOUND EFFECTS/i);
    await waitFor(() => expect(screen.getByText("What do you want to create?")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: /Polish my idea with AI/i })).toBeNull();
  });
});
