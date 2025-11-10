import * as THREE from '../vendor/three/three.module.js';

const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 1000);
cam.position.z = 22;

const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
renderer.setSize(innerWidth, innerHeight);
document.getElementById("three").appendChild(renderer.domElement);

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(6, 64, 64),
  new THREE.MeshStandardMaterial({
    color:0x77ffcc,
    roughness:0.1,
    metalness:0.4,
    emissive:0x44ffaa,
    emissiveIntensity:0.4
  })
);
scene.add(sphere);

const rim = new THREE.Mesh(
  new THREE.TorusGeometry(10,0.15, 16, 100),
  new THREE.MeshBasicMaterial({ color:0x88ffee })
);
rim.rotation.x = 1.57;
scene.add(rim);

const light = new THREE.PointLight(0xffffff, 1.5);
light.position.set(0,8,10);
scene.add(light);

function animate(){
  sphere.rotation.y += 0.003;
  renderer.render(scene, cam);
  requestAnimationFrame(animate);
}
animate();
