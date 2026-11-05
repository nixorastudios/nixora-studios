import { describe, expect, it } from 'vitest';
import { CODE_AUTOSAVE_MS, PROFESSIONS, WORKFLOW, assertCanBuild, assertCanExport, checkCodeFiles, previewDocument } from '../lib/code-engine';
describe('Code Engine workflow', () => {
  it('autosaves every ten seconds', () => expect(CODE_AUTOSAVE_MS).toBe(10000));
  it('supports all twelve requested professions', () => expect(PROFESSIONS).toEqual(['Coder','Developer','Mechanical Engineer','Architect','Construction Engineer','Car Designer','Teacher','Artist','Drawer','Building Plans','Innovative Creator','Inventor']));
  it('keeps the seven workflow stages in order', () => expect(WORKFLOW).toEqual(['Idea','Plan','Build','Check','Fix','Test','Publish + Backup']));
  it('requires plan approval before build', () => expect(() => assertCanBuild({ plan: null, approved: false })).toThrow('Approve'));
  it('blocks invalid JavaScript before export', () => expect(() => assertCanExport([{ path:'index.html', content:'<html><script>const = ;</script></html>' }], true)).toThrow());
  it('requires preview testing before export', () => expect(() => assertCanExport([{ path:'index.html', content:'<h1>Hello</h1>' }], false)).toThrow('Test'));
  it('accepts runnable HTML and scripts', () => expect(checkCodeFiles([{ path:'index.html', content:'<h1>Hello</h1>' }, {path:'app.js',content:'const x = 3;'}]).passed).toBe(true));
  it('rejects traversal paths', () => expect(checkCodeFiles([{path:'index.html',content:'<h1>Hello</h1>'},{path:'../secret.js',content:''}]).passed).toBe(false));
  it('embeds project styles and blocks network requests', () => { const doc = previewDocument([{path:'index.html',content:'<link rel="stylesheet" href="style.css"><h1>App</h1>'},{path:'style.css',content:'h1{font-size:40px}'}]); expect(doc).toContain('<style>h1{font-size:40px}</style>'); expect(doc).toContain("connect-src 'none'"); });
});