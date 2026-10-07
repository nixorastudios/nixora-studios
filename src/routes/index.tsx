import { createFileRoute } from "@tanstack/react-router";
import { useState, type CSSProperties } from "react";
import { ExtensionDashboard } from "@/components/ExtensionDashboard";

const title = "NIXORA STUDIOS — 10 AI Generative Engines";
const description =
  "NIXORA STUDIOS: ten AI generative engines with a full extension dashboard for prompts, images, spreadsheets and video.";

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

const TOOLS = [
  "TEXT TO IMAGE",
  "TEXT TO VIDEO",
  "IMAGES TO VIDEO",
  "ANIMATION",
  "SOUND EFFECTS",
  "VOICE OVER",
  "MUSIC STUDIO",
  "LIPSYNC",
  "VIDEO EDITOR",
  "CODE ENGINE",
];

// Deterministic pseudo-random so the server render and the browser render
// place the exact same particles (no hydration mismatch).
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PARTICLES = (() => {
  const rand = mulberry32(20260107);
  return Array.from({ length: 34 }, (_, id) => ({
    id,
    left: `${(rand() * 100).toFixed(2)}%`,
    size: `${(1.5 + rand() * 3.5).toFixed(2)}px`,
    duration: `${(14 + rand() * 16).toFixed(1)}s`,
    delay: `${(-rand() * 26).toFixed(1)}s`,
    drift: `${((rand() - 0.5) * 70).toFixed(1)}px`,
    opacity: (0.25 + rand() * 0.5).toFixed(2),
  }));
})();

function Index() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);

  if (showDashboard && activeTool) {
    return <ExtensionDashboard tool={activeTool} onClose={() => setShowDashboard(false)} />;
  }

  return (
    <div className="nixora-stage">
      <div className="nixora-gridlines" aria-hidden />

      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        {PARTICLES.map((p) => (
          <span
            key={p.id}
            className="nixora-particle"
            style={
              {
                "--p-left": p.left,
                "--p-size": p.size,
                "--p-duration": p.duration,
                "--p-delay": p.delay,
                "--p-drift": p.drift,
                "--p-opacity": p.opacity,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-5 py-12 sm:py-20">
        <header className="flex flex-col items-center gap-6 text-center">
          <span className="nixora-badge">
            <span className="nixora-dot" aria-hidden />
            God mode active
          </span>

          <h1 className="nixora-title">
            NIXORA Studios
            <span>10 AI Generative Engines</span>
          </h1>

          <p className="max-w-xl text-xs leading-relaxed tracking-[0.18em] uppercase opacity-70 sm:text-sm">
            Choose an engine and press START to open its extension dashboard
          </p>
        </header>

        <section className="mt-14 flex flex-wrap justify-center gap-5 sm:mt-20">
          {TOOLS.map((tool, i) => (
            <article
              key={tool}
              data-tool={tool}
              className="nixora-card w-full sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]"
              style={{ "--nixora-float-delay": `${(i % 4) * 0.7}s` } as CSSProperties}
            >
              <span className="text-[11px] tracking-[0.3em] opacity-70">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="text-base font-bold tracking-[0.12em] uppercase">{tool}</h2>
              <button
                className="nixora-start"
                onClick={() => {
                  setActiveTool(tool);
                  setShowDashboard(true);
                  window.scrollTo(0, 0);
                }}
              >
                START
              </button>
            </article>
          ))}
        </section>

        <footer className="mt-16 text-center text-[11px] tracking-[0.3em] uppercase opacity-40">
          NIXORA Studios — Engine Bay
        </footer>
      </main>
    </div>
  );
}
