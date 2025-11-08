import * as THREE from './vendor/three/three.module.js';
import { OrbitControls } from './vendor/three/examples/jsm/controls/OrbitControls.js';

const mount = document.getElementById('three');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, 1, 0.01, 5000);
const CAMERA_HOME = new THREE.Vector3(0, 6, 30);
camera.position.copy(CAMERA_HOME);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(mount.clientWidth, mount.clientHeight);
renderer.setClearAlpha(0);
mount.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableDamping = true;
controls.enableKeys = false;
controls.minDistance = 6;
controls.maxDistance = 200;

const ambient = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambient);
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(20, 30, 15);
scene.add(dir);

const group = new THREE.Group();
scene.add(group);

function roundedRectPath(ctx, x, y, w, h, r) {
  r = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function makeLabel(text) {
  const pad = 24; const font = 48; const family = 'ui-sans-serif, system-ui, Segoe UI, Roboto, Arial';
  const measureCanvas = document.createElement('canvas');
  const mctx = measureCanvas.getContext('2d');
  mctx.font = `${font}px ${family}`;
  const w = Math.ceil(mctx.measureText(text).width + pad * 2);
  const h = font + pad * 2;

  const canvas = document.createElement('canvas');
  canvas.width = w * 2; canvas.height = h * 2;
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);
  ctx.font = `${font}px ${family}`;
  ctx.fillStyle = 'rgba(10,15,28,0.72)';
  ctx.strokeStyle = 'rgba(191,248,255,0.35)';
  ctx.lineWidth = 2;
  roundedRectPath(ctx, 1, 1, w-2, h-2, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ccfbf1';
  ctx.fillText(text, pad, pad + font * 0.8);

  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthWrite: false }));
  sp.scale.set(w/120, h/120, 1);
  sp.position.set(0, 1.8, 0);
  return sp;
}

function makePlanet({ key, name, pos, color = 0x9ad7e0, ring = false, radius = 2.3, ringRadius}) {
  const geo = new THREE.SphereGeometry(radius, 64, 64);
  const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.15, roughness: 0.35, emissive: color, emissiveIntensity: 0.12 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(pos);
  mesh.userData.type = 'planet';
  mesh.userData.name = name;
  mesh.userData.key = key;

  if (ring) {
      const r = new THREE.Mesh(
      new THREE.TorusGeometry(ringRadius ?? radius * 2, 0.3, 16, 360),
      new THREE.MeshStandardMaterial({ color: 0xe7fdff, emissive: 0xe7fdff, emissiveIntensity: 0.35, metalness: 0.8, roughness: 0.2 })
    );
    r.rotation.x = Math.PI / 2.2;
    mesh.add(r);
  }

  mesh.add(makeLabel(name));
  group.add(mesh);
  selectables.push(mesh);
  return mesh;
}

const selectables = [];
const PLANETS = [
  { key: 'home', name: 'Home', pos: new THREE.Vector3(-45, 6, -70), ring: false,  color: 0xccbc3e3, radius: 4.5 },
  { key: 'about', name: 'About', pos: new THREE.Vector3(58, 4, -37), ring: true, color: 0xcfde992, radius: 5, ringRadius: 7.0 },
  { key: 'projects', name: 'Projects', pos: new THREE.Vector3(-50, 2, 55), ring: true, color: 0xcd3d3d3, radius: 2.8, ringRadius: 4.8 },
  { key: 'contact', name: 'Contact', pos: new THREE.Vector3(65, -2, 42), ring: false, color: 0xcfbbf77, radius: 4 },
];

const planetMeshes = {};
PLANETS.forEach(p => { planetMeshes[p.key] = makePlanet(p); });

function makeStars(count, radius, size, opacity) {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = radius * Math.cbrt(Math.random());
    const t = Math.random() * Math.PI * 2;
    const p = Math.acos(2 * Math.random() - 1);
    positions[i*3] = r * Math.sin(p) * Math.cos(t);
    positions[i*3+1] = r * Math.sin(p) * Math.sin(t);
    positions[i*3+2] = r * Math.cos(p);
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ size, sizeAttenuation: true, transparent: true, opacity, color: 0xffffff });
  return new THREE.Points(geo, mat);
}
scene.add(makeStars(10000, 600, 0.12, 0.9));
scene.add(makeStars(6000, 600, 0.08, 0.6));

