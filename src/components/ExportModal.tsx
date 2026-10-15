import { useState } from "react";

const platforms = [
  { id: "youtube", label: "YouTube", spec: "16:9 1920x1080 AAC 48kHz H.264", frame: "16:9" },
  { id: "instagram", label: "Instagram", spec: "9:16 1080x1920 / 4:5 1080x1350 / 1:1 1080x1080", frame: "9:16" },
  { id: "tiktok", label: "TikTok", spec: "9:16 1080x1920 60fps AAC", frame: "9:16" },
  { id: "facebook", label: "Facebook", spec: "1:1 1080x1080 / 4:5 1080x1350", frame: "1:1" },
  { id: "netflix", label: "Netflix", spec: "16:9 3840x2160 4K 24fps 5.1", frame: "16:9" },
  { id: "prime", label: "Prime Video", spec: "16:9 3840x2160 4K HDR", frame: "16:9" },
  { id: "spotify", label: "Spotify", spec: "WAV 44.1kHz 24bit Cover 3000x3000", frame: "audio" },
];

export default function ExportModal({ onClose, onExport, isOwner = true }: any) {
  const [selected, setSelected] = useState(platforms[0]!.id);

  const handleExport = () => {
    const platform = platforms.find(p => p.id === selected);
    const exportData = {
      platform: selected,
      spec: platform?.spec,
      frame: platform?.frame,
      owner: isOwner,
      signature: isOwner? "NIXORA_PAID_SIGNATURE_v1" : null,
      json: isOwner? {
        handle: "nixorastudios",
        monetization: "paid",
        invisible_watermark: true,
        channel_verified: true,
        contact: "nixorastudios.com"
      } : null,
      timestamp: Date.now()
    };
    onExport(exportData);
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#111", padding: 24, borderRadius: 12, width: "92%", maxWidth: 440, border: "1px solid #222" }}>
        <h3 style={{ color: "#fff", marginBottom: 4 }}>EXPORT TO PLATFORM</h3>
        <p style={{ color: "#00ff88", fontSize: 11, marginBottom: 16 }}>{isOwner? "Owner Mode: Signature + JSON will be embedded (invisible) - Media sees Paid Content" : "Standard Export"}</p>
        {platforms.map((p) => (
          <div key={p.id} onClick={() => setSelected(p.id)} style={{ padding: 10, marginBottom: 8, border: selected === p.id? "2px solid #00ff88" : "1px solid #333", borderRadius: 8, cursor: "pointer" }}>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>{p.label}</div>
            <div style={{ color: "#888", fontSize: 10 }}>{p.spec}</div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, background: "#222", color: "#fff", borderRadius: 8 }}>Cancel</button>
          <button onClick={handleExport} style={{ flex: 1, padding: 12, background: "#00ff88", color: "#000", fontWeight: 800, borderRadius: 8 }}>Export to {selected}</button>
        </div>
      </div>
    </div>
  );
}
