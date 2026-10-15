import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { ToolConfig } from "@/lib/tools";

export function ToolDashboard({ tool }: { tool: ToolConfig }) {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [status, setStatus] = useState("Ready");
  const [quality, setQuality] = useState("HD");
  const [ratio, setRatio] = useState("16:9");
  const [duration, setDuration] = useState(5);
  const [channel, setChannel] = useState("NIXORA KIDS");

  const onFile = (f: File | null) => {
    setFile(f);
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl(f ? URL.createObjectURL(f) : null);
  };

  const generate = () => {
    if (!prompt.trim() && !file) {
      setStatus("Add a prompt or upload a file first.");
      return;
    }
    setStatus(`Generating ${tool.name} (${quality}, ${ratio}) for ${channel}… preview below.`);
  };

  const field = "w-full rounded-md border border-[#333] bg-[#0a0a0a] p-2 text-sm text-white";

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="flex items-center justify-between border-b border-[#222] px-4 py-3">
        <Link to="/homepage" className="text-sm font-bold text-[#00ff88]">← NIXORA STUDIOS</Link>
        <a href="https://nixorastudios.com" target="_blank" rel="noreferrer" className="text-xs text-[#FF6B00]">nixorastudios.com</a>
      </header>
      <div className="grid gap-4 p-4 md:grid-cols-[1fr_280px]">
        <main className="space-y-4">
          <h1 className="text-2xl font-bold text-[#FF6B00]">{tool.icon} {tool.name}</h1>
          <p className="text-sm text-[#aaa]">{tool.description}</p>
          <label className="block text-sm font-semibold">Prompt
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5}
              placeholder={`Describe what you want from ${tool.name}…`} className={`${field} mt-1`} />
          </label>
          {tool.input && (
            <label className="block cursor-pointer rounded-lg border-2 border-dashed border-[#FF6B00]/60 p-6 text-center text-sm">
              {file ? `📎 ${file.name}` : `⬆ Upload ${tool.input}`}
              <input type="file" accept={`${tool.input}/*`} className="hidden"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            </label>
          )}
          <button onClick={generate} className="h-12 w-full rounded-md bg-[#FF6B00] font-bold text-white">BUILD</button>
          <p className="text-xs text-[#00ff88]">{status}</p>
          <section className="flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-[#333] bg-black">
            {fileUrl && tool.input === "image" && <img src={fileUrl} alt="Upload preview" className="max-h-full" />}
            {fileUrl && tool.input === "video" && <video src={fileUrl} controls className="max-h-full" />}
            {fileUrl && tool.input === "audio" && <audio src={fileUrl} controls />}
            {!fileUrl && <span className="text-sm text-[#666]">Preview area</span>}
          </section>
        </main>
        <aside className="space-y-3 rounded-lg border border-[#333] bg-[#0a0a0a] p-4 text-sm">
          <h2 className="font-bold text-[#FF6B00]">⚙ Settings</h2>
          <label className="block">Channel
            <select value={channel} onChange={(e) => setChannel(e.target.value)} className={field}>
              {["NIXORA KIDS", "LIVING ALTAR", "AFRO TALES", "VIBRA XONA", "NIXOXTAR"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">Quality
            <select value={quality} onChange={(e) => setQuality(e.target.value)} className={field}>
              {["SD", "HD", "4K"].map((q) => <option key={q}>{q}</option>)}
            </select>
          </label>
          <label className="block">Aspect ratio
            <select value={ratio} onChange={(e) => setRatio(e.target.value)} className={field}>
              {["16:9", "9:16", "1:1"].map((r) => <option key={r}>{r}</option>)}
            </select>
          </label>
          {tool.output === "video" && (
            <label className="block">Duration: {duration}s
              <input type="range" min={2} max={30} value={duration} onChange={(e) => setDuration(+e.target.value)} className="w-full accent-[#FF6B00]" />
            </label>
          )}
        </aside>
      </div>
    </div>
  );
}
