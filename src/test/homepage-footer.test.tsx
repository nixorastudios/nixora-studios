import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

describe("Homepage footer", () => {
  it("offers Terms, Privacy, Refund, Security and Contact links from the footer", async () => {
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
      context: { queryClient: new QueryClient() },
    });

    await router.load();

    render(<RouterProvider router={router} />);

    const nav = await screen.findByRole("navigation", { name: "Legal pages" });
    expect(within(nav).getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms");
    expect(within(nav).getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
    expect(within(nav).getByRole("link", { name: "Refund" })).toHaveAttribute("href", "/refund");
    expect(within(nav).getByRole("link", { name: "Security" })).toHaveAttribute("href", "/security");
    expect(within(nav).getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
  });
});
