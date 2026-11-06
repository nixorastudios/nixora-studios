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

  it("lists all ten engines in the footer Product column", async () => {
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
      context: { queryClient: new QueryClient() },
    });

    await router.load();

    render(<RouterProvider router={router} />);

    const nav = await screen.findByRole("navigation", { name: "Product" });
    for (const engine of [
      "Text to Image",
      "Text to Video",
      "Image to Video",
      "Animation",
      "Sound Effects",
      "Voice Over",
      "Music Studio",
      "Lipsync",
      "Video Editor",
      "Code Engine",
    ]) {
      expect(within(nav).getByRole("link", { name: engine })).toBeInTheDocument();
    }
  });

  it("shows Option A prices and no old bundles", async () => {
    const router = createRouter({ routeTree, history: createMemoryHistory({ initialEntries: ["/"] }), context: { queryClient: new QueryClient() } });
    await router.load();
    render(<RouterProvider router={router} />);
    expect(await screen.findByText("₦30,000 / month")).toBeInTheDocument();
    expect(screen.getByText("₦60,000 / month")).toBeInTheDocument();
    expect(screen.getByText("₦120,000 / month")).toBeInTheDocument();
    expect(screen.getByText("₦7,500 one-time")).toBeInTheDocument();
    expect(screen.getByText("₦35,000 one-time")).toBeInTheDocument();
    expect(screen.queryByText("Early value ₦5,000")).not.toBeInTheDocument();
    expect(screen.queryByText(/Stripe/)).not.toBeInTheDocument();
  });
});
