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

  it("shows USD under NGN on each Early Access card", async () => {
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
      context: { queryClient: new QueryClient() },
    });

    await router.load();

    render(<RouterProvider router={router} />);

    expect(await screen.findByText("Early value ₦5,000")).toBeInTheDocument();
    expect(screen.getByText("$5 USD")).toBeInTheDocument();
    expect(screen.getByText("Early value ₦20,000")).toBeInTheDocument();
    expect(screen.getByText("$20 USD")).toBeInTheDocument();
    expect(screen.getByText("Early value ₦60,000")).toBeInTheDocument();
    expect(screen.getByText("$60 USD")).toBeInTheDocument();
    expect(screen.getByText(/Paystack \(NGN\) \+ Stripe \(USD\) at launch Nov 23/)).toBeInTheDocument();
  });
});
