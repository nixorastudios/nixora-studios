import { createFileRoute, notFound } from "@tanstack/react-router";
import { ToolDashboard } from "@/components/ToolDashboard";
import { getTool } from "@/lib/tools";

export const Route = createFileRoute("/tools/$tool")({
  loader: ({ params }) => {
    const tool = params.tool ? getTool(params.tool) : undefined;
    if (!tool) throw notFound();
    return { tool };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Tool not found — NIXORA STUDIOS" }, { name: "robots", content: "noindex" }] };
    const title = `${loaderData.tool.name} — NIXORA STUDIOS`;
    const d = loaderData.tool.description;
    return {
      meta: [
        { title },
        { name: "description", content: d },
        { property: "og:title", content: title },
        { property: "og:description", content: d },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  staticData: { sitemap: false },
  component: ToolPage,
});

function ToolPage() {
  const { tool } = Route.useLoaderData();
  return <ToolDashboard tool={tool} />;
}
