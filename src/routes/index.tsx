import { createFileRoute, Link } from "@tanstack/react-router";
import { HelpCenter } from "@/components/HelpCenter";
import { TOOLS } from "@/lib/tools";

const title = "NIXORA STUDIOS — 10 AI Generative Engines";
const description =
  "NIXORA STUDIOS: 10 AI generative engines — text to image, text to video, images to video, animation, sound effects, voice over, music studio, lipsync, video editor and code engine.";

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
    <div className="relative min-h-screen overflow-hidden bg-[#0a0f0a] font-mono text-[#00ff88]">
      {/* animated gradient + particles */}
      <div className="pointer-events-none absolute inset-0 animate-[nixora-bg_12s_ease-in-out_infinite_alternate] bg-[linear-gradient(160deg,#0a0f0a,#001100,#0a0f0a)]" />
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-[#00ff88] opacity-40 animate-[nixora-drift_10s_linear_infinite]"
            style={{
              left: `${(i * 41) % 100}%`,
              top: `${(i * 29) % 100}%`,
              animationDelay: `${(i % 10) * -1}s`,
              animationDuration: `${8 + (i % 6)}s`,
            }}
          />
        ))}
      </div>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-center text-2xl font-bold tracking-widest animate-[nixora-pulse_2s_ease-in-out_infinite] [text-shadow:0_0_20px_#00ff88] md:text-4xl">
          NIXORA STUDIOS — 10 AI GENERATIVE ENGINES
        </h1>
        <p className="mt-3 text-center text-sm text-[#00ff88]/70">
          Click any engine to open its prompt dashboard.
        </p>

        {/* 4 / 4 / 2 centered layout */}
        <div className="mt-10 flex flex-wrap justify-center gap-5">
          {TOOLS.map((tool, i) => (
            <Link
              key={tool.slug}
              to="/tools/$tool"
              params={{ tool: tool.slug }}
              data-tool={tool.slug}
              className="group w-full rounded-xl border border-[#00ff88] bg-[#00ff88]/5 p-5 backdrop-blur transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_#00ff88] sm:w-[calc(50%-1.25rem)] lg:w-[calc(25%-1.25rem)]"
            >
              <div className="animate-[nixora-float_6s_ease-in-out_infinite] group-hover:[animation-play-state:paused]" style={{ animationDelay: `${(i % 4) * 0.6}s` }}>
                <div className="text-xs text-[#00ff88]/60">ENGINE {String(i + 1).padStart(2, "0")}</div>
                <div className="mt-2 text-3xl">{tool.icon}</div>
                <h2 className="mt-2 text-lg font-bold [text-shadow:0_0_10px_#00ff88]">{tool.name}</h2>
                <p className="mt-1 min-h-10 text-xs text-[#00ff88]/70">{tool.description}</p>
                <span className="mt-4 block w-full rounded-md bg-[#00ff88] py-2 text-center font-bold text-black transition-all group-hover:bg-white group-hover:shadow-[0_0_20px_#00ff88] animate-[nixora-pulse_2s_ease-in-out_infinite]">
                  START
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <HelpCenter />
    </div>
  );
}
