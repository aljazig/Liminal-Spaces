import { ResizeSystem } from './ResizeSystem.js';
import { UpdateSystem } from './UpdateSystem.js';
import { GLTFLoader } from './GLTFLoader.js';
import { OBJLoader } from './OBJLoader.js';
import { FirstPersonController } from './FirstPersonController.js';
import { RotateAnimator } from './RotateAnimator.js';
import { LinearAnimator } from './LinearAnimator.js';

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
            //translation: [-8, 3, 32],
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
//const soba = loader.loadScene(loader.defaultScene);
const soba = (() => {
    const soba = new Node();
    soba.addChild(loader.loadNode("Cube.001"));
    soba.addChild(loader.loadNode("Cube.002"));
    soba.addChild(loader.loadNode("Cube.003"));
    soba.addChild(loader.loadNode("Cube.004"));
    soba.addChild(loader.loadNode("Cube.005"));
    soba.addChild(loader.loadNode("Sphere.001"));
    soba.addChild(loader.loadNode("Sphere.002"));
    soba.addChild(loader.loadNode("Sphere.003"));
    soba.addChild(loader.loadNode("Sphere.004"));
    soba.addChild(loader.loadNode("box"));
    soba.addChild(loader.loadNode("buttons"));
    soba.addChild(loader.loadNode("screen"));
    return soba;
})();
soba.addComponent(new Transform({
    translation: [60, 1.42, -52],
    rotation: quat.fromEuler([0, 0, 0, 1], 0, -90, 0),
}))
scene.addChild(soba);

// Make all the donuts:
async function createDonut() {
    await loader.load("Models/donut/donut_popravljen.gltf");
    const donut = new Node();
    donut.addChild(loader.loadNode("donut"));
    donut.addChild(loader.loadNode("icing"));
    donut.addChild(loader.loadNode("sprinkle"));
    donut.addChild(loader.loadNode("sprinkle.001"));
    donut.addChild(loader.loadNode("sprinkle.002"));
    donut.addChild(loader.loadNode("sprinkle.003"));
    donut.addChild(loader.loadNode("sprinkle.004"));
    donut.addChild(loader.loadNode("sprinkle.005"));
    donut.addChild(loader.loadNode("sprinkle.006"));
    donut.addChild(loader.loadNode("sprinkle.007"));
    donut.aabb = {
        min: [-0.05, -0.1, -0.05],
        max: [0.05, 2, 0.05],
    };
    donut.isTrigger = true;
    donut.addComponent(new Trigger({
        functionality: "donut",
    }));
    return donut;
}
const donut = await createDonut();
donut.addComponent(new Transform({
    translation: [3, 2, -2],
    scale: [4, 4, 4],
}));
scene.addChild(donut);
const donut2 = await createDonut();
donut2.addComponent(new Transform({
    translation: [3, 2, -10],
    scale: [4, 4, 4],
}));
scene.addChild(donut2);
const donut3 = await createDonut();
donut3.addComponent(new Transform({
    translation: [18, 2, -21],
    scale: [4, 4, 4],
}));
scene.addChild(donut3);
const donut4 = await createDonut();
donut4.addComponent(new Transform({
    translation: [-17.5, 2, -2.5],
    scale: [4, 4, 4],
}));
scene.addChild(donut4);
const donut5 = await createDonut();
donut5.addComponent(new Transform({
    translation: [-2.5, 2, -35],
    scale: [4, 4, 4],
}));
scene.addChild(donut5);
const donut6 = await createDonut();
donut6.addComponent(new Transform({
    translation: [42, 2, 27.5],
    scale: [4, 4, 4],
}));
scene.addChild(donut6);
const donut7 = await createDonut();
donut7.addComponent(new Transform({
    translation: [54, 2, -8.5],
    scale: [4, 4, 4],
}));
scene.addChild(donut7);

// Make a monster:
await loader.load("Models/posastGLTF/Posast1.gltf");
const monster = (() => {
    let monster = new Node();
    monster.addChild(loader.loadNode("blago"));
    monster.addChild(loader.loadNode("eye"));
    monster.addChild(loader.loadNode("eye.002"));
    monster.addChild(loader.loadNode("glava"));
    return monster;
})();
monster.addComponent(new Transform({
    rotation: quat.fromEuler([0, 0, 0, 1], 0, -90, 0),
    translation: [18, 3, -29],
    scale: [0.2, 0.2, 0.2],
}));
monster.addComponent(new LinearAnimator(monster, {
    startPosition: [0, 0, 0],
    endPosition: camera.getComponentOfType(Transform).translation,
    duration: 0.5
}));
monster.getComponentOfType(LinearAnimator).pause();
monster.addComponent(new Trigger({
    functionality: "monsterKill",
}));
monster.isTrigger = true;
monster.aabb = {
    min: [-0.5, -1, -0.5],
    max: [0.5, 1, 0.5],
}
scene.addChild(monster);

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

// Create trigger colliders:
const trigger1 = new Node();
trigger1.addComponent(new Transform({
    translation: [3, 3, 5.3],
}));
trigger1.addComponent(new Trigger({
    functionality: "move",
    translation: [0, 0, -0.65],
}));
trigger1.aabb = {
    min: [-1, -1, -0.01],
    max: [2, 1, 0.01],
};
trigger1.isTrigger = true;
scene.addChild(trigger1);

const trigger2 = new Node();
trigger2.addComponent(new Transform({
    translation: [-8, 3, 34],
}));
trigger2.addComponent(new Trigger({
    functionality: "move, rotate",
    translation: [-4, 0, -6],
    rotation: [90 * (Math.PI / 180), 0],
}));
trigger2.aabb = {
    min: [-2, -1, -0.01],
    max: [2, 1, 0.01],
};
trigger2.isTrigger = true;
scene.addChild(trigger2);

const monsterTrigger = new Node();
monsterTrigger.addComponent(new Transform({
    translation: [18, 3, -17],
}));
monsterTrigger.addComponent(new Trigger({
    functionality: "monsterAttack",
    monster: monster,
}));
monsterTrigger.aabb = {
    min: [-0.5, -1, -0.01],
    max: [0.5, 1, 0.01],
};
monsterTrigger.isTrigger = true;
scene.addChild(monsterTrigger);

const exitTrigger = new Node();
exitTrigger.addComponent(new Transform({
    translation: [-21, 3, 2.5],
}))

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