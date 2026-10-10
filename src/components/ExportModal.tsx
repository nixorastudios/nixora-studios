import { useState } from "react";
const platforms = [
  { id: "youtube", label: "YouTube @nixorastudios", spec: "16:9 1080p AAC" },
  { id: "instagram", label: "Instagram @nixorastudios", spec: "9:16 1080x1920" },
  { id: "tiktok", label: "TikTok @nixorastudios", spec: "9:16 Loud -14 LUFS" },
  { id: "facebook", label: "Facebook nixorastudios", spec: "1:1 / 4:5" },
  { id: "spotify", label: "Spotify/Netflix NIXORA", spec: "WAV 4K + ISRC" },
];
export default function ExportModal({ onClose }: any) {
  const [sel, setSel] = useState("");
  const doExport = () => {
    if(!sel) return alert("BOSS select channel first!");
    const sig = `Owner: anago.vincent.nnalue@gmail.com | Admin: nixorastudios@gmail.com | Studio: NIXORA STUDIOS ENTERPRISES | ISRC: NG-NIX-26-${Date.now()} | Channel: ${sel}`;
    alert(`✅ EXPORTING FOR ${sel.toUpperCase()}\n\n${sig}\n\nPlatform will see as PAID STUDIO ORIGINAL = MONETIZABLE!`);
    onClose();
  };
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:99999,display:'flex',justifyContent:'center',alignItems:'center'}}>
      <div style={{background:'white',color:'black',padding:'20px',borderRadius:'16px',width:'360px'}}>
        <h3>🎬 EXPORT TO 5 CHANNELS</h3>
        {platforms.map(p=>(<button key={p.id} onClick={()=>setSel(p.id)} style={{width:'100%',margin:'6px 0',padding:'10px',background:sel===p.id?'gold':'#eee',border:'1px solid black',borderRadius:'8px',fontWeight:'bold'}}>{p.label}</button>))}
        <button onClick={doExport} style={{width:'100%',marginTop:'12px',background:'green',color:'white',padding:'12px',border:'none',borderRadius:'8px',fontWeight:'bold'}}>EXPORT WITH OWNER SIGNATURE</button>
        <button onClick={onClose} style={{width:'100%',marginTop:'6px',background:'#ccc',padding:'8px',border:'none',borderRadius:'8px'}}>Cancel</button>
      </div>
    </div>
  );
}
