import { ResizeSystem } from './ResizeSystem.js';
import { UpdateSystem } from './UpdateSystem.js';
import { OBJLoader } from './OBJLoader.js';
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

const objloader = new OBJLoader();
// get mesh from .obj
const meshes = await objloader.loadMesh('Models/LabirintFR.obj');
const labyrinth = new Node();

// define image for texture
const imageBitmap = await fetch('Textures/metal_texture.jpg')
.then(response => response.blob())
.then(blob => createImageBitmap(blob));

// create new material for model
const material = new Material({
    baseTexture: new Texture({
        image : imageBitmap,
        sampler : new Sampler(),
    })
});

for (let m = 0; m < meshes.length; m++) {
    const mesh = meshes[m];

    // define new model
    const cubeModel = new Node();
    cubeModel.addComponent(new Model({
        primitives: [
            {material, mesh,},
        ]
    }));
    cubeModel.isStatic = true;
    labyrinth.addChild(cubeModel);
}
labyrinth.addComponent(new Transform({
    rotation: quat.fromEuler([0, 0, 0, 1], 90, 0, 0), 
    translation: [0, 12, 0]
}));

// define new camera
const camera = new Node()
camera.addComponent(new Transform({
    //translation: [-60, 10.6, 53],
    translation: [-39, 10.5, 59],
}));
camera.addComponent(new Camera());
camera.addComponent(new FirstPersonController(camera, document.body, {
    yaw: 4.5,
}));
camera.isDynamic = true;
camera.aabb = {
    min: [-0.5, -0.5, -0.5],
    max: [0.5, 0.5, 0.5],
};

// define new light
const light = new Node();
light.addComponent(new Transform({
    translation: [-39, 10.5, 59],
}));
light.addComponent(new Light({
    ambient: 10 ,
}));

// add all nodes to scene.
const scene = new Node()
scene.addChild(labyrinth);
scene.addChild(camera);
scene.addChild(light);

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