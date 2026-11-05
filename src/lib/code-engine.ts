import { z } from 'zod';
import { parse } from 'acorn';

export const PROFESSIONS = ['Coder', 'Developer', 'Mechanical Engineer', 'Architect', 'Construction Engineer', 'Car Designer', 'Teacher', 'Artist', 'Drawer', 'Building Plans', 'Innovative Creator', 'Inventor'] as const;
export const WORKFLOW = ['Idea', 'Plan', 'Build', 'Check', 'Fix', 'Test', 'Publish + Backup'] as const;
export const CODE_AUTOSAVE_MS = 10_000;
export const projectFileSchema = z.object({ path: z.string(), content: z.string() }).strict();
export const codePlanSchema = z.object({
  title: z.string(), summary: z.string(), steps: z.array(z.string()), warnings: z.array(z.string()),
  cost: z.string(), time: z.string(), needs: z.array(z.string()),
}).strict();
export const codeBuildSchema = z.object({
  summary: z.string(), files: z.array(projectFileSchema), needs: z.array(z.string()),
  fixes: z.array(z.string()), warnings: z.array(z.string()),
  scene: z.object({ kind: z.enum(['none', 'building', 'car', 'machine', 'sculpture']), description: z.string() }).strict(),
}).strict();
export type CodeFile = z.infer<typeof projectFileSchema>;
export type CodePlan = z.infer<typeof codePlanSchema>;
export type CodeBuild = z.infer<typeof codeBuildSchema>;
export type CodeProject = { id: string; name: string; profession: string; idea: string; plan: CodePlan | null; approved: boolean; files: CodeFile[]; updated_at?: string };

export function checkCodeFiles(files: CodeFile[]) {
  const errors: string[] = [];
  if (!files.some(f => f.path === 'index.html' && /<[^>]+>/.test(f.content))) errors.push('A non-empty index.html is required.');
  const seen = new Set<string>();
  for (const file of files) {
    if (!/^[a-zA-Z0-9_./-]+$/.test(file.path) || file.path.includes('..') || file.path.startsWith('/')) errors.push(`Unsafe file path: ${file.path}`);
    if (seen.has(file.path)) errors.push(`Duplicate file: ${file.path}`);
    seen.add(file.path);
    const scripts = file.path.endsWith('.js') ? [file.content] : file.path.endsWith('.html') ? Array.from(file.content.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi), m => m[1]).filter(Boolean) : [];
    for (const script of scripts) {
      if (!script) continue;
      try { parse(script, { ecmaVersion: 'latest', sourceType: 'module' }); } catch (e) { errors.push(`${file.path}: ${e instanceof Error ? e.message : 'JavaScript syntax error'}`); }
    }
    if (file.path.endsWith('.ts') || file.path.endsWith('.tsx') || file.path.endsWith('.jsx')) errors.push(`${file.path}: browser preview requires plain HTML, CSS and JavaScript.`);
  }
  return { passed: errors.length === 0, errors };
}

export function assertCanBuild(project: Pick<CodeProject, 'plan' | 'approved'>) {
  if (!project.plan || !project.approved) throw new Error('Approve the project plan before building.');
}
export function assertCanExport(files: CodeFile[], tested: boolean) {
  const result = checkCodeFiles(files);
  if (!result.passed) throw new Error(result.errors.join('\n'));
  if (!tested) throw new Error('Test the project preview before exporting.');
}

export function previewDocument(files: CodeFile[], bridge = false) {
  let html = files.find(f => f.path === 'index.html')?.content ?? '';
  for (const f of files) {
    if (f.path.endsWith('.css')) html = html.replace(new RegExp(`<link[^>]*href=["'](?:\\./)?${f.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'gi'), `<style>${f.content}</style>`);
    if (f.path.endsWith('.js')) html = html.replace(new RegExp(`<script[^>]*src=["'](?:\\./)?${f.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>\\s*</script>`, 'gi'), `<script>${f.content.replace(/<\/script/gi, '<\\/script')}</script>`);
  }
  const policy = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'">`;
  const reporter = bridge ? `<script>window.addEventListener('error',e=>parent.postMessage({nixoraPreview:true,error:e.message},'*'));window.addEventListener('unhandledrejection',e=>parent.postMessage({nixoraPreview:true,error:String(e.reason)},'*'));window.addEventListener('load',()=>parent.postMessage({nixoraPreview:true,loaded:true},'*'));</script>` : '';
  return policy + reporter + html;
}

export const CODE_TEMPLATES = [
  { title: 'Creative portfolio', category: 'Website', idea: 'Build a polished responsive artist portfolio with a project gallery, category filters, an about section and contact form with local validation.' },
  { title: 'Learning lab', category: 'Education', idea: 'Build an interactive physics lesson app teaching forces with sliders, calculations, a diagram and a five-question quiz.' },
  { title: 'Floor plan studio', category: 'Architecture', idea: 'Build a conceptual 2-bedroom floor plan editor with labeled rooms, dimensions in metres, editable room sizes and total area calculation. Clearly mark it as conceptual, not certified.' },
  { title: 'Vehicle concept', category: 'Design', idea: 'Build a car design configurator with color choices, dimensional specifications and a clearly labeled conceptual 3D vehicle view.' },
];