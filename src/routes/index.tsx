import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ExtensionDashboard } from "@/components/ExtensionDashboard";

const title = "NIXORA STUDIOS — AI Generative Engines";
const description = "NIXORA STUDIOS: 10 AI tools with a full extension dashboard for prompts, images, spreadsheets and video.";

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

const tools = [
  "LIPSYNC", "SOUND EFFECTS", "MUSIC STUDIO", "VIDEO EDITOR", "CODE ENGINE",
  "VOICE CLONE", "IMAGE GENERATOR", "AFRO BEAT STUDIO", "NIXORA KIDS", "LIVING ALTAR",
];

function Index() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);

  if (showDashboard && activeTool) {
    return <ExtensionDashboard tool={activeTool} onClose={() => setShowDashboard(false)} />;
  }

  return (
    <div style={{ background: "#0a0f0a", color: "#00ff88", minHeight: "100vh", padding: 20, fontFamily: "monospace" }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>AI GENERATIVE ENGINES - 10 TOOLS - NIXORA STUDIOS</h1>
      <p>GOD MODE ACTIVE</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 15, marginTop: 30 }}>
        {tools.map((t) => (
          <div key={t} style={{ border: "1px solid #00ff88", padding: 20, textAlign: "center", borderRadius: 10 }}>
            <h3 style={{ fontWeight: "bold" }}>{t}</h3>
            <button
              onClick={() => { setActiveTool(t); setShowDashboard(true); window.scrollTo(0, 0); }}
              style={{ background: "#00ff88", color: "#000", padding: "10px 30px", border: "none", borderRadius: 5, cursor: "pointer", marginTop: 10, fontWeight: "bold" }}
            >
              START
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
