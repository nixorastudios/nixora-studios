import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { Code2, Sparkles, ArrowUp, FolderOpen, LayoutTemplate, Plug, History, Cloud, Save, Github, Globe, Plus, ChevronRight, FileCode, Monitor, Smartphone, Box, Check, ShieldCheck, Loader2, Square, Paperclip, Download, X, RotateCcw, CircleCheck, Wrench, Lightbulb, ArrowLeft, RefreshCw, Copy, Trash2, Link2, Database, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { CODE_AUTOSAVE_MS, CLOUD_SYNC_MS, CODE_TEMPLATES, PROFESSIONS, WORKFLOW, assertCanExport, checkCodeFiles, codePlanSchema, codeBuildSchema, previewDocument, type CodeProject, type CodeBuild, type CodeFile } from '@/lib/code-engine';
import { approveCodePlan, deleteCodeProject, listCodeProjects, listCodeVersions, publishCodeProject, saveCodeProject, unpublishCodeProject } from '@/lib/code-engine.functions';
import { getGitHubStatus, listGitHubCommits, listGitHubRepos, pushProjectToGitHub } from '@/lib/github.functions';
import { getOwnerStatus } from '@/lib/owner.functions';
import { CodeScene } from './CodeScene';

const LOCAL_KEY = 'nixora_code_engine_projects_v1';
const freshProject = (): CodeProject => ({ id: crypto.randomUUID(), name: 'Untitled project', profession: 'Developer', idea: '', plan: null, approved: false, files: [] });
type Version = { id: string; summary: string; files: unknown; created_at: string };
type Repo = { name: string; fullName: string; private: boolean };
type Commit = { sha: string; message: string; date: string };

const ago = (iso?: string) => {
  if (!iso) return 'Not yet';
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 5) return 'Just now';
  if (s < 60) return `${s}s ago`;
  return `${Math.round(s / 60)}m ago`;
};

