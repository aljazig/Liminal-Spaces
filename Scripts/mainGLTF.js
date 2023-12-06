import { ResizeSystem } from './ResizeSystem.js';
import { UpdateSystem } from './UpdateSystem.js';
import { GLTFLoader } from './GLTFLoader.js';
import { FirstPersonController } from './FirstPersonController.js';
import { RotateAnimator } from './RotateAnimator.js';

import { 
    Camera,
    Node,
    Model,
    Transform,
    Material,
    Texture,
    Sampler,
} from './core.js';

import {
    calculateAxisAlignedBoundingBox,
    mergeAxisAlignedBoundingBoxes,
} from './core/MeshUtils.js';

import { Renderer } from './Renderer.js';
import { Light } from './Light.js';
import { quat, vec4 } from './gl-matrix-module.js';
import { Physics } from './Physics.js';

// define canvas
const canvas = document.querySelector('canvas');
const renderer = new Renderer(canvas);
await renderer.initialize();

const loader = new GLTFLoader();
// Load gltf file:
await loader.load('Models/test1.gltf');

// Get scene:
const scene = loader.loadScene(loader.defaultScene);

// Get camera from scene:
const camera = loader.loadNode('Camera');
camera.addComponent(new Camera());
camera.addComponent(new FirstPersonController(camera, document.body));
camera.isDynamic = true;
camera.aabb = {
    min: [-0.2, -0.2, -0.2],
    max: [0.2, 0.2, 0.2],
};

// define imageBitmap for texture
const imageBitmap = await fetch('Textures/metal_texture.jpg')
.then(response => response.blob())
.then(blob => createImageBitmap(blob));

// Get objects in scene:
const texture = new Texture({
    image : imageBitmap,
    sampler : new Sampler(),
});
scene.traverse(node => {
    const obj = node.getComponentOfType(Model);
    if (!obj) {
        return;
    }
    obj.primitives[0].material.baseTexture = texture;
    obj.isStatic = true;
});

// Get light in scene:
const light1 = loader.loadNode('Light');
light1.addComponent(new Light({
    ambient: 10,
}));

const physics = new Physics(scene);
scene.traverse(node => {
    const model = node.getComponentOfType(Model);
    if (!model) {
        return;
    }

    const boundingBoxes = model.primitives.map(primitive => calculateAxisAlignedBoundingBox(primitive.mesh));
    node.aabb = mergeAxisAlignedBoundingBoxes(boundingBoxes);
});

function update(time, dt) {
    scene.traverse(node => {
        for (const component of node.components) {
            component.update?.(time, dt);
        }
    });

    physics.update(time, dt);
}

function render() {
    renderer.render(scene, camera);
}

function resize({ displaySize: {width, height} }) {
    camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start()