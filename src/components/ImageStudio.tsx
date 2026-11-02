import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Clapperboard, Download, FolderOpen, ImagePlus, Layers, Loader2, LogOut, MoreVertical, Pencil, RefreshCw, Search, Share2, Sparkles, Split, Users, Wand2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { streamImage } from "@/lib/stream-image";
import { imagePromptAction } from "@/lib/image-prompt.functions";
import { ASPECTS, DIMENSIONS, FORMATS, MAX_PROMPT, MODE_GROUPS, PLATFORMS, RESOLUTIONS, buildImagePrompt, exportSize, generationSize, type Aspect, type Resolution } from "@/lib/image-studio";

type Ref = { id: string; name: string; file: File; url: string };
type Scene = { title: string; prompt: string };
const field = "w-full rounded-md border border-border bg-background p-2.5 text-sm text-foreground outline-none focus:border-primary";
const ENGINES = [
  { slug: "text-to-video", label: "Image to video" },
  { slug: "animation", label: "Animation" },
  { slug: "lipsync", label: "Lipsync" },
  { slug: "video-editor", label: "Video editor" },
] as const;
export const HANDOFF_KEY = "nixora_handoff_image";

async function dataUrlToBlob(url: string) { return (await fetch(url)).blob(); }
function loadImg(url: string) { return new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; }); }
async function renderTo(url: string, w: number, h: number, mime: string, q = 0.95) {
  const img = await loadImg(url);
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d"); if (!ctx) throw new Error("canvas");
  if (mime === "image/jpeg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h); }
  ctx.imageSmoothingQuality = "high"; ctx.drawImage(img, 0, 0, w, h);
  return new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("too large"))), mime, q));
}

