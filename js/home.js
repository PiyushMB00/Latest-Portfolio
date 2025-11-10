import * as THREE from '../vendor/three/three.module.js';

const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 1000);
cam.position.set(0,0,18);

const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
renderer.setSize(innerWidth, innerHeight);
document.getElementById("three").appendChild(renderer.domElement);

// Wire planet
const geo = new THREE.IcosahedronGeometry(6, 1);
const mat = new THREE.MeshBasicMaterial({ color:0x70e8ff, wireframe:true });
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

function animate(){
  mesh.rotation.y += 0.002;
  renderer.render(scene, cam);
  requestAnimationFrame(animate);
}
animate();
