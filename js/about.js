import * as THREE from '../vendor/three/three.module.js';

const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 1000);
cam.position.set(0,0,20);

const renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true });
renderer.setSize(innerWidth, innerHeight);
document.getElementById("three").appendChild(renderer.domElement);

const geo = new THREE.IcosahedronGeometry(5, 2);
const mat = new THREE.MeshBasicMaterial({ wireframe:true, color:0x82dfff });
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

function animate(){
  mesh.rotation.x += 0.003;
  mesh.rotation.y += 0.002;
  renderer.render(scene, cam);
  requestAnimationFrame(animate);
}
animate();
