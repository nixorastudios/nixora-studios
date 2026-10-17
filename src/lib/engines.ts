import { TOOLS } from './tools';
export type EngineProvider = 'pollinations' | 'replicate' | 'huggingface' | 'browser';
export interface EngineConfig { slug: string; model: string; provider: EngineProvider; connected: boolean; }
export const ENGINES: EngineConfig[] = TOOLS.map(tool => ({
  slug: tool.slug,
  model: tool.slug.includes('image') ? 'flux' : tool.slug.includes('video') ? 'stable-video' : 'default',
  provider: 'pollinations' as EngineProvider,
  connected: true,
}));
export function getEngine(slug: string) { return ENGINES.find(e => e.slug === slug) ?? null; }
