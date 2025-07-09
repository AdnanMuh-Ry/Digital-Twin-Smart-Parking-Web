import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { initializeSlotInfo } from './detail_slot.js';

export function loadCar(scene, camera, renderer) {
    const loader = new GLTFLoader();
    const dLoader = new DRACOLoader();
    dLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    dLoader.setDecoderConfig({ type: 'js' });
    loader.setDRACOLoader(dLoader);

    const carPositions = [
        // slot depan   
        { x: -15, y: 1.5, z: -5, rotationY: 0.05 }, 
        { x: -11.5, y: 1.5, z: -3.5, rotationY: 0.05 }, 
        { x: -8, y: 1.5, z: -2, rotationY: 0.05 }, 
        { x: -4.3, y: 1.5, z: -1, rotationY: 0.05 },  
        { x: -1, y: 1.5, z: 0.3, rotationY: 0.05 },
        { x: 3.3, y: 1.5, z: 0, rotationY: 0.05 },
        { x: 6.5, y: 1.5, z: 1.5, rotationY: 0.05 },
        { x: 9.9, y: 1.5, z: 3, rotationY: 0.05 },
        { x: 13.5, y: 1.5, z: 4.5, rotationY: 0.05},

        // slot belakang
        { x: -19.5, y: 1.5, z: 15.5, rotationY: 0.2 },
        { x: -16, y: 1.5, z: 16.5, rotationY: 0.2 },
        { x: -12.5, y: 1.5, z: 17, rotationY: 0.2 },
        { x: -8.9, y: 1.5, z: 17.5, rotationY: 0.2 },
        { x: -5.3, y: 1.5, z: 18.3, rotationY: 0.2 },
        { x: -1.5, y: 1.5, z: 19, rotationY: 0.2 },
        { x: 2, y: 1.5, z: 20, rotationY: 0.2 },
        { x: 5.5, y: 1.5, z: 20.5, rotationY: 0.2 },
        { x: 9.3, y: 1.5, z: 21, rotationY: 0.2 },
        { x: 13, y: 1.5, z: 21.7, rotationY: 0.2 },
        { x: 16.5, y: 1.5, z: 23, rotationY: 0.2 }
    ];

    const baseRotation = 2.7;
    const cars = [];

    loader.load('../assets/mobilMustang.glb', function(glb) {
        const carModel = glb.scene;

        carPositions.forEach((position, index) => {
            const slotNumber = `Slot ${index + 1}`;
            const spriteGroup = createLabeledSprite(slotNumber, 'red', 'white'); // Awal warna merah
            spriteGroup.position.set(position.x, position.y + 2, position.z);
            scene.add(spriteGroup);
            cars.push({ car: null, spriteGroup: spriteGroup, slot: 'slot_' + (index + 1) });
        });

        // Pantau perubahan di Firebase
        const db = firebase.database();
        db.ref('slot_parking').on('value', (snapshot) => {
            const slots = snapshot.val();
            cars.forEach((obj, index) => {
                const slotStatus = slots[obj.slot];
                const spriteGroup = obj.spriteGroup.children[0];
                if (slotStatus) {
                    if (!obj.car) {
                        const clonedCar = SkeletonUtils.clone(carModel);
                        clonedCar.position.set(carPositions[index].x, carPositions[index].y, carPositions[index].z);
                        clonedCar.rotation.y = baseRotation + (carPositions[index].rotationY || 0);
                        scene.add(clonedCar);
                        obj.car = clonedCar;
                        updateSpriteBackground(spriteGroup, 'green', 'white');
                    }
                } else {
                    if (obj.car) {
                        scene.remove(obj.car);
                        obj.car = null;
                        updateSpriteBackground(spriteGroup, 'red', 'white');
                    }
                }
            });
        });

        // Tangani klik pada elemen
        renderer.domElement.addEventListener('click', function(event) {
            const mouse = new THREE.Vector2();
            const raycaster = new THREE.Raycaster();

            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
            
            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObjects(cars.map(obj => obj.spriteGroup.children[0]));
            
            if (intersects.length > 0) {
                const intersectedObject = intersects[0].object;
                cars.forEach((obj) => { 
                    if (obj.spriteGroup.children[0] === intersectedObject && obj.car) {
                        updateFirebaseSlotStatus(obj.slot, false);
                    }
                });
            }
        });
    });

    function createLabeledSprite(text, bgColor, textColor) {
        const group = new THREE.Group();
    
        const canvas = document.createElement('canvas');
        canvas.width = 256; 
        canvas.height = 64; 
        const context = canvas.getContext('2d');
    
        canvas.dataset.text = text;
    
        context.fillStyle = bgColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
    
        context.font = 'Bold 30px Arial'; 
        context.fillStyle = textColor;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);
    
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(2, 0.5, 2);

        sprite.position.set(0.25, 0.5, 0);
        sprite.position.y = 0.5;
    
        // Buat panah
        const arrowShape = new THREE.Shape();
        arrowShape.moveTo(0, 0);
        arrowShape.lineTo(-0.25, -0.35);
        arrowShape.lineTo(0.25, -0.35);
        arrowShape.lineTo(0, 0);
    
        const arrowGeometry = new THREE.ShapeGeometry(arrowShape);
        const arrowMaterial = new THREE.MeshBasicMaterial({ color: bgColor });
        const arrowMesh = new THREE.Mesh(arrowGeometry, arrowMaterial);
        arrowMesh.position.set(0, 0.3, 0,);
        arrowMesh.rotation.z = Math.PI / 2.9;
    
        group.add(sprite);
        group.add(arrowMesh);
    
        return group;
    }
    

    function updateSpriteBackground(sprite, bgColor, textColor) {
        const canvas = sprite.material.map.image;
        const context = canvas.getContext('2d');
    
        const text = sprite.material.map.image.text || sprite.material.map.image.dataset.text;
    
        context.clearRect(0, 0, canvas.width, canvas.height);
    
        context.fillStyle = bgColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
    
        context.font = 'Bold 30px Arial'; 
        context.fillStyle = textColor;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);
    
        sprite.material.map.needsUpdate = true;
    }
    
    initializeSlotInfo();
    
    function updateFirebaseSlotStatus(slot, status) {
        const db = firebase.database();
        db.ref('slot_parking/' + slot).set(status);
    }
}
