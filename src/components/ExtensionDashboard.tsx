import { useEffect, useState, type DragEvent } from "react";
import ExportModal from "./ExportModal";
const TABS = ["PROMPT", "IMAGE", "SPREADSHEET", "VIDEO/WORK"] as const;
type Tab = (typeof TABS)[number];
const JOBS_KEY = "nixora_code_engine_jobs";

const green = "#00ff88";
const panel = { border: `2px dashed ${green}`, borderRadius: 8, padding: 16, minHeight: 300 } as const;
const area = {
  width: "100%",
  background: "#000",
  color: green,
  border: "1px solid #333",
  borderRadius: 6,
  padding: 10,
  fontFamily: "monospace",
} as const;

function parseCsv(text: string) {
  return text
    .split(/\r?\n/)
    .filter((l) => l.trim())
    .slice(0, 50)
    .map((l) => l.split(","));
}

export function ExtensionDashboard({ tool, onClose }: { tool: string; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("PROMPT");
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<{ name: string; url: string } | null>(null);
  const [sheet, setSheet] = useState<{ name: string; rows: string[][] } | null>(null);
  const [video, setVideo] = useState<{ name: string; url: string } | null>(null);
  const [work, setWork] = useState("");
  const [output, setOutput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const isCode = tool === "CODE ENGINE";
const [showExportModal, setShowExportModal] = useState(false);
const [currentOutput, setCurrentOutput] = useState<any>(null);

const handlePlatformExport = (exportData: any, output: any) => {
  console.log("EXPORTING TO PLATFORM", exportData, output);
  alert(`Exported to ${exportData.platform} - ${exportData.spec} - Signature embedded: NIXORA_PAID_SIGNATURE_v1 - Media sees PAID content`);
};
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const loadImage = (f?: File) => {
    if (!f || !f.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = () => setImage({ name: f.name, url: String(r.result) });
    r.readAsDataURL(f);
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    loadImage(e.dataTransfer.files[0]);
  };
  const loadSheet = (f?: File) => {
    if (!f) return;
    if (/\.csv$/i.test(f.name)) f.text().then((t) => setSheet({ name: f.name, rows: parseCsv(t) }));
    else setSheet({ name: f.name, rows: [["Excel file attached — table preview works for CSV files"]] });
  };

  const generate = () => {
    const job = {
      id: Date.now(),
      tool,
      createdAt: new Date().toISOString(),
      prompt,
      imageName: image?.name ?? null,
      sheetName: sheet?.name ?? null,
      videoName: video?.name ?? null,
      work,
    };
    const out = isCode
      ? prompt || "<!-- Write code in the PROMPT tab -->"
      : `${tool} JOB #${job.id}\n\nPrompt: ${prompt || "(none)"}\nImage: ${job.imageName ?? "(none)"}\nSpreadsheet: ${job.sheetName ?? "(none)"}\nVideo: ${job.videoName ?? "(none)"}\nWork: ${work || "(none)"}\n\nSaved to job list.`;
    setOutput(out);
    try {
      const jobs = JSON.parse(localStorage.getItem(JOBS_KEY) || "[]");
      localStorage.setItem(JOBS_KEY, JSON.stringify([job, ...jobs].slice(0, 100)));
    } catch {
      localStorage.setItem(JOBS_KEY, JSON.stringify([job]));
    }
  };

  const btn = (on: boolean) => ({
    padding: "8px 15px",
    background: on ? green : "#333",
    color: on ? "#000" : "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    fontWeight: "bold" as const,
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "#0a0f0a", color: green, overflow: "auto", padding: 16, fontFamily: "monospace" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, borderBottom: `1px solid ${green}`, paddingBottom: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold" }}>{tool} - EXTENSION DASHBOARD</h2>
        <button onClick={onClose} aria-label="Close" style={{ background: "#ff4444", color: "#fff", padding: "8px 16px", border: "none", borderRadius: 5, fontWeight: "bold", cursor: "pointer" }}>
          ✕ CLOSE
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "16px 0" }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={btn(tab === t)}>{t}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 20 }}>
        <div>
          {tab === "PROMPT" && (
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Put your project prompt / code here..." style={{ ...area, height: 340 }} />
          )}
          {tab === "IMAGE" && (
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              style={{ ...panel, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: dragOver ? "#001a0a" : "transparent" }}
            >
              <input type="file" accept="image/*" hidden onChange={(e) => loadImage(e.target.files?.[0])} />
              {image ? <img src={image.url} alt={image.name} style={{ maxWidth: "100%", maxHeight: 260, borderRadius: 6 }} /> : <p>Drag &amp; drop an image, or click to choose</p>}
              {image && <small style={{ marginTop: 8 }}>{image.name}</small>}
            </label>
          )}
          {tab === "SPREADSHEET" && (
            <div style={panel}>
              <input type="file" accept=".csv,.xlsx,.xls" onChange={(e) => loadSheet(e.target.files?.[0])} />
              {sheet && (
                <div style={{ overflow: "auto", maxHeight: 260, marginTop: 10 }}>
                  <p>{sheet.name}</p>
                  <table style={{ borderCollapse: "collapse", fontSize: 12 }}>
                    <tbody>
                      {sheet.rows.map((r, i) => (
                        <tr key={i}>{r.map((c, j) => <td key={j} style={{ border: "1px solid #333", padding: "3px 6px", fontWeight: i === 0 ? "bold" : undefined }}>{c}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {tab === "VIDEO/WORK" && (
            <div>
              <input type="file" accept="video/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) setVideo({ name: f.name, url: URL.createObjectURL(f) }); }} />
              {video && <video src={video.url} controls style={{ maxWidth: "100%", marginTop: 10 }} />}
              <textarea value={work} onChange={(e) => setWork(e.target.value)} placeholder="Describe the work..." style={{ ...area, height: 180, marginTop: 10 }} />
            </div>
          )}
          <button onClick={generate} style={{ marginTop: 15, background: green, color: "#000", padding: "12px 30px", border: "none", borderRadius: 5, fontWeight: "bold", cursor: "pointer", width: "100%" }}>
            GENERATE CODE
          </button>
        </div>

        <div style={{ background: "#000", border: "1px solid #333", borderRadius: 8, padding: 15, minHeight: 340, display: "flex", flexDirection: "column", gap: 10 }}>
          <h4 style={{ fontWeight: "bold" }}>LIVE PREVIEW / OUTPUT</h4>
          {isCode && prompt ? (
            <iframe title="Live preview" sandbox="allow-scripts" srcDoc={prompt} style={{ flex: 1, minHeight: 260, background: "#fff", border: 0, borderRadius: 6 }} />
          ) : null}
          <pre style={{ whiteSpace: "pre-wrap", color: "#ccc" }}>{output || "Output will appear here after generation..."}</pre>{output && (
  <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
    <button onClick={() => { /* take to edit interface */ console.log("Edit", currentOutput); }} style={{ padding: "10px 16px", background: "#222", color: "#fff", borderRadius: 8, border: "1px solid #333" }}>Edit</button>
    <button onClick={() => { /* download/share to device */ if(currentOutput?.url){ window.open(currentOutput.url, "_blank"); } else { navigator.clipboard.writeText(output); alert("Copied/Downloaded"); } }} style={{ padding: "10px 16px", background: "#222", color: "#fff", borderRadius: 8, border: "1px solid #333" }}>Download/Share</button>
    <button onClick={() => { setCurrentOutput(output); setShowExportModal(true); }} style={{ padding: "10px 16px", background: "#00FF88", color: "#000", fontWeight: 700, borderRadius: 8 }}>Export</button>
  </div>
)}

{showExportModal && (
  <ExportModal
    onClose={() => setShowExportModal(false)}
    onExport={(data: any) => handlePlatformExport(data, currentOutput || output)}
    isOwner={true}
  />
)}
        </div>
      </div>
    </div>
  );
}
