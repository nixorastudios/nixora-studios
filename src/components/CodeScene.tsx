import { useEffect, useRef, useState } from 'react';

export function CodeScene({ kind = 'machine' }: { kind?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let dispose = () => {};
    let active = true;
    async function mount() {
      const THREE = await import('three');
      const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
      const host = ref.current;
      if (!host || !active) return;
      try {
        const css = getComputedStyle(host);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, host.clientWidth / Math.max(host.clientHeight,1), 0.1, 100);
        camera.position.set(6, 4, 7);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(host.clientWidth, host.clientHeight);
        host.appendChild(renderer.domElement);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        controls.autoRotateSpeed = 0.5;
        const gold = new THREE.MeshStandardMaterial({ color: css.getPropertyValue('--code-3d-gold').trim(), metalness: 0.7, roughness: 0.3 });
        const wire = new THREE.MeshStandardMaterial({ color: css.getPropertyValue('--code-3d-steel').trim(), metalness: 0.65, roughness: 0.4 });
        const group = new THREE.Group();
        const box = (x:number,y:number,z:number,px:number,py:number,pz:number,material = gold) => { const mesh = new THREE.Mesh(new THREE.BoxGeometry(x,y,z), material); mesh.position.set(px,py,pz); group.add(mesh); };
        if (kind === 'building') {
          box(4,0.15,3,0,-1,0,wire); box(0.12,2,3,-2,0,0); box(0.12,2,3,2,0,0); box(4,2,0.12,0,0,-1.5); box(0.12,1.5,2,0,-0.25,-0.5); box(1.5,0.15,0.8,1,-0.5,0.6,wire);
        } else if (kind === 'car') {
          box(4,0.65,1.8,0,-0.4,0); box(2,0.8,1.6,-0.3,0.25,0,wire);
          for (const x of [-1.3,1.3]) for (const z of [-0.95,0.95]) { const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,0.25,32),wire); wheel.rotation.x=Math.PI/2;wheel.position.set(x,-0.65,z);group.add(wheel); }
        } else {
          const mesh = new THREE.Mesh(kind === 'sculpture' ? new THREE.TorusKnotGeometry(1,0.28,120,16) : new THREE.TorusGeometry(1.15,0.32,24,48),gold);
          group.add(mesh);
          if (kind !== 'sculpture') { box(0.45,0.45,3.5,0,0,0,wire); for(let i=0;i<12;i++){ const tooth=new THREE.Mesh(new THREE.BoxGeometry(0.35,0.4,0.4),gold);const a=i*Math.PI/6;tooth.position.set(Math.cos(a)*1.4,Math.sin(a)*1.4,0);tooth.rotation.z=a;group.add(tooth);} }
        }
        scene.add(group);
        scene.add(new THREE.HemisphereLight(css.getPropertyValue('--code-3d-light').trim(),css.getPropertyValue('--code-3d-floor').trim(),3));
        const light=new THREE.DirectionalLight(css.getPropertyValue('--code-3d-light').trim(),5);light.position.set(4,6,5);scene.add(light);
        const grid=new THREE.GridHelper(14,28,css.getPropertyValue('--code-3d-grid').trim(),css.getPropertyValue('--code-3d-grid').trim());grid.position.y=-1.3;scene.add(grid);
        const observer=new ResizeObserver(()=>{if(!host.clientWidth)return;camera.aspect=host.clientWidth/Math.max(host.clientHeight,1);camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight);});observer.observe(host);
        let frame=0;
        const render=()=>{frame=requestAnimationFrame(render);controls.update();renderer.render(scene,camera);};render();
        dispose=()=>{cancelAnimationFrame(frame);observer.disconnect();controls.dispose();scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();}});gold.dispose();wire.dispose();grid.geometry.dispose();renderer.dispose();renderer.domElement.remove();};
      } catch { setError('3D rendering is unavailable on this device.'); }
    }
    mount();
    return ()=>{active=false;dispose();};
  },[kind]);
  return <div ref={ref} className="code-scene relative h-full min-h-80 w-full" aria-label="Interactive conceptual 3D model">{error && <p className="p-6 text-muted-foreground">{error}</p>}</div>;
}