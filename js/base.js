import * as THREE from '../vendor/three/three.module.js';

export function makeRenderer(mount){
  if(!mount){ console.error('#three not found'); return null; }
  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.setClearAlpha(0);
  mount.appendChild(renderer.domElement);
  return renderer;
}

export function makeCamera(mount){
  const camera = new THREE.PerspectiveCamera(55, 1, 0.01, 5000);
  resizeCamera(mount, camera);
  return camera;
}

export function resizeCamera(mount, camera, renderer){
  const w = mount.clientWidth, h = mount.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  if(renderer) renderer.setSize(w, h);
}

export function starField(count=6000, radius=800, size=0.08, opacity=0.8){
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count*3);
  for(let i=0;i<count;i++){
    const r = radius*Math.cbrt(Math.random());
    const t = Math.random()*Math.PI*2;
    const p = Math.acos(2*Math.random()-1);
    pos[i*3]   = r*Math.sin(p)*Math.cos(t);
    pos[i*3+1] = r*Math.sin(p)*Math.sin(t);
    pos[i*3+2] = r*Math.cos(p);
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  const mat = new THREE.PointsMaterial({ size, sizeAttenuation:true, transparent:true, opacity, color:0xffffff });
  return new THREE.Points(geo,mat);
}

export { THREE };
