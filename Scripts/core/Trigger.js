import { vec3, vec4, mat4, quat } from '../gl-matrix-module.js';
import { Transform } from './Transform.js';

export class Trigger{
    constructor({
        functionality = "",
        rotation = [0, 0, 0],
        translation = [0, 0, 0],
        scale = [0, 0, 0],
    } = {}){
        this.functionality = functionality;
        this.rotation = quat.fromEuler([0, 0, 0, 1], rotation[0], rotation[1], rotation[2]);
        this.translation = translation;
        this.scale = scale;
    }

    executeFunction(player){
        if (this.functionality == "move") {
            const transform = player.getComponentOfType(Transform);
            if (!transform) {
                return;
            }
            vec3.add(transform.translation, transform.translation, this.translation);
        }
        if (this.functionality == "rotate") {
            const transform = player.getComponentOfType(Transform);
            if (!transform) {
                return;
            }
            vec3.add(transform.rotation, transform.rotation, this.rotation);
        }
        if (this.functionality == "scale") {
            const transform = player.getComponentOfType(Transform);
            if (!transform) {
                return;
            }
            vec3.add(transform.scale, transform.scale, this.scale);
        }
    }
}