export function ImageStudio() {
  const navigate = useNavigate();
  const promptFn = useServerFn(imagePromptAction);
  const [userId, setUserId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [change, setChange] = useState("");
  const [mode, setMode] = useState("Create image");
  const [menuOpen, setMenuOpen] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState("No platform");
  const [project, setProject] = useState("");
  const [aspect, setAspect] = useState<Aspect>("1:1");
  const [dimension, setDimension] = useState<string>("2D");
  const [resolution, setResolution] = useState<Resolution>("4K");
  const [format, setFormat] = useState<string>("png");
  const [refs, setRefs] = useState<Ref[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [final, setFinal] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [editText, setEditText] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [drop, setDrop] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try { const d = JSON.parse(localStorage.getItem("nixora_image_draft") || "{}"); if (d.prompt) setPrompt(d.prompt); if (d.mode) setMode(d.mode); } catch { /* fresh draft */ }
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id || null));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUserId(s?.user.id || null));
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => { localStorage.setItem("nixora_image_draft", JSON.stringify({ prompt, mode })); }, [prompt, mode]);

  const filtered = useMemo(() => MODE_GROUPS.map((g) => ({ ...g, modes: g.modes.filter((m) => m.toLowerCase().includes(query.toLowerCase())) })).filter((g) => g.modes.length), [query]);
  const pickPlatform = (label: string) => { setPlatform(label); const p = PLATFORMS.find((x) => x.label === label); if (p) setAspect(p.aspect as Aspect); };

  const addRefs = (files: FileList | File[] | null | undefined) => {
    const list = Array.from(files || []).filter((f) => f.type.startsWith("image/"));
    if (!list.length) { setNotice("Drop image files (JPG, PNG or WEBP)."); return; }
    setRefs((old) => [...old, ...list.map((f) => ({ id: crypto.randomUUID(), name: f.name.replace(/\.[^.]+$/, ""), file: f, url: URL.createObjectURL(f) }))].slice(0, 4));
    setNotice(list.length + refs.length > 4 ? "Up to four references are used." : "");
  };
  const onDrop = (e: DragEvent) => { e.preventDefault(); setDrop(false); addRefs(e.dataTransfer.files); };

  const signIn = async (provider: "google" | "lovable") => {
    const r = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/tools/text-to-image` });
    if (r.error) setNotice(r.error.message);
  };
  const token = async () => (await supabase.auth.getSession()).data.session?.access_token;

  const runPrompt = async (task: "create" | "modify" | "scenes") => {
    if (!userId) { setNotice("Sign in to use the AI prompt tools."); return; }
    setBusy(task); setNotice("");
    try {
      const r = await promptFn({ data: { task, text: prompt, change, style: mode } });
      if (!r.ok) { setNotice(r.error); return; }
      if (task === "scenes") { setScenes(r.scenes); setNotice(`${r.scenes.length} scenes ready — generate any one below.`); }
      else { setPrompt(r.prompt); setChange(""); }
    } catch (e) { setNotice(e instanceof Error ? e.message : "The prompt could not be prepared."); }
    finally { setBusy(null); }
  };

  const generate = async (text = prompt, base?: string, instruction?: string) => {
    if (!userId) { setNotice("Sign in to generate images."); return; }
    if (!text.trim()) { setNotice("Enter a prompt first."); return; }
    setBusy("generate"); setNotice(""); setFinal(false);
    const full = buildImagePrompt({ prompt: instruction ? `${instruction}. Original scene: ${text}` : text, mode, dimension, platform: [platform, project].filter(Boolean).join(" · "), hasReference: refs.length > 0 });
    let last = "";
    try {
      const headers = { Authorization: `Bearer ${await token()}` };
      const onFrame = (url: string, done: boolean) => { last = url; setImage(url); setFinal(done); };
      if (base || refs.length) {
        const form = new FormData();
        form.set("prompt", full); form.set("size", generationSize(aspect));
        if (base) form.append("image[]", new File([await dataUrlToBlob(base)], "base.png", { type: "image/png" }));
        refs.slice(0, base ? 3 : 4).forEach((r) => form.append("image[]", r.file));
        await streamImage("/api/edit-image", form, onFrame, undefined, headers);
      } else {
        await streamImage("/api/generate-image", { prompt: full, size: generationSize(aspect) }, onFrame, undefined, headers);
      }
      if (last) setHistory((h) => [last, ...h].slice(0, 12));
      setShowEdit(false); setEditText("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      setNotice(msg.includes("401") ? "Please sign in again." : msg.includes("402") ? "AI credits are unavailable right now." : msg.includes("429") ? "The engine is busy. Try again shortly." : "The image could not be generated. Please try again.");
    } finally { setBusy(null); }
  };

  const download = async () => {
    if (!image) return;
    setBusy("download");
    try {
      const img = await loadImg(image);
      const size = exportSize(resolution, img.naturalWidth, img.naturalHeight);
      const f = FORMATS.find((x) => x.id === format)!;
      const blob = await renderTo(image, size.width, size.height, f.mime);
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `nixora-${mode.toLowerCase().replace(/\W+/g, "-")}-${resolution}.${f.id}`; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } catch { setNotice(`${resolution} is too large for this device's browser. Try a smaller size.`); }
    finally { setBusy(null); }
  };
  const share = async () => {
    if (!image) return;
    try {
      const file = new File([await dataUrlToBlob(image)], "nixora-image.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: "Made with NIXORA STUDIOS" });
      else setNotice("Sharing isn't supported here — download the image, then upload it to your platform.");
    } catch { /* share sheet dismissed */ }
  };
  const pushTo = async (slug: string) => {
    if (!image) return;
    try {
      const img = await loadImg(image);
      const s = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
      const blob = await renderTo(image, Math.round(img.naturalWidth * s), Math.round(img.naturalHeight * s), "image/jpeg", 0.9);
      const url = await new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(blob); });
      sessionStorage.setItem(HANDOFF_KEY, url);
      navigate({ to: "/tools/$tool", params: { tool: slug } });
    } catch { setNotice("The image could not be sent to that engine."); }
  };

  return <div className="min-h-screen bg-background text-foreground" onDragOver={(e) => { if (e.dataTransfer.types.includes("Files")) { e.preventDefault(); setDrop(true); } }} onDragLeave={(e) => { if (e.currentTarget === e.target) setDrop(false); }} onDrop={onDrop}>
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 lg:px-8">
      <div className="flex items-center gap-3"><Button asChild variant="ghost" size="icon" title="Back to home"><Link to="/"><ArrowLeft /></Link></Button><Link to="/" className="text-lg font-extrabold">NIXORA<span className="text-primary">.</span></Link><span className="hidden border-l border-border pl-3 text-xs text-muted-foreground sm:block">ENGINE 01 · TEXT TO IMAGE</span></div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => fileInput.current?.click()}><FolderOpen />Import</Button>
        <Button variant="outline" size="sm" onClick={() => setBrowseOpen(true)}><Layers />Browse tools & models</Button>
        <Button variant="outline" size="sm" onClick={() => fileInput.current?.click()}><Users />Character reference</Button>
        <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={(e) => { addRefs(e.target.files); e.target.value = ""; }} />
        {userId ? <Button variant="ghost" size="icon" title="Sign out" onClick={() => supabase.auth.signOut()}><LogOut /></Button> : <><Button size="sm" onClick={() => signIn("google")}>Sign in with Google</Button><Button size="sm" variant="outline" onClick={() => signIn("lovable")}>Sign in with Lovable</Button></>}
      </div>
    </header>

    {refs.length > 0 && <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 lg:px-8"><span className="text-xs font-semibold text-muted-foreground">CAST / REFERENCES</span>{refs.map((r) => <div key={r.id} className="flex items-center gap-2 rounded-md border border-border bg-card p-1 pr-2"><img src={r.url} alt={r.name} className="size-9 rounded object-cover" /><input value={r.name} onChange={(e) => setRefs((o) => o.map((x) => x.id === r.id ? { ...x, name: e.target.value } : x))} className="w-24 bg-transparent text-xs outline-none" aria-label="Character name" /><button title="Remove" onClick={() => setRefs((o) => o.filter((x) => x.id !== r.id))}><X className="size-3" /></button></div>)}</div>}

    {drop && <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-background/80 text-lg font-semibold text-primary">Drop to add as character reference</div>}

    <div className="mx-auto grid max-w-[1600px] gap-6 px-4 py-6 lg:grid-cols-[56px_minmax(0,420px)_minmax(0,1fr)] lg:px-8">
      <aside className="relative">
        <Button variant="outline" size="icon" title="Image types" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen}><MoreVertical /></Button>
        {menuOpen && <div className="absolute left-0 top-12 z-30 max-h-[70vh] w-72 overflow-auto rounded-lg border border-border bg-popover p-3 shadow-xl">
          <div className="mb-2 flex items-center gap-2 rounded-md border border-border px-2"><Search className="size-4 text-muted-foreground" /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search 120+ image types" className="w-full bg-transparent py-2 text-sm outline-none" /></div>
          {filtered.map((g) => <div key={g.group} className="mb-2"><p className="px-1 py-1 text-[11px] font-semibold text-primary">{g.group.toUpperCase()}</p>{g.modes.map((m) => <button key={m} onClick={() => { setMode(m); setMenuOpen(false); }} className={`block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-accent ${m === mode ? "bg-accent text-primary" : ""}`}>{m}</button>)}</div>)}
        </div>}
      </aside>

      <section className="min-w-0 space-y-4" aria-label="Prompt">
        <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Text to image<span className="text-primary">.</span></h1><span className="rounded-full border border-primary px-3 py-1 text-xs text-primary">{mode}</span></div>
        <div className="rounded-lg border border-border bg-card p-3">
          <label htmlFor="img-prompt" className="text-xs font-semibold text-muted-foreground">PROMPT · IDEA · STORY</label>
          <textarea id="img-prompt" value={prompt} maxLength={MAX_PROMPT} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe your image, or paste a whole story to split into scenes…" className="mt-2 min-h-36 w-full resize-y bg-transparent text-sm leading-6 outline-none" />
          <div className="flex flex-wrap gap-2 border-t border-border pt-2">
            <Button size="sm" variant="ghost" disabled={!!busy} onClick={() => runPrompt("create")}><Sparkles />{busy === "create" ? "Writing…" : "Create prompt"}</Button>
            <Button size="sm" variant="ghost" disabled={!!busy} onClick={() => runPrompt("scenes")}><Split />{busy === "scenes" ? "Splitting…" : "Divide into scenes"}</Button>
          </div>
          <div className="mt-2 flex gap-2"><input value={change} onChange={(e) => setChange(e.target.value)} placeholder="Modify: e.g. make it night, add rain" className={field} /><Button size="sm" variant="outline" disabled={!!busy || !change.trim()} onClick={() => runPrompt("modify")}><Wand2 />Modify</Button></div>
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">TARGET PLATFORM</p>
          <div className="flex flex-wrap gap-2">{PLATFORMS.map((p) => <button key={p.id} onClick={() => pickPlatform(p.label)} className={`rounded-full border px-3 py-1 text-xs transition-colors ${platform === p.label ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}>{p.label}</button>)}</div>
          <input value={project} onChange={(e) => setProject(e.target.value)} placeholder="Project name / version (optional)" className={`${field} mt-3`} maxLength={80} />
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
          <label>Aspect<select className={`${field} mt-1`} value={aspect} onChange={(e) => setAspect(e.target.value as Aspect)}>{ASPECTS.map((a) => <option key={a}>{a}</option>)}</select></label>
          <label>Look<select className={`${field} mt-1`} value={dimension} onChange={(e) => setDimension(e.target.value)}>{DIMENSIONS.map((d) => <option key={d}>{d}</option>)}</select></label>
          <label>Export size<select className={`${field} mt-1`} value={resolution} onChange={(e) => setResolution(e.target.value as Resolution)}>{RESOLUTIONS.map((r) => <option key={r}>{r}</option>)}</select></label>
          <label>File type<select className={`${field} mt-1`} value={format} onChange={(e) => setFormat(e.target.value)}>{FORMATS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}</select></label>
        </div>
        <p className="text-[11px] text-muted-foreground">Images are created in high quality, then enlarged to your export size when you download. 8K and 16K may be too big for some phones.</p>

        <Button className="h-12 w-full text-base" disabled={!!busy} onClick={() => generate()}>{busy === "generate" ? <Loader2 className="animate-spin" /> : <Sparkles />}1 · Generate</Button>
        {notice && <p role="status" className="rounded-md border border-border bg-card p-3 text-sm">{notice}</p>}

        {scenes.length > 0 && <div className="space-y-2"><p className="text-xs font-semibold text-muted-foreground"><Clapperboard className="mr-1 inline size-3" />MOVIE SCENES</p>{scenes.map((s, i) => <div key={i} className="rounded-lg border border-border bg-card p-3"><p className="text-sm font-semibold">{String(i + 1).padStart(2, "0")} · {s.title}</p><p className="mt-1 text-xs text-muted-foreground">{s.prompt}</p><div className="mt-2 flex gap-2"><Button size="sm" disabled={!!busy} onClick={() => generate(s.prompt)}>Generate scene</Button><Button size="sm" variant="ghost" onClick={() => setPrompt(s.prompt)}>Use as prompt</Button></div></div>)}</div>}
      </section>

      <section className="min-w-0 space-y-4" aria-label="Output">
        <div className="flex min-h-[360px] items-center justify-center overflow-hidden rounded-lg border border-border bg-card">
          {image ? <img src={image} alt={prompt.slice(0, 120) || "Generated image"} draggable onDragStart={(e) => { e.dataTransfer.setData("DownloadURL", `image/png:nixora-image.png:${image}`); e.dataTransfer.setData("text/uri-list", image); }} className={`max-h-[70vh] w-auto cursor-grab object-contain transition-[filter] duration-500 ${final ? "blur-0" : "blur-2xl"}`} />
            : <div className="p-8 text-center text-sm text-muted-foreground"><ImagePlus className="mx-auto mb-3 size-8 text-primary" />Your image appears here. Drag reference photos anywhere on the page.</div>}
        </div>

        {image && final && <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setShowEdit((v) => !v)}><Pencil />3 · Edit</Button>
            <Button variant="outline" disabled={!!busy} onClick={() => generate()}><RefreshCw />Variation</Button>
            <Button disabled={!!busy} onClick={download}>{busy === "download" ? <Loader2 className="animate-spin" /> : <Download />}4 · Download {resolution} {format.toUpperCase()}</Button>
            <Button variant="outline" onClick={share}><Share2 />Share</Button>
          </div>
          {showEdit && <div className="flex gap-2"><input value={editText} onChange={(e) => setEditText(e.target.value)} placeholder="e.g. change the jacket to red, add a city skyline" className={field} /><Button disabled={!!busy || !editText.trim()} onClick={() => generate(prompt, image, editText)}>Apply</Button></div>}
          <div className="rounded-lg border border-border bg-card p-3"><p className="mb-2 text-xs font-semibold text-muted-foreground">PUSH TO A NIXORA ENGINE</p><div className="flex flex-wrap gap-2">{ENGINES.map((e) => <Button key={e.slug} size="sm" variant="ghost" onClick={() => pushTo(e.slug)}>{e.label} →</Button>)}</div><p className="mt-2 text-[11px] text-muted-foreground">Tip: drag the image straight out to your desktop or another app.</p></div>
        </div>}

        {history.length > 1 && <div><p className="mb-2 text-xs font-semibold text-muted-foreground">THIS SESSION</p><div className="grid grid-cols-4 gap-2 sm:grid-cols-6">{history.map((h, i) => <button key={i} onClick={() => { setImage(h); setFinal(true); }}><img src={h} alt={`Earlier result ${i + 1}`} className="aspect-square w-full rounded object-cover" /></button>)}</div></div>}
      </section>
    </div>

    {browseOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" onClick={() => setBrowseOpen(false)}>
      <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-xl border border-border bg-popover p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Tools & models</h2><Button variant="ghost" size="icon" onClick={() => setBrowseOpen(false)}><X /></Button></div>
        <p className="mb-4 text-sm text-muted-foreground">Engine model: GPT Image 2.5 (high quality) for generating and editing. Prompt tools use GPT-6 Astra. Pick an image type:</p>
        {MODE_GROUPS.map((g) => <div key={g.group} className="mb-3"><p className="mb-1 text-xs font-semibold text-primary">{g.group}</p><div className="flex flex-wrap gap-1.5">{g.modes.map((m) => <button key={m} onClick={() => { setMode(m); setBrowseOpen(false); }} className={`rounded-full border px-2.5 py-1 text-xs ${m === mode ? "border-primary text-primary" : "border-border hover:border-primary"}`}>{m}</button>)}</div></div>)}
      </div>
    </div>}
  </div>;
}
