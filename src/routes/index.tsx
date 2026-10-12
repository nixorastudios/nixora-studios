import { createFileRoute } from "@tanstack/react-router";
import { HelpCenter } from "@/components/HelpCenter";

const title = "NIXORA STUDIOS — 5 Channels";
const description =
  "NIXORA STUDIOS: NIXORA KIDS, LIVING ALTAR, AFRO TALES, VIBRA XONA and NIXOXTAR.";

export const Route = createFileRoute("/")({
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
  component: Index,
});

function Index() {
  return (
    <>
      <iframe
        src="/nixora.html"
        title="NIXORA STUDIOS"
        className="fixed inset-0 h-full w-full border-0"
      />
      <HelpCenter />
    </>
  );
}
