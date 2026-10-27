import { createFileRoute } from "@tanstack/react-router";

const title = "NIXORA STUDIOS — Owner Dashboard";
const description =
  "NIXORA STUDIOS owner dashboard: NIXORA KIDS, LIVING ALTAR, AFRO TALES, VIBRA XONA and NIXOXTAR.";

export const Route = createFileRoute("/homepage")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  staticData: { sitemap: false },
  component: Homepage,
});

function Homepage() {
  return (
    <iframe
      src="/nixora.html"
      title="NIXORA STUDIOS — Owner Dashboard"
      className="fixed inset-0 h-full w-full border-0"
    />
  );
}
