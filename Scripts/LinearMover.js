import { Transform } from './core.js';

import { vec3 } from './gl-matrix-module.js';

export class LinearMover {

    constructor(node, {
        startPosition = [0, 0, 0],
        endPosition = [0, 0, 0],
        vel = [0, 0, 0],
    } = {}) {
        this.node = node;

        this.startPosition = startPosition;
        this.endPosition = endPosition;

        this.vel = vel;

        this.playing = true;
    }

    play() {
        this.playing = true;
    }

    pause() {
        this.playing = false;
    }

    update(t, dt) {
        if (!this.playing) {
            return;
        }

        //const linearInterpolation = (t - this.startTime) / this.duration;
        //const clampedInterpolation = Math.min(Math.max(linearInterpolation, 0), 1);
        //const loopedInterpolation = ((linearInterpolation % 1) + 1) % 1;
        const maxSpeed = 14;
        const directionV = vec3.sub([0, 0, 0], this.endPosition, this.startPosition);

        this.updateNode(maxSpeed, directionV, dt);
    }

    updateNode(maxSpeed, directionV, dt) {
        const transform = this.node.getComponentOfType(Transform);
        if (!transform) {
            return;
        }

        //vec3.lerp(transform.translation, this.startPosition, this.endPosition, interpolation);
        vec3.scaleAndAdd(this.vel, this.vel, directionV, dt * 50);
        
        const speed = vec3.length(this.vel);
        if (speed > maxSpeed) {
            vec3.scale(this.vel, this.vel, maxSpeed / speed);
        }

        vec3.scaleAndAdd(transform.translation, transform.translation, this.vel, dt);
    }

}
