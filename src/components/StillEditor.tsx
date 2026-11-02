import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Download, ImagePlus, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const HANDOFF_KEY = "nixora_handoff_image";
const MOTIONS = ["Slow zoom in", "Slow zoom out", "Pan left", "Pan right", "Still"] as const;
const FILTERS = { None: "none", Warm: "sepia(0.35) saturate(1.3)", "Black & white": "grayscale(1) contrast(1.1)", Cinematic: "contrast(1.15) saturate(0.85) brightness(0.95)", Vivid: "saturate(1.6) contrast(1.05)" } as const;
const SIZES = { "16:9": [1280, 720], "9:16": [720, 1280], "1:1": [1080, 1080] } as const;
const field = "mt-1 w-full rounded-md border border-border bg-background p-2 text-sm text-foreground outline-none focus:border-primary";

// Browser-only clip editor: turns a still into a short moving clip with motion, grade, titles and fades.
export function StillEditor() {
  const [src, setSrc] = useState<string | null>(null);
  const [motion, setMotion] = useState<(typeof MOTIONS)[number]>("Slow zoom in");
  const [filter, setFilter] = useState<keyof typeof FILTERS>("Cinematic");
  const [size, setSize] = useState<keyof typeof SIZES>("16:9");
  const [seconds, setSeconds] = useState(6);
  const [title, setTitle] = useState("");
  const [fade, setFade] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const canvas = useRef<HTMLCanvasElement>(null);
  const img = useRef<HTMLImageElement | null>(null);
  const raf = useRef(0);

  useEffect(() => {
    try { const h = sessionStorage.getItem(HANDOFF_KEY); if (h) { sessionStorage.removeItem(HANDOFF_KEY); setSrc(h); setNotice("Your image from Text to Image is on the timeline."); } } catch { /* none */ }
    return () => cancelAnimationFrame(raf.current);
  }, []);
  useEffect(() => { if (!src) return; const i = new Image(); i.onload = () => { img.current = i; draw(0); }; i.src = src; }, [src]);
  useEffect(() => { draw(0); }, [motion, filter, size, title, fade]);

  function draw(t: number) {
    const c = canvas.current, i = img.current; if (!c || !i) return;
    const [w, h] = SIZES[size]; c.width = w; c.height = h;
    const ctx = c.getContext("2d")!; const p = Math.min(1, Math.max(0, t));
    const zoom = motion === "Slow zoom in" ? 1 + 0.15 * p : motion === "Slow zoom out" ? 1.15 - 0.15 * p : motion === "Still" ? 1 : 1.15;
    const cover = Math.max(w / i.naturalWidth, h / i.naturalHeight) * zoom;
    const dw = i.naturalWidth * cover, dh = i.naturalHeight * cover;
    const pan = motion === "Pan left" ? (0.5 - p) : motion === "Pan right" ? (p - 0.5) : 0;
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, w, h);
    ctx.filter = FILTERS[filter];
    ctx.drawImage(i, (w - dw) / 2 + pan * (dw - w), (h - dh) / 2, dw, dh);
    ctx.filter = "none";
    if (title) { ctx.font = `bold ${Math.round(w / 18)}px system-ui, sans-serif`; ctx.textAlign = "center"; ctx.fillStyle = "rgba(255,255,255,0.95)"; ctx.shadowColor = "rgba(0,0,0,0.7)"; ctx.shadowBlur = 16; ctx.fillText(title, w / 2, h * 0.88); ctx.shadowBlur = 0; }
    if (fade) { const a = Math.max(0, 1 - p / 0.12, 1 - (1 - p) / 0.12); if (a > 0) { ctx.fillStyle = `rgba(0,0,0,${a})`; ctx.fillRect(0, 0, w, h); } }
  }
  function play(record?: (stop: () => void) => void) {
    cancelAnimationFrame(raf.current); const start = performance.now();
    const tick = (now: number) => { const t = (now - start) / (seconds * 1000); draw(t); if (t < 1) raf.current = requestAnimationFrame(tick); else record?.(() => {}); };
    raf.current = requestAnimationFrame(tick);
  }
  async function exportClip() {
    const c = canvas.current; if (!c || !img.current) return;
    if (typeof MediaRecorder === "undefined") { setNotice("This browser can't record video. Try Chrome or Edge."); return; }
    setBusy(true); setNotice("Rendering your clip…");
    const type = ["video/webm;codecs=vp9", "video/webm", "video/mp4"].find((m) => MediaRecorder.isTypeSupported(m)) || "";
    const rec = new MediaRecorder(c.captureStream(30), type ? { mimeType: type, videoBitsPerSecond: 8_000_000 } : undefined);
    const chunks: Blob[] = []; rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => { const blob = new Blob(chunks, { type: rec.mimeType }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `nixora-edit.${rec.mimeType.includes("mp4") ? "mp4" : "webm"}`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); setBusy(false); setNotice("Clip downloaded."); };
    rec.start(); play(() => setTimeout(() => rec.stop(), 100));
  }
  const pick = (f?: File) => { if (f?.type.startsWith("image/")) { const r = new FileReader(); r.onload = () => setSrc(String(r.result)); r.readAsDataURL(f); } };

  return <div className="video-studio min-h-screen bg-background text-foreground">
    <header className="flex items-center gap-3 border-b border-border px-4 py-3 lg:px-8"><Button asChild variant="ghost" size="icon" title="Back to home"><Link to="/"><ArrowLeft /></Link></Button><Link to="/" className="text-lg font-extrabold">NIXORA<span className="text-primary">.</span></Link><span className="hidden border-l border-border pl-3 text-xs text-muted-foreground sm:block">ENGINE 09 · VIDEO EDITOR</span></header>
    <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-8">
      <section className="space-y-4" aria-label="Edit settings">
        <h1 className="text-2xl font-bold">Video editor<span className="text-primary">.</span></h1>
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground hover:border-primary"><ImagePlus className="size-5 text-primary" />{src ? "Replace image" : "Choose an image"}<input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => pick(e.target.files?.[0])} /></label>
        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
          <label>Motion<select className={field} value={motion} onChange={(e) => setMotion(e.target.value as typeof motion)}>{MOTIONS.map((m) => <option key={m}>{m}</option>)}</select></label>
          <label>Colour grade<select className={field} value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>{Object.keys(FILTERS).map((f) => <option key={f}>{f}</option>)}</select></label>
          <label>Shape<select className={field} value={size} onChange={(e) => setSize(e.target.value as typeof size)}>{Object.keys(SIZES).map((s) => <option key={s}>{s}</option>)}</select></label>
          <label>Length (s)<input type="number" min={2} max={20} className={field} value={seconds} onChange={(e) => setSeconds(Math.min(20, Math.max(2, Number(e.target.value) || 6)))} /></label>
        </div>
        <label className="block text-xs text-muted-foreground">Title text<input className={field} maxLength={60} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional caption" /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={fade} onChange={(e) => setFade(e.target.checked)} />Fade in and out</label>
        <div className="flex gap-2"><Button variant="outline" disabled={!src || busy} onClick={() => play()}><Play />Preview</Button><Button disabled={!src || busy} onClick={exportClip}>{busy ? <Loader2 className="animate-spin" /> : <Download />}Export clip</Button></div>
        {notice && <p role="status" className="rounded-md border border-border bg-card p-3 text-sm">{notice}</p>}
        <p className="text-[11px] text-muted-foreground">Edits run on your device; nothing is uploaded.</p>
      </section>
      <section className="flex min-h-[360px] items-center justify-center rounded-lg border border-border bg-card p-3" aria-label="Preview">
        {src ? <canvas ref={canvas} className="max-h-[70vh] max-w-full rounded" /> : <p className="text-sm text-muted-foreground">Send an image from Text to Image, or choose one to start editing.</p>}
      </section>
    </div>
  </div>;
}
