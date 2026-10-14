// NIXORA GOD MODE SWITCH - CHANGE 1 LINE TO SWITCH ENGINE ANYTIME
// This file controls all 10 modules

const NIXORA_ENGINES = {
  // OPTION A: FREE FOREVER (Use now)
  "text-to-image": "pollinations", // free, unlimited, no key

  // OPTION B: YOUR OWN SERVER (Switch later) - Just change to "self-host"
  // "text-to-image": "self-host", 

  // OPTION C: USER BRINGS KEY (Switch later)
  // "text-to-image": "byok",

  "photo-to-video": "self-host",
  "text-to-video": "self-host",
  "animation": "browser",
  "voice-over": "self-host", // will use Coqui TTS
  "sound-effects": "self-host",
  "lipsync": "self-host",
  "music-daw": "self-host",
  "video-editor": "browser", // no GPU needed
  "code-engine": "groq-free"
};

// YOUR PRIVATE SERVER LINKS - Fill when you buy RunPod
const MY_SERVERS = {
  selfHostUrl: "https://YOUR-NIXORA-API.runpod.net", // Change this when you get RunPod
  groqKey: "gsk_YOUR_FREE_KEY" // Free from groq.com
};
