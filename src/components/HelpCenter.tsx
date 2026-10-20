import { useEffect, useState } from "react";

const FAQS: { q: string; a: string }[] = [
  {
    q: "How do I use the 10 AI engine tools?",
    a: "Scroll to the AI GENERATIVE ENGINES section and click START on any card — Text to Image, Images to Video, Text to Video, Animation, Voice Over, Lipsync, Sound Effects, Music Studio, Video Editor or Code Engine. The Lipsync card opens the avatar panel where you upload audio and the mouth animates to it.",
  },
  {
    q: "How do I open one of the 5 channels?",
    a: "Go to the 5 CHANNELS - OPEN section at the bottom and press OPEN on NIXORA KIDS, LIVING ALTAR, AFRO TALES, VIBRA XONA or NIXOXTAR. The dashboard switches to that channel and locks its 70-100 styles.",
  },
  {
    q: "How does Animation differ from Lipsync?",
    a: "Animation drives facial realism — blinking eyes, mouth shapes and head movement. Lipsync syncs the avatar mouth to your Voice Over audio using real-time audio analysis, with closed, half-open and wide-open mouth shapes.",
  },
  {
    q: "How do I lock a character's face?",
    a: "In CHARACTER LOCK MODE choose OPTION1 SINGLE for one face kept 98% the same, or OPTION2 TEAM 8+ to lock a full cast. Upload the reference photo, name it, and lock it.",
  },
  {
    q: "How does billing work?",
    a: "Use the BILLING card at the bottom. Tick the consent box and subscribe to PRO $9/mo for all 5 channels. ULTRA $19/mo is unlimited, and God Mode is reserved for the owner account.",
  },
  {
    q: "The scroll or layout looks off — what do I do?",
    a: "Use the 🛠️ Fix My Account button in the BILLING card to reset stored settings, then reload. Your sign-in details stay on your device.",
  },
];

export function HelpCenter() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open Help Center"
        style={{
          position: "fixed",
          bottom: "18px",
          right: "18px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "#FF6B00",
          color: "#fff",
          border: "2px solid #151515",
          fontSize: "26px",
          cursor: "pointer",
          zIndex: 9999,
          boxShadow: "0 4px 14px rgba(0,0,0,.6)",
        }}
      >
        ❓
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Help Center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.8)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#0a0a0a",
              border: "2px solid #333",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "560px",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: "16px",
              color: "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
              }}
            >
              <h2 style={{ color: "#ff6a00", margin: 0, fontSize: "16px" }}>
                📚 HELP CENTER - FAQ
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close Help Center"
                style={{
                  background: "#151515",
                  color: "#fff",
                  border: "1px solid #333",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginTop: "12px", display: "grid", gap: "8px" }}>
              {FAQS.map((f) => (
                <div
                  key={f.q}
                  style={{
                    background: "#151515",
                    border: "1px solid #333",
                    borderLeft: "3px solid #00ff88",
                    borderRadius: "8px",
                    padding: "10px",
                  }}
                >
                  <b style={{ color: "#00ff88", fontSize: "12px" }}>{f.q}</b>
                  <p
                    style={{
                      margin: "6px 0 0",
                      fontSize: "11px",
                      color: "#ccc",
                      lineHeight: 1.5,
                    }}
                  >
                    {f.a}
                  </p>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "14px",
                background: "#000",
                border: "2px solid #ff6a00",
                borderRadius: "8px",
                padding: "10px",
              }}
            >
              <b style={{ color: "#ff6a00", fontSize: "12px" }}>📮 CONTACT US</b>
              <p style={{ margin: "6px 0", fontSize: "12px" }}>
                📧{" "}
                <a
                  href="mailto:support@nixorastudios.com"
                  style={{ color: "#00ff88", fontWeight: "bold" }}
                >
                  support@nixorastudios.com
                </a>
              </p>
              <p style={{ margin: "6px 0", fontSize: "12px" }}>
                🌐{" "}
                <a
                  href="https://nixorastudios.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#ff6a00", fontWeight: "bold" }}
                >
                  nixorastudios.com
                </a>
              </p>
              <p style={{ margin: "6px 0", fontSize: "12px" }}>
                Privacy: nixorastudios.com/privacy
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HelpCenter;