function makeMeteor() {
  const trailLen = 160;
  const trailPositions = new Float32Array(trailLen * 3);
  const trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
  const trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }));
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  const g = new THREE.Group(); g.add(trail); g.add(core);
  resetMeteor(g, trailPositions);
  return { g, trailPositions, trailLen };
}
function resetMeteor(g, arr) {
  const angle = Math.random() * Math.PI * 2;
  const dist = 700;
  g.position.set(Math.cos(angle) * dist, (Math.random() - 0.5) * 160, Math.sin(angle) * dist);
  const target = new THREE.Vector3((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 200);
  g.userData.v = target.clone().sub(g.position).normalize().multiplyScalar(60 + Math.random() * 40);
  for (let i = 0; i < arr.length; i++) arr[i] = g.position.toArray()[i % 3];
}
const meteors = Array.from({ length: 12 }, () => makeMeteor());
meteors.forEach(m => scene.add(m.g));

const panel = document.getElementById('panel');
const panelTitle = document.getElementById('panel-title');
const panelBody = document.getElementById('panel-content');
const closeBtn = document.getElementById('close-panel');
if (closeBtn) closeBtn.addEventListener('click', exitPlanet);
window.addEventListener('keydown', e => { if (e.key === 'Escape') exitPlanet(); });

let activeKey = null;

function setPlanetsVisibility(onlyKey) {
  selectables.forEach(obj => {
    const isActive = obj.userData.key === onlyKey;
    obj.visible = onlyKey ? isActive : true;
  });
}

function enterPlanet(key) {
  if (!planetMeshes[key]) return;
  activeKey = key;
  controls.enabled = false;
  setPlanetsVisibility(key);
  const target = planetMeshes[key].position.clone();
  const toPos = target.clone().add(new THREE.Vector3(0, 0.4, 3.6));
  tweenCamera({ toPos, toLook: target, ms: 1000, onDone: () => {
    window.location.href = `${key}.html`;
  }});
}

function exitPlanet() {
  if (!activeKey) return;
  activeKey = null;
  hidePanel();
  setPlanetsVisibility(null);
  tweenCamera({ toPos: CAMERA_HOME, toLook: new THREE.Vector3(0,0,0), ms: 900, onDone: () => { controls.enabled = true; } });
}

function tweenCamera({ toPos, toLook, ms = 800, onDone }) {
  const fromPos = camera.position.clone();
  const fromLook = new THREE.Vector3();
  camera.getWorldDirection(fromLook);
  const lookPoint = camera.position.clone().add(fromLook);
  let t = 0; const dur = Math.max(1, ms);
  function easeInOut(x){ return x<0.5 ? 2*x*x : 1 - Math.pow(-2*x + 2, 2)/2; }
  function step() {
    t += 16; const k = Math.min(1, t/dur); const e = easeInOut(k);
    camera.position.lerpVectors(fromPos, toPos, e);
    const curLook = new THREE.Vector3().lerpVectors(lookPoint, toLook, e);
    camera.lookAt(curLook);
    if (k < 1) requestAnimationFrame(step); else onDone && onDone();
  }
  requestAnimationFrame(step);
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('pointermove', (e) => {
  const rect = mount.getBoundingClientRect();
  mouse.x = (e.clientX - rect.left) / rect.width * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height * 2 - 1);
});
window.addEventListener('click', () => {
  if (activeKey) return;
  raycaster.setFromCamera(mouse, camera);
  const hit = raycaster.intersectObjects(selectables, false)[0];
  if (hit && hit.object.userData.type === 'planet') enterPlanet(hit.object.userData.key);
});

const keys = { w:false, a:false, s:false, d:false, q:false, e:false };
window.addEventListener('keydown', e => { if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup',   e => { if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = false; });

function onResize() {
  const { clientWidth, clientHeight } = mount;
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(clientWidth, clientHeight);
}
window.addEventListener('resize', onResize);
onResize();

let last = performance.now();
function animate(now) {
  const dt = Math.min(0.033, (now - last) / 1000); last = now;
  group.rotation.y += dt * 0.02;

  if (!activeKey) {
    const dirVec = new THREE.Vector3();
    camera.getWorldDirection(dirVec);
    dirVec.y = 0; dirVec.normalize();
    const right = new THREE.Vector3().crossVectors(dirVec, new THREE.Vector3(0,1,0)).normalize();
    const speed = (keys.shiftKey ? 50 : 20) * dt; // hold Shift for faster
    if (keys.w) camera.position.addScaledVector(dirVec,  speed);
    if (keys.s) camera.position.addScaledVector(dirVec, -speed);
    if (keys.a) camera.position.addScaledVector(right,  -speed);
    if (keys.d) camera.position.addScaledVector(right,   speed);
    if (keys.q) camera.position.y -= speed;
    if (keys.e) camera.position.y += speed;
  }

  controls.update();

  meteors.forEach(m => {
    const v = m.g.userData.v; if (!v) return;
    const step = dt;
    m.g.position.x += v.x * step; m.g.position.y += v.y * step; m.g.position.z += v.z * step;
    const arr = m.trailPositions; const L = m.trailLen;
    for (let i = L - 1; i > 0; i--) {
      arr[i*3] = arr[(i-1)*3];
      arr[i*3+1] = arr[(i-1)*3+1];
      arr[i*3+2] = arr[(i-1)*3+2];
    }
    arr[0] = m.g.position.x; arr[1] = m.g.position.y; arr[2] = m.g.position.z;
    m.g.children[0].geometry.attributes.position.needsUpdate = true;
    if (m.g.position.length() > 700) resetMeteor(m.g, m.trailPositions);
  });

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
