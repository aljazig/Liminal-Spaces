import { Transform } from './core.js';

import { quat } from './gl-matrix-module.js';

export class SpinAnimator {

    constructor(node, {
        startRotation = [0, 0, 0, 1],
        endRotation = [0, 0, 0, 1],
        startTime = 0,
        duration = 1,
        loop = false,
    } = {}) {
        this.node = node;

        this.startRotation = startRotation;
        this.endRotation = endRotation;

        this.startTime = startTime;
        this.duration = duration;
        this.loop = loop;

        this.playing = true;
        this.currentAngle = 0;
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

        const linearInterpolation = (t - this.startTime) / this.duration;
        const clampedInterpolation = Math.min(Math.max(linearInterpolation, 0), 1);
        const loopedInterpolation = ((linearInterpolation % 1) + 1) % 1;
        
        let angle = 360 * loopedInterpolation;
        this.endRotation = quat.fromEuler(quat.create(), 0, angle, 0);

        this.currentAngle = (360 * ((t - this.startTime) / this.duration)) % 360;

        this.updateNode();
    }

    updateNode(interpolation) {
        const transform = this.node.getComponentOfType(Transform);
        if (!transform) {
            return;
        }

        quat.fromEuler(transform.rotation, 0, this.currentAngle, 0);
    }

}
