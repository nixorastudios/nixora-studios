import { TOOLS } from './tools';
const providers: Record<string, string> = {
  'text-to-image': 'pollinations', 'photo-to-video': 'self-host', 'text-to-video': 'self-host',
  animation: 'browser', 'voice-over': 'self-host', 'sound-effects': 'self-host', lipsync: 'self-host',
  'music-daw': 'self-host', 'video-editor': 'browser', 'code-engine': 'groq-free',
};
export const ENGINES = TOOLS.map(tool => ({
  ...tool, provider: providers[tool.slug], model: null,
  prompt: '', settings: { quality: 'HD', aspectRatio: '16:9', durationSeconds: 5 },
  connected: false,
}));
// Provider names mirror config/engines.js; no placeholder URLs or keys are imported.