export function CodeEngine() {
  const [project, setProject] = useState<CodeProject | null>(null);
  const [projects, setProjects] = useState<CodeProject[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [ready, setReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Local draft');
  const [localAt, setLocalAt] = useState<string>();
  const [cloudAt, setCloudAt] = useState<string>();
  const [cloudFailed, setCloudFailed] = useState(false);
  const [githubVersion, setGithubVersion] = useState<number>();
  const [nav, setNav] = useState('Workspace');
  const [view, setView] = useState('Preview');
  const [filePath, setFilePath] = useState('index.html');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [activity, setActivity] = useState('');
  const [summary, setSummary] = useState('');
  const [build, setBuild] = useState<CodeBuild | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [drawerFor, setDrawerFor] = useState<string>();
  const [phone, setPhone] = useState(false);
  const [tested, setTested] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [runtimeErrors, setRuntimeErrors] = useState<string[]>([]);
  const [previewKey, setPreviewKey] = useState(0);
  const [instruction, setInstruction] = useState('');
  const [reference, setReference] = useState<{name:string;data:string}|null>(null);
  const [usage, setUsage] = useState('');
  const [github, setGithub] = useState<{connected:boolean;username?:string}>({ connected: false });
  const [repos, setRepos] = useState<Repo[]>([]);
  const [repo, setRepo] = useState('');
  const [commits, setCommits] = useState<Commit[]>([]);
  const [publishedPath, setPublishedPath] = useState('');
  const frame = useRef<HTMLIFrameElement>(null);
  const controller = useRef<AbortController | null>(null);
  const current = useRef(project); current.current = project;
  const saveFn = useServerFn(saveCodeProject);
  const listFn = useServerFn(listCodeProjects);
  const approveFn = useServerFn(approveCodePlan);
  const historyFn = useServerFn(listCodeVersions);
  const deleteFn = useServerFn(deleteCodeProject);
  const publishFn = useServerFn(publishCodeProject);
  const unpublishFn = useServerFn(unpublishCodeProject);
  const ownerFn = useServerFn(getOwnerStatus);
  const ghStatusFn = useServerFn(getGitHubStatus);
  const ghReposFn = useServerFn(listGitHubRepos);
  const ghPushFn = useServerFn(pushProjectToGitHub);
  const ghCommitsFn = useServerFn(listGitHubCommits);

  const decodeProject = (row: Record<string, unknown>): CodeProject => ({ id: String(row['id']), name: String(row['name']), profession: String(row['profession']), idea: String(row['idea']), plan: row['plan'] ? codePlanSchema.parse(row['plan']) : null, approved: row['approved'] === true, files: Array.isArray(row['files']) ? row['files'] as CodeFile[] : [], ...(row['updated_at'] ? { updated_at: String(row['updated_at']) } : {}) });

  const refreshGitHub = async () => {
    try {
      const status = await ghStatusFn();
      setGithub(status.connected ? { connected: true, username: status.username ?? '' } : { connected: false });
      if (status.connected) {
        const list = await ghReposFn();
        setRepos(list);
        const first = list[0]?.name;
        if (!repo && first) setRepo(first);
      }
    } catch { setGithub({ connected: false }); }
  };
  const ghRef = useRef(refreshGitHub); ghRef.current = refreshGitHub;

  useEffect(() => {
    let active = true;
    try { const rows = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]'); if (Array.isArray(rows)) { const saved=rows.map(decodeProject);setProjects(saved);setProject(saved[0] ?? freshProject()); } else setProject(freshProject()); } catch { setProject(freshProject()); }
    setReady(true);
    const checkSession = async () => {
      const {data}=await supabase.auth.getUser();if(!active)return;
      setSignedIn(!!data.user);
      if(data.user){
        try{const rows=await listFn();if(active){const saved=rows.map(r=>decodeProject(r));setProjects(prev=>[...saved,...prev.filter(p=>!saved.some(s=>s.id===p.id))]);}}catch{if(active)setError('Cloud projects could not be loaded. Your local drafts are available.');}
        try{const owner=await ownerFn();if(active)setIsOwner(owner.isOwner);if(owner.isOwner)void ghRef.current();}catch{if(active)setIsOwner(false);}
      } else { setIsOwner(false); setGithub({ connected: false }); }
    };
    checkSession();
    const {data:{subscription}}=supabase.auth.onAuthStateChange(event=>{if(event==='SIGNED_IN'||event==='SIGNED_OUT')checkSession();});
    return()=>{active=false;subscription.unsubscribe();controller.current?.abort();};
  },[listFn,ownerFn]);

  const save = async (cloud = true) => {
    const p = current.current;if(!p)return false;
    try {
      const stored = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]');
      const rows=[p,...(Array.isArray(stored)?stored:[]).filter((r:CodeProject)=>r.id!==p.id)].slice(0,50);
      localStorage.setItem(LOCAL_KEY,JSON.stringify(rows));setProjects(rows);setSaveStatus('Saved locally');setLocalAt(new Date().toISOString());
      if(signedIn&&cloud){setSaveStatus('Syncing…');await saveFn({data:{id:p.id,name:p.name||'Untitled project',profession:p.profession as typeof PROFESSIONS[number],idea:p.idea,files:p.files}});setSaveStatus('Cloud synced');setCloudAt(new Date().toISOString());setCloudFailed(false);}
      return true;
    } catch(e){setSaveStatus('Save needs attention');setCloudFailed(true);setError(e instanceof Error?e.message:'Could not save this draft.');return false;}
  };
  const saveRef=useRef(save);saveRef.current=save;
  useEffect(()=>{if(!ready)return;const timer=setInterval(()=>saveRef.current(false),CODE_AUTOSAVE_MS);const onLeave=()=>{void saveRef.current(false);};window.addEventListener('pagehide',onLeave);return()=>{clearInterval(timer);window.removeEventListener('pagehide',onLeave);};},[ready]);
  useEffect(()=>{if(!ready||!signedIn)return;const timer=setInterval(()=>saveRef.current(true),CLOUD_SYNC_MS);return()=>clearInterval(timer);},[ready,signedIn]);
  useEffect(()=>{setTested(false);setLoaded(false);setRuntimeErrors([]);},[project?.files,previewKey]);
  useEffect(()=>{const receive=(e:MessageEvent)=>{if(e.source!==frame.current?.contentWindow||!e.data?.nixoraPreview)return;if(e.data.loaded)setLoaded(true);if(typeof e.data.error==='string'){setRuntimeErrors(prev=>[...prev,e.data.error]);setTested(false);}};window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);},[]);

  const signIn = async (provider:'google'|'lovable') => { setError('');try{await lovable.auth.signInWithOAuth(provider,{redirect_uri:`${window.location.origin}/tools/code-engine`});const {data}=await supabase.auth.getUser();setSignedIn(!!data.user);}catch(e){setError(e instanceof Error?e.message:'Sign-in failed.');} };
  const change = (patch: Partial<CodeProject>, invalidate = false) => setProject(prev=>prev?{...prev,...patch,...(invalidate?{plan:null,approved:false}:{})}:prev);
  const startNew = () => {void save(false);setProject(freshProject());setBuild(null);setError('');setSummary('');setNav('Workspace');setReference(null);setPublishedPath('');};
  const run = async (action:'plan'|'build'|'fix'|'feature'|'suggest', override?: string, automaticFix=false) => {
    const p=current.current;if(!p||busy)return;
    if(!signedIn){setError('Sign in to plan and build with AI.');return;}
    if(!p.idea.trim()){setError('Enter your project idea first.');return;}
    setBusy(action);setError('');setSummary('');setActivity(action==='plan'?'Understanding your idea…':'Working on your project…');
    controller.current=new AbortController();
    try {
      const saved = await save();
      if (saved === false) throw new Error('Save your project successfully before starting AI work.');
      const {data}=await supabase.auth.getSession();const token=data.session?.access_token;if(!token)throw new Error('Sign in again to continue.');
      const response=await fetch('/api/code-engine',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({id:p.id,action,instruction:override??instruction,reference:reference?.data??null}),signal:controller.current.signal});
      if(!response.ok)throw new Error(await response.text());
      const reader=response.body?.getReader();if(!reader)throw new Error('The AI response was empty.');
      const decoder=new TextDecoder();let buffer='';let fixErrors:string[]=[];
      for(;;){const part=await reader.read();if(part.done)break;buffer+=decoder.decode(part.value,{stream:true});let boundary=buffer.indexOf('\n\n');while(boundary>=0){const chunk=buffer.slice(0,boundary);buffer=buffer.slice(boundary+2);const event=chunk.match(/^event: (.+)$/m)?.[1];const raw=chunk.match(/^data: (.+)$/m)?.[1];if(raw){const value=JSON.parse(raw);if(event==='error')throw new Error(value.message);if(event==='status')setActivity(value.message);if(event==='summary')setSummary(prev=>(prev+value.text).slice(-5000));if(event==='usage')setUsage(`${value.inputTokens??0} input · ${value.outputTokens??0} output tokens · workspace credits billed`);if(event==='result'){if(value.type==='plan'){const plan=codePlanSchema.parse(value.data);if(action==='suggest')setActivity(`Next steps: ${plan.needs.join(' · ')}`);else{change({plan,approved:false,name:p.name==='Untitled project'?plan.title:p.name});setActivity('Plan ready — your approval is required.');}}else{const b=codeBuildSchema.parse(value.data);change({files:b.files});setBuild(b);setFilePath('index.html');setView('Preview');const checked=checkCodeFiles(b.files);setActivity(checked.passed?'Version saved. Syntax checks passed — preview testing required.':'Check failed. Publishing is blocked.');fixErrors=checked.errors;setRuntimeErrors([]);setPreviewKey(prev=>prev+1);}}}boundary=buffer.indexOf('\n\n');}}
      if(fixErrors.length&&!automaticFix){setActivity('Check found errors. Starting one automatic repair…');setBusy('');setTimeout(()=>void runRef.current('fix',fixErrors.join('\n'),true),0);}
    }catch(e){setError(e instanceof Error&&e.name==='AbortError'?'Generation stopped. Your saved project is unchanged.':e instanceof Error?e.message:'Generation failed.');}finally{setBusy('');}
  };
  const runRef=useRef(run);runRef.current=run;
  const approve = async()=>{if(!project?.plan)return;setBusy('approve');try{await save();await approveFn({data:{id:project.id}});change({approved:true});setActivity('Plan approved. Ready to build Version 1.');}catch(e){setError(e instanceof Error?e.message:'Approval failed.');}finally{setBusy('');}};
  const download = (filename:string,content:string|Blob,type='text/html')=>{const url=URL.createObjectURL(typeof content==='string'?new Blob([content],{type}):content);const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  const exportProject=()=>{if(!project)return;try{assertCanExport(project.files,tested&&runtimeErrors.length===0);download(`${project.name.replace(/[^a-z0-9-]/gi,'-')}.html`,previewDocument(project.files));void save();setActivity('Standalone HTML exported. Cloud backup saved when connected.');}catch(e){setError(e instanceof Error?e.message:'Export blocked.');}};
  const downloadZip=async(p:CodeProject)=>{try{const zip=new JSZip();for(const f of p.files)zip.file(f.path,f.content);if(!p.files.length)zip.file('README.txt','This project has no files yet.');download(`${p.name.replace(/[^a-z0-9-]/gi,'-')}.zip`,await zip.generateAsync({type:'blob'}),'application/zip');}catch{setError('Could not create the ZIP download.');}};
  const removeProject=async(p:CodeProject)=>{setBusy('delete');setError('');try{if(signedIn)await deleteFn({data:{id:p.id}});const rows=projects.filter(x=>x.id!==p.id);setProjects(rows);localStorage.setItem(LOCAL_KEY,JSON.stringify(rows));if(project?.id===p.id)startNew();toast.success('Project deleted.');}catch(e){setError(e instanceof Error?e.message:'Delete failed.');}finally{setBusy('');}};
  const openVersions=async(p:CodeProject)=>{setDrawerFor(p.id);setVersions([]);if(!signedIn){setError('Sign in to view saved Cloud versions.');return;}try{setVersions(await historyFn({data:{id:p.id}}));}catch(e){setError(e instanceof Error?e.message:'History unavailable.');}};
  const pushToGitHub=async()=>{const p=current.current;if(!p||!repo)return;if(!p.files.length){setError('Build the project before pushing to GitHub.');return;}setBusy('push');setError('');try{const result=await ghPushFn({data:{projectId:p.id,name:p.name,repo,files:p.files}});setGithubVersion(result.version);toast.success(`Pushed successfully - Version ${result.version} saved to GitHub`);setCommits(await ghCommitsFn({data:{repo}}));}catch(e){setError(e instanceof Error?e.message:'GitHub push failed.');}finally{setBusy('');}};
  const loadCommits=async(name:string)=>{setRepo(name);setCommits([]);try{setCommits(await ghCommitsFn({data:{repo:name}}));}catch{setCommits([]);}};
  const publish=async()=>{if(!project)return;setBusy('publish');setError('');try{await save();const result=await publishFn({data:{id:project.id}});setPublishedPath(result.path);toast.success('Project is live.');}catch(e){setError(e instanceof Error?e.message:'Publishing failed.');}finally{setBusy('');}};
  const unpublish=async()=>{if(!project)return;setBusy('publish');try{await unpublishFn({data:{id:project.id}});setPublishedPath('');toast.success('Project unpublished.');}catch(e){setError(e instanceof Error?e.message:'Unpublish failed.');}finally{setBusy('');}};
  const copyLink=()=>{if(!publishedPath)return;void navigator.clipboard?.writeText(`${window.location.origin}${publishedPath}`).then(()=>toast.success('Live link copied.'));};
  const loadReference=async(file?:File)=>{if(!file)return;if(!file.type.startsWith('image/')||file.size>8_000_000){setError('Choose an image smaller than 8 MB.');return;}const image=new Image();const url=URL.createObjectURL(file);image.onload=()=>{const scale=Math.min(1,1200/Math.max(image.width,image.height));const canvas=document.createElement('canvas');canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);canvas.getContext('2d')?.drawImage(image,0,0,canvas.width,canvas.height);setReference({name:file.name,data:canvas.toDataURL('image/jpeg',0.8)});URL.revokeObjectURL(url);};image.src=url;};
  const navTo=async(name:string)=>{setNav(name);setError('');setDrawerFor(undefined);if(name==='History'&&project&&signedIn){try{setVersions(await historyFn({data:{id:project.id}}));}catch(e){setError(e instanceof Error?e.message:'History unavailable.');}}if(name==='Connections'&&isOwner)void ghRef.current();};
  const checks = checkCodeFiles(project?.files??[]);
  const selectedFile=project?.files.find(f=>f.path===filePath);
  const stage=project?.files.length?(tested?6:checks.passed?5:4):project?.approved?2:project?.plan?1:0;
  if(!project)return <div className="code-engine min-h-screen bg-background p-8 text-foreground"><Loader2 className="animate-spin"/></div>;

  const connectionCards = [
    { name: 'GitHub', icon: Github, connected: github.connected, detail: github.connected ? `Connected · @${github.username}` : 'Not connected' },
    { name: 'NIXORA Cloud', icon: Cloud, connected: signedIn, detail: signedIn ? 'Connected · private project backup' : 'Not connected' },
    { name: 'Supabase', icon: Database, connected: false, detail: 'Coming soon' },
    { name: 'Firebase', icon: Database, connected: false, detail: 'Coming soon' },
    { name: 'Google Drive', icon: HardDrive, connected: false, detail: 'Coming soon' },
    { name: 'Dropbox', icon: HardDrive, connected: false, detail: 'Coming soon' },
  ];

  return <main className="code-engine min-h-screen bg-background text-foreground">
    <header className="code-topbar flex min-h-20 flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4">
      <div className="flex min-w-0 items-center gap-3"><Link to="/" aria-label="Back to NIXORA homepage" className="text-muted-foreground"><ArrowLeft className="size-4"/></Link><span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-primary/40 text-primary"><Code2/></span><div><h1 className="text-base font-bold">NIXORA <span className="text-primary">CODE ENGINE</span></h1><p className="text-xs text-muted-foreground">CREATE WITHOUT LIMITS</p></div><span className="mx-2 hidden h-8 border-l border-border lg:block"/><Input aria-label="Project name" value={project.name} onChange={e=>change({name:e.target.value})} className="hidden w-44 border-none bg-transparent lg:block"/></div>
      <div className="flex flex-wrap items-center gap-2"><Button variant="ghost" size="icon" title="Save project" aria-label="Save project" onClick={()=>save()}><Save/></Button><Button variant="outline" onClick={()=>navTo('Cloud')}><Cloud/><span className="hidden sm:inline">Cloud Sync</span></Button><Button variant="outline" onClick={()=>navTo('Connections')}><Github/><span className="hidden xl:inline">Push to GitHub</span></Button><Button onClick={()=>{setNav('Publish');setError('');}}><Globe/>Publish Live</Button></div>
    </header>
    <div role="status" className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-border bg-card px-5 py-2 text-[11px]">
      <span className="flex items-center gap-1.5"><span className={`size-2 rounded-full ${localAt?'bg-video-success':'bg-muted-foreground'}`}/>Local: {localAt?`Saved · ${ago(localAt)}`:'Not saved yet'}</span>
      <span className="flex items-center gap-1.5"><span className={`size-2 rounded-full ${cloudFailed?'bg-destructive':cloudAt?'bg-video-success':'bg-muted-foreground'}`}/>Cloud: {cloudFailed?<span className="text-destructive">Sync failed <button className="underline" onClick={()=>save()}>Retry</button></span>:signedIn?`Synced · ${ago(cloudAt)}`:'Sign in to sync'}</span>
      <span className="flex items-center gap-1.5"><span className={`size-2 rounded-full ${githubVersion?'bg-video-success':'bg-muted-foreground'}`}/>GitHub: {githubVersion?`Version ${githubVersion}`:github.connected?'Connected':'Not connected'}</span>
      <span className="ml-auto hidden text-muted-foreground md:inline">{saveStatus}</span>
    </div>
    <div className="code-layout">
      <aside className="code-sidebar border-r border-border px-3 py-6">
        <Button variant="outline" className="mb-7 w-full justify-start border-primary/30 text-primary" onClick={startNew}><Plus/>New project</Button>
        <p className="mb-3 px-3 text-[10px] font-bold text-muted-foreground">WORKSPACE</p>
        {([{label:'Workspace',icon:Code2},{label:'My Projects',icon:FolderOpen},{label:'Templates',icon:LayoutTemplate},{label:'Connections',icon:Plug},{label:'History',icon:History},{label:'Cloud',icon:Cloud}]).map(item=><Button key={item.label} variant="ghost" className={`mb-1 w-full justify-start ${nav===item.label?'bg-accent text-primary':'text-muted-foreground'}`} onClick={()=>navTo(item.label)}><item.icon/>{item.label}</Button>)}
        <div className="mt-12 border-t border-border px-3 pt-6"><ShieldCheck className="mb-2 size-5 text-primary"/><p className="text-xs font-medium">Your ideas. Your files.</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{signedIn?'Private Cloud workspace':'Local workspace'}</p><p className="mt-6 text-[10px] text-muted-foreground">NIXORA STUDIOS LTD - CR 9950450</p></div>
      </aside>
      {nav!=='Workspace'?<section className="min-w-0 p-6 md:p-10">
        <div className="mb-8 flex items-center justify-between"><div><p className="mb-2 text-xs text-primary">NIXORA CODE ENGINE</p><h2 className="text-3xl font-semibold">{nav}</h2></div><Button variant="ghost" size="icon" title="Return to workspace" onClick={()=>setNav('Workspace')}><X/></Button></div>
        {error&&<p role="alert" className="mb-6 text-destructive">{error}</p>}
        {nav==='My Projects'&&<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{projects.length?projects.map(p=><div key={p.id} className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-start gap-3"><FolderOpen className="mt-1 text-primary"/><div className="min-w-0"><strong className="block truncate">{p.name}</strong><span className="mt-1 block text-xs text-muted-foreground">{p.profession} · {p.files.length} files</span><span className="mt-1 block text-xs text-muted-foreground">Last saved: {ago(p.updated_at)}{p.updated_at?'':' · this device'}</span></div></div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={()=>{setProject(p);setBuild(null);setNav('Workspace');setReference(null);}}>Open</Button>
            <Button size="sm" variant="outline" onClick={()=>openVersions(p)}><History/>Versions</Button>
            <Button size="sm" variant="outline" onClick={()=>downloadZip(p)}><Download/>ZIP</Button>
            <Button size="sm" variant="ghost" aria-label={`Delete ${p.name}`} disabled={busy==='delete'} onClick={()=>removeProject(p)}><Trash2 className="text-destructive"/></Button>
          </div>
          {drawerFor===p.id&&<div className="mt-4 border-t border-border pt-3"><p className="mb-2 text-[10px] font-semibold text-muted-foreground">VERSION HISTORY</p>{versions.length?versions.map(v=><div key={v.id} className="mb-2 flex items-center justify-between gap-2 text-xs"><span className="min-w-0"><span className="block truncate">{v.summary}</span><span className="text-muted-foreground">{new Date(v.created_at).toLocaleString()}</span></span><Button size="sm" variant="ghost" onClick={()=>{if(Array.isArray(v.files)){setProject({...p,files:v.files as CodeFile[]});setBuild(null);setNav('Workspace');toast.success('Version restored.');}}}><RotateCcw/>Restore</Button></div>):<p className="text-xs text-muted-foreground">{signedIn?'No Cloud versions yet.':'Sign in for Cloud versions.'}</p>}</div>}
        </div>):<p className="text-muted-foreground">No saved projects yet.</p>}</div>}
        {nav==='Templates'&&<div className="grid gap-4 sm:grid-cols-2">{CODE_TEMPLATES.map(t=><Button key={t.title} variant="outline" className="h-auto justify-start whitespace-normal p-6 text-left" onClick={()=>{startNew();setProject(p=>p?{...p,name:t.title,idea:t.idea}:p);}}><LayoutTemplate className="text-primary"/><span><strong className="block">{t.title}</strong><span className="block text-xs text-muted-foreground">{t.category}</span></span></Button>)}</div>}
        {nav==='Connections'&&(!isOwner?<div className="max-w-xl space-y-4"><ShieldCheck className="size-10 text-primary"/><h3 className="text-xl">Owner access required</h3><p className="text-muted-foreground">Connections and Cloud settings are limited to the verified owner account of NIXORA STUDIOS LTD - CR 9950450. Sign in with the owner account to manage them.</p>{!signedIn&&<div className="flex flex-wrap gap-3"><Button onClick={()=>signIn('google')}>Sign in with Google</Button><Button variant="outline" onClick={()=>signIn('lovable')}>Sign in with Lovable</Button></div>}</div>:
        <div className="max-w-3xl space-y-8">
          <div className="grid gap-4 sm:grid-cols-2">{connectionCards.map(c=><div key={c.name} className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-3"><c.icon className="text-primary"/><div><p className="font-medium">{c.name}</p><p className={`mt-1 text-xs ${c.connected?'text-video-success':'text-muted-foreground'}`}>{c.detail}</p></div></div>
            {c.name==='GitHub'?<Button variant="outline" size="sm" onClick={()=>{if(github.connected){setGithub({connected:false});setRepos([]);setCommits([]);toast.success('GitHub disconnected for this session. The workspace connection stays linked.');}else void ghRef.current().then(()=>{toast.success('Connected Successfully - Your projects are now safe in Cloud + GitHub');});}}>{github.connected?'Disconnect':'Connect GitHub'}</Button>:
            c.name==='NIXORA Cloud'?<Button variant="outline" size="sm" onClick={()=>setNav('Cloud')}>{signedIn?'Manage':'Connect'}<ChevronRight/></Button>:
            <Button variant="outline" size="sm" disabled>Coming soon</Button>}
          </div>)}</div>
          {github.connected&&<div className="space-y-4 rounded-xl border border-primary/30 bg-card p-5">
            <p className="flex items-center gap-2 text-sm font-medium"><Github className="text-primary"/>GitHub · @{github.username}</p>
            <div className="flex flex-wrap items-center gap-2">
              <select aria-label="Repository" value={repo} onChange={e=>loadCommits(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">{repos.map(r=><option key={r.fullName} value={r.name}>{r.name}{r.private?' (private)':''}</option>)}</select>
              <Input aria-label="New repository name" value={repo} onChange={e=>setRepo(e.target.value)} placeholder="or type a repo name" className="w-48"/>
              <Button onClick={pushToGitHub} disabled={busy==='push'||!repo}>{busy==='push'?<Loader2 className="animate-spin"/>:<Github/>}Push to GitHub</Button>
            </div>
            {commits.length>0&&<div className="divide-y divide-border border-t border-border pt-2">{commits.map(c=><div key={c.sha} className="flex items-center justify-between gap-3 py-2 text-xs"><span className="min-w-0 truncate">{c.message}</span><span className="shrink-0 text-muted-foreground">{c.sha} · {c.date?new Date(c.date).toLocaleDateString():''}</span></div>)}</div>}
            <p className="text-xs text-muted-foreground">Your GitHub token is stored securely on the server and is never shown here.</p>
          </div>}
        </div>)}
        {nav==='Cloud'&&<div className="max-w-xl space-y-6"><Cloud className="size-12 text-primary"/><h3 className="text-xl">{signedIn?'Private Cloud backup is connected':'Sign in for private Cloud backup'}</h3><p className="text-muted-foreground">{signedIn?'Projects save locally every 10 seconds and sync to Cloud every 30 seconds while this workspace is open. Each AI build creates a saved version.':'Your local projects stay on this device. Sign in to save and resume across devices.'}</p>{signedIn?<><Button onClick={()=>save()}><RefreshCw/>Sync to Cloud</Button><p role="status" className="text-sm text-primary">{cloudFailed?<span className="text-destructive">Cloud sync failed — retry.</span>:`Cloud Synced · ${ago(cloudAt)}`}</p></>:<div className="flex flex-wrap gap-3"><Button onClick={()=>signIn('google')}>Sign in with Google</Button><Button variant="outline" onClick={()=>signIn('lovable')}>Sign in with Lovable</Button></div>}<Button variant="outline" onClick={()=>download(`${project.name}.json`,JSON.stringify(project,null,2),'application/json')}><Download/>Download project backup</Button></div>}
        {nav==='History'&&<div className="max-w-3xl divide-y divide-border">{versions.length?versions.map(v=><div key={v.id} className="flex flex-wrap items-center justify-between gap-3 py-5"><div><p>{v.summary}</p><p className="mt-2 text-xs text-muted-foreground">{new Date(v.created_at).toLocaleString()}</p></div><Button variant="outline" onClick={()=>{if(Array.isArray(v.files)){change({files:v.files as CodeFile[]});setNav('Workspace');setBuild(null);}}}><RotateCcw/>Restore version</Button></div>):<p className="text-muted-foreground">{signedIn?'No build versions yet.':'Sign in to view saved Cloud versions.'}</p>}</div>}
        {nav==='Publish'&&<div className="max-w-2xl space-y-6"><Globe className="size-10 text-primary"/><h3 className="text-xl">Pre-publish checklist</h3><div className="space-y-3"><p className={checks.passed?'text-video-success':'text-destructive'}>{checks.passed?'✓ Syntax checks passed':'○ Complete and check your build'}</p><p className={tested?'text-video-success':'text-muted-foreground'}>{tested?'✓ Preview test confirmed':'○ Test desktop and phone previews'}</p><p className={signedIn?'text-video-success':'text-muted-foreground'}>{signedIn?'✓ Cloud backup connected':'○ Sign in for Cloud backup'}</p><p className={github.connected?'text-video-success':'text-muted-foreground'}>{github.connected?'✓ GitHub connected':'○ Connect GitHub for repository backup'}</p></div>
          {publishedPath?<div className="space-y-3 rounded-xl border border-video-success/40 bg-card p-5"><p className="flex items-center gap-2 text-sm text-video-success"><Link2/>Live at {window.location.origin}{publishedPath}</p><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={copyLink}><Copy/>Copy Link</Button><Button size="sm" variant="outline" onClick={()=>window.open(publishedPath,'_blank','noopener')}><Globe/>Open live page</Button><Button size="sm" variant="ghost" onClick={unpublish} disabled={busy==='publish'}>Unpublish</Button></div></div>:
          <div className="flex flex-wrap gap-3"><Button onClick={publish} disabled={!checks.passed||!tested||!signedIn||busy==='publish'}>{busy==='publish'?<Loader2 className="animate-spin"/>:<Globe/>}Publish Live</Button><Button variant="outline" onClick={exportProject} disabled={!checks.passed||!tested}><Download/>Export checked project</Button><Button variant="outline" onClick={()=>download(`${project.name}.json`,JSON.stringify(project,null,2),'application/json')}>Backup project</Button></div>}
          <p className="text-sm text-muted-foreground">Publishing serves your checked files at nixorastudios.com/projects/your-project-name. AI prototypes require your own security, accessibility and professional engineering review before real-world use.</p></div>}
      </section>:<div className="code-workspace">
        <section className="code-chat flex min-w-0 flex-col border-r border-border">
          <div className="flex items-center justify-between border-b border-border px-5 py-4"><p className="flex items-center gap-2 text-sm font-medium"><Sparkles className="size-4 text-primary"/>Project conversation</p><span className="text-[10px] text-muted-foreground">AI WORKSPACE</span></div>
          <div className="flex-1 space-y-6 px-5 py-7">
            <div className="mb-8"><div className="mb-4 flex size-9 items-center justify-center rounded-md border border-primary/30 text-primary"><Sparkles className="size-5"/></div><h2 className="mb-3 text-2xl font-semibold leading-tight">What will you build today?</h2><p className="text-sm leading-relaxed text-muted-foreground">Select your profession and start inventing.</p></div>
            <label className="block text-[11px] font-medium text-muted-foreground" htmlFor="profession">YOUR PROFESSION</label>
            <select id="profession" value={project.profession} disabled={!!busy} onChange={e=>change({profession:e.target.value},true)} className="-mt-3 h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground">{PROFESSIONS.map(p=><option key={p}>{p}</option>)}</select>
            {!project.plan&&!project.files.length&&<div className="flex flex-wrap gap-2">{CODE_TEMPLATES.slice(0,3).map(t=><Button key={t.title} size="sm" variant="outline" className="text-xs" onClick={()=>change({idea:t.idea,name:t.title},true)}>{t.title}<ChevronRight className="size-3"/></Button>)}</div>}
            {project.plan&&<article className="space-y-4 border-l-2 border-primary pl-4"><p className="text-[10px] font-semibold text-primary">PROJECT PLAN</p><h3 className="text-lg font-semibold">{project.plan.title}</h3><p className="text-sm leading-relaxed text-muted-foreground">{project.plan.summary}</p><ol className="space-y-3">{project.plan.steps.map((s,i)=><li key={i} className="flex gap-3 text-sm"><span className="text-primary">{String(i+1).padStart(2,'0')}</span><span>{s}</span></li>)}</ol><div className="grid gap-3 border-y border-border py-3 text-xs"><p>Estimated cost: <span className="text-muted-foreground">{project.plan.cost}</span></p><p>Estimated time: <span className="text-muted-foreground">{project.plan.time}</span></p></div>{project.plan.warnings.map((w,i)=><p key={i} className="text-xs text-destructive">{w}</p>)}{!project.approved?<Button onClick={approve} disabled={!!busy} className="w-full"><Check/>Approve plan</Button>:<p className="flex items-center gap-2 text-sm text-video-success"><CircleCheck className="size-4"/>Plan approved</p>}</article>}
            {build&&<article className="space-y-3"><p className="text-sm leading-relaxed">{build.summary}</p>{build.fixes.map((f,i)=><p key={i} className="text-xs text-video-success">✓ {f}</p>)}{build.warnings.map((w,i)=><p key={i} className="text-xs text-destructive">{w}</p>)}</article>}
            {(build?.needs??project.plan?.needs)?.length?<div className="border-t border-border pt-4"><h3 className="mb-3 text-xs font-semibold">To complete this project you still need:</h3>{(build?.needs??project.plan?.needs??[]).map((n,i)=><p key={i} className="mb-2 flex gap-2 text-xs text-muted-foreground"><span className="mt-0.5 size-3 shrink-0 border border-border"/>{n}</p>)}</div>:null}
            {busy&&<p role="status" className="flex items-center gap-2 text-sm text-primary"><Loader2 className="size-4 animate-spin"/>{activity}</p>}
            {summary&&<details className="text-xs text-muted-foreground"><summary className="cursor-pointer">Decision summary</summary><p className="mt-3 whitespace-pre-wrap leading-relaxed">{summary}</p></details>}
            {!busy&&activity&&<p role="status" className="text-xs text-primary">{activity}</p>}
            {error&&<p role="alert" className="break-words rounded-md border border-destructive/30 p-3 text-sm text-destructive">{error}</p>}
          </div>
          <div className="border-t border-border p-4" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();void loadReference(e.dataTransfer.files[0]);}}>
            {reference&&<div className="mb-3 flex items-center gap-3"><img src={reference.data} alt="Project reference" className="size-12 rounded object-cover"/><span className="min-w-0 flex-1 truncate text-xs">{reference.name}</span><Button variant="ghost" size="icon" aria-label="Remove reference" onClick={()=>setReference(null)}><X/></Button></div>}
            <Textarea aria-label="Project idea" value={project.idea} disabled={!!busy} onChange={e=>change({idea:e.target.value},true)} placeholder="Describe your idea, or drop a sketch…" className="min-h-28 resize-none bg-card text-sm"/>
            {project.files.length>0&&<Input aria-label="Change request" value={instruction} onChange={e=>setInstruction(e.target.value)} placeholder="What should change or be fixed?" className="mt-2 text-xs"/>}
            <div className="mt-3 flex items-center justify-between gap-2"><label className="cursor-pointer text-muted-foreground" title="Attach a sketch or photo"><Paperclip className="size-4"/><input type="file" accept="image/*" aria-label="Attach sketch" className="sr-only" onChange={e=>loadReference(e.target.files?.[0])}/></label><span className="text-[10px] text-muted-foreground">{project.profession} · AI-powered</span>{busy?<Button aria-label="Stop generation" size="icon" onClick={()=>controller.current?.abort()}><Square/></Button>:<Button onClick={()=>run(project.approved?'build':'plan')} disabled={!signedIn||!project.idea.trim()}><ArrowUp/>{project.approved?'Build Version 1':'Generate plan'}</Button>}</div>
            <div className="mt-3 grid grid-cols-3 gap-1"><Button variant="ghost" size="sm" disabled={!!busy||!project.approved||!project.files.length} onClick={()=>run('fix',[instruction,...checks.errors,...runtimeErrors].join('\n'))} className="px-1 text-[10px]"><Wrench/>Fix Error</Button><Button variant="ghost" size="sm" disabled={!!busy||!project.approved||!instruction.trim()} onClick={()=>run('feature')} className="px-1 text-[10px]"><Plus/>Add Feature</Button><Button variant="ghost" size="sm" disabled={!!busy||!signedIn||!project.idea.trim()} onClick={()=>run('suggest')} className="px-1 text-[10px]"><Lightbulb/>Suggest Next</Button></div>
            {!signedIn&&<div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={()=>signIn('google')}>Sign in with Google</Button><Button size="sm" variant="ghost" onClick={()=>signIn('lovable')}>Sign in with Lovable</Button></div>}
            <p className="mt-3 text-[10px] text-muted-foreground">{usage||'AI usage draws from workspace credits. No exact cost estimate is available.'}</p>
          </div>
        </section>
        <section className="code-output flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3"><div className="flex items-center gap-1">{[{label:'Preview',icon:Monitor},{label:'Code',icon:Code2},{label:'3D Viewer',icon:Box}].map(v=><Button key={v.label} variant="ghost" size="sm" onClick={()=>setView(v.label)} className={view===v.label?'bg-accent text-primary':'text-muted-foreground'}><v.icon/>{v.label}</Button>)}</div><div className="flex gap-1"><Button variant="ghost" size="icon" aria-label="Desktop preview" title="Desktop preview" onClick={()=>setPhone(false)} className={!phone?'text-primary':''}><Monitor/></Button><Button variant="ghost" size="icon" aria-label="Phone preview" title="Phone preview" onClick={()=>setPhone(true)} className={phone?'text-primary':''}><Smartphone/></Button><Button variant="ghost" size="icon" aria-label="Reload preview" title="Reload preview" onClick={()=>setPreviewKey(k=>k+1)}><RefreshCw/></Button></div></div>
          <div className="code-canvas flex-1 overflow-hidden">
            {view==='3D Viewer'?<div className="relative h-full min-h-[480px]"><CodeScene kind={build?.scene.kind==='none'?'machine':build?.scene.kind??'machine'}/><p className="absolute bottom-5 left-5 right-5 text-xs text-muted-foreground">Conceptual primitive model · {build?.scene.description||'Mechanical assembly study'} · Not certified CAD</p></div>:view==='Code'?<div className="flex h-full min-h-[500px]"><div className="w-40 shrink-0 border-r border-border p-3"><p className="mb-4 text-[10px] text-muted-foreground">FILE EXPLORER</p>{project.files.map(f=><Button variant="ghost" key={f.path} size="sm" className={`w-full justify-start px-1 text-xs ${filePath===f.path?'text-primary':''}`} onClick={()=>setFilePath(f.path)}><FileCode className="size-3"/><span className="truncate">{f.path}</span></Button>)}</div><div className="min-w-0 flex-1 p-4"><div className="mb-3 flex justify-between gap-3 text-xs text-muted-foreground"><span>{filePath}</span>{selectedFile&&<Button size="icon" variant="ghost" title="Download selected file" aria-label="Download selected file" onClick={()=>download(selectedFile.path,selectedFile.content,'text/plain')}><Download/></Button>}</div><Textarea aria-label="Code editor" value={selectedFile?.content??''} onChange={e=>change({files:project.files.map(f=>f.path===filePath?{...f,content:e.target.value}:f)})} className="h-[580px] resize-none border-none bg-transparent font-mono text-xs leading-relaxed" spellCheck={false}/></div></div>:project.files.length?<div className={`mx-auto h-full min-h-[560px] ${phone?'max-w-[390px]':'w-full'}`}><iframe key={previewKey} ref={frame} title="Live project preview" sandbox="allow-scripts" srcDoc={previewDocument(project.files,true)} className="code-frame h-full min-h-[560px] w-full border-0"/></div>:<div className="code-empty relative flex min-h-[540px] flex-col items-center justify-center px-8 py-16 text-center"><div className="code-outline mb-8 flex size-24 items-center justify-center"><Code2 className="size-10 text-primary"/></div><p className="mb-3 text-[10px] font-semibold text-primary">FROM FIRST IDEA TO FIRST VERSION</p><h2 className="mb-3 text-2xl font-medium">A blank canvas.<br/>Unlimited possibilities.</h2><p className="max-w-xs text-sm leading-relaxed text-muted-foreground">Your next creation starts with an idea.</p><div className="mt-10 flex gap-8 text-xs text-muted-foreground"><span className="flex flex-col items-center gap-2"><Globe className="size-5"/>Websites</span><span className="flex flex-col items-center gap-2"><Box className="size-5"/>Prototypes</span><span className="flex flex-col items-center gap-2"><LayoutTemplate className="size-5"/>Designs</span></div></div>}
          </div>
          <div className="border-t border-border px-5 py-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><p className="flex items-center gap-2 text-xs font-medium"><ShieldCheck className="size-4 text-primary"/>BUILD PIPELINE</p>{project.files.length>0&&<Button size="sm" variant="outline" onClick={()=>{if(!checks.passed||runtimeErrors.length||!loaded){setError('Preview is not ready or checks failed. Fix the reported errors first.');return;}setTested(true);setActivity('Preview test confirmed. Export unlocked; professional review is still required.');}} disabled={!loaded||!checks.passed||runtimeErrors.length>0}><Check/>Confirm preview test</Button>}</div><div className="flex flex-wrap gap-x-4 gap-y-2">{WORKFLOW.map((s,i)=><span key={s} className={`flex items-center gap-1.5 text-[10px] ${i<=stage?'text-primary':'text-muted-foreground'}`}><span className={`flex size-4 items-center justify-center rounded-full border ${i<=stage?'border-primary':'border-border'}`}>{i<stage?<Check className="size-2.5"/>:i+1}</span>{s}</span>)}</div>{runtimeErrors.map((e,i)=><p key={i} className="mt-2 text-xs text-destructive">{e}</p>)}{project.files.length&&!checks.passed?<p className="mt-2 text-xs text-destructive">{checks.errors.join(' · ')}</p>:null}</div>
        </section>
      </div>}
    </div>
  </main>;
}
