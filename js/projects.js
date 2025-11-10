import * as THREE from '../vendor/three/three.module.js';

const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 1000);
cam.position.set(0,0,18);

const renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true });
renderer.setSize(innerWidth, innerHeight);
document.getElementById("three").appendChild(renderer.domElement);

const colors = [0x8b78ff, 0x5fc1a6, 0x4a68a2];
const meshes = [];

for (let i=0;i<3;i++){
  const box = new THREE.BoxGeometry(3,3,3);
  const mat = new THREE.MeshStandardMaterial({ color:colors[i], roughness:0.3, metalness:0.2 });
  const m = new THREE.Mesh(box, mat);
  m.position.x = (i - 1) * 6;
  meshes.push(m);
  scene.add(m);
}

const light = new THREE.PointLight(0xffffff, 1.2); 
scene.add(light);

function animate(){
  meshes.forEach(m => m.rotation.x += 0.01);
  meshes.forEach(m => m.rotation.y += 0.014);
  renderer.render(scene, cam);
  requestAnimationFrame(animate);
}
animate();
