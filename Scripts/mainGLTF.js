import { ResizeSystem } from './ResizeSystem.js';
import { UpdateSystem } from './UpdateSystem.js';
import { GLTFLoader } from './GLTFLoader.js';
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
    Trigger,
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
await loader.load('Models/glTF separate 3/LAbirintMain.gltf');

// Get scene:
const scene = loader.loadScene(loader.defaultScene);

// Get camera from scene:
const camera = (() => {
    if (!loader.loadNode('Camera')) {
        const camera = new Node();
        camera.addComponent(new Transform({
            translation: [3, 3, 0],
            rotation: quat.fromEuler([0, 0, 0, 1], 0, 30, 30),
        }));
        scene.addChild(camera);
        return camera;
    } else {
        return loader.loadNode('Camera');
    }
})();
camera.addComponent(new Camera({
    near: 0.01,
}));
camera.addComponent(new FirstPersonController(camera, document.body, {
    maxSpeed: 20,
}));
camera.isDynamic = true;
camera.aabb = {
    min: [-0.2, -0.2, -0.2],
    max: [0.2, 0.2, 0.2],
};

// Make a room:
await loader.load("Models/soba/soba.gltf");
const soba = loader.loadScene(loader.defaultScene);
soba.addComponent(new Transform({
    translation: [60, 1.42, -52],
    rotation: quat.fromEuler([0, 0, 0, 1], 0, -90, 0),
}))
scene.addChild(soba);

// Make a donut:
await loader.load("Models/donut/donut.gltf");
const donutScene = loader.loadScene(loader.defaultScene);
const donut = (() => {
    let donut = new Node();
    donut.addChild(loader.loadNode("donut"));
    donut.addChild(loader.loadNode("icing"));
    donut.addChild(loader.loadNode("sprinkle"));
    donut.addChild(loader.loadNode("sprinkle.001"));
    donut.addChild(loader.loadNode("sprinkle.002"));
    donut.addChild(loader.loadNode("sprinkle.003"));
    donut.addChild(loader.loadNode("sprinkle.004"));
    return donut;
})();
donut.addComponent(new Transform({
    //rotation: quat.fromEuler([0, 0, 0, 1], 40, 0, 0),
    translation: [3, 2, -5],
    scale: [4, 4, 4],
}));
scene.addChild(donut);

// define imageBitmap for texture
const imageBitmap = await fetch('Textures/grey.jpg')
.then(response => response.blob())
.then(blob => createImageBitmap(blob));

// Make base texture:
const texture = new Texture({
    image : imageBitmap,
    sampler : new Sampler(),
});

// Make base material:
const mat = new Material({
    baseTexture : texture,
    normalTexture: texture,
})

// Check every model for material and texture:
scene.traverse(node => {
    const obj = node.getComponentOfType(Model);
    if (!obj) {
        return;
    }
    if (!obj.primitives[0].material) {
        obj.primitives[0].material = mat;
    }
    else if (!obj.primitives[0].material.baseTexture) {
        obj.primitives[0].material.baseTexture = texture;
    }
    else if (!obj.primitives[0].material.baseTexture.sampler) {
        obj.primitives[0].material.baseTexture.sampler = new Sampler();
    }

    if (!obj.primitives[0].material.normalTexture) {
        obj.primitives[0].material.normalTexture = texture;
    }
    else if (!obj.primitives[0].material.normalTexture.sampler) {
        obj.primitives[0].material.normalTexture.sampler = new Sampler();
    }

    node.isStatic = true;
});

// Get light in scene:
const light1 = new Node();
light1.addComponent(new Transform({
    translation: camera.components[0].translation,
}));
light1.addComponent(new Light({
    ambient: 10,
}));
scene.addChild(light1);

// Create trigger:
const trigger = new Node();
trigger.addComponent(new Transform({
    translation: [3, 3, 5.3],
}));
trigger.addComponent(new Trigger({
    functionality: "move",
    translation: [0, 0, -0.65],
}));
trigger.aabb = {
    min: [-2, -1, -0.01],
    max: [2, 1, 0.01],
};
trigger.isTrigger = true;
scene.addChild(trigger);

// Enable physics (add a bounding box on every object):
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