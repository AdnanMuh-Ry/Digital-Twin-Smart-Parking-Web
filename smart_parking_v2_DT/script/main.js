import * as THREE from 'three';
import * as YUKA from 'yuka';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { loadCar } from './constanta.js';


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x94D8FB);

const camera = new THREE.PerspectiveCamera(
    20,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(3, 40, 150);
camera.lookAt(scene.position);

const ambientLight = new THREE.AmbientLight(0x404040, 1.2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(10, 10, 10).normalize();
directionalLight.castShadow = true;
scene.add(directionalLight);

const additionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
additionalLight.position.set(-10, -10, 10).normalize();
scene.add(additionalLight);

// renderer.outputEncoding = THREE.sRGBEncoding; 


const loader = new GLTFLoader();
const dLoader = new DRACOLoader();
dLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
dLoader.setDecoderConfig({ type: 'js' });
loader.setDRACOLoader(dLoader);

loader.load('../assets/uji8.glb', function(glb) {
    const model = glb.scene;
    model.position.set(2.8, -70, -38.5);
    model.rotation.y = Math.PI;
    scene.add(model);
    loadCar(scene, camera, renderer);
}, undefined, function(error) {
    console.error('Terjadi kesalahan saat memuat model SmartParking:', error);
});

const controls = new OrbitControls(camera, renderer.domElement);
// controls.minDistance = 25;
controls.minDistance = 0;
//controls.maxDistance = 85;
controls.maxDistance = Infinity;
controls.maxPolarAngle = Math.PI / 2.2;
controls.minPolarAngle = Math.PI / 4;
controls.enableRotate = true;
controls.enableZoom = true;
controls.enablePan = true;

function animate() {
    renderer.render(scene, camera);
    controls.update();
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


