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

import { Renderer } from './Renderer.js';
import { Light } from './Light.js';

// define canvas
const canvas = document.querySelector('canvas');
const renderer = new Renderer(canvas);
await renderer.initialize();

const objloader = new OBJLoader();
// get mesh from .obj
const mesh = await objloader.loadMesh('../Models/Robik.obj');

// define image for texture
const imageBitmap = await fetch('../Textures/ground.jpg')
    .then(response => response.blob())
    .then(blob => createImageBitmap(blob));

// create new material for model
const material = new Material({
    baseTexture: new Texture({
        image : imageBitmap,
        sampler : new Sampler(),
    })
});

// define new model
const cubeModel = new Node();
cubeModel.addComponent(new Transform({translation: [-1, 0, 0]}));
cubeModel.addComponent(new Model({
    primitives: [
        {material, mesh,},
    ]
}));

// define new camera
const camera = new Node()
camera.addComponent(new Transform({translation: [0, 10, 20]}));
camera.addComponent(new Camera());
camera.addComponent(new FirstPersonController(camera, document.body));

// define new light
const light = new Node();
light.addComponent(new Transform({
    translation: [0, 3, 0],
}));
light.addComponent(new Light());

// add all nodes to scene.
const scene = new Node()
scene.addChild(cubeModel);
scene.addChild(camera);
scene.addChild(light);

function update(time, dt) {
    scene.traverse(node => {
        for (const component of node.components) {
            component.update?.(time, dt);
        }
    });
}

function render() {
    renderer.render(scene, camera);
}

function resize({ displaySize: {width, height} }) {
    camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start()