import { vec3, vec4, mat3, quat } from '../gl-matrix-module.js';
import { Transform } from './Transform.js';
import { FirstPersonController } from '../FirstPersonController.js';

export class Trigger{
    constructor({
        functionality = "",
        rotation = [0, 0],
        translation = [0, 0, 0],
        scale = [0, 0, 0],
    } = {}){
        this.functionality = functionality;
        this.rotation = rotation;
        this.translation = translation;
        this.scale = scale;
    }

    executeFunction(player){
        const triggerFun = this.functionality.split(", ");
        for (let fun in triggerFun) {
            if (triggerFun[fun] == "move") {
                const transform = player.getComponentOfType(Transform);
                if (!transform) {
                    return;
                }
                vec3.add(transform.translation, transform.translation, this.translation);
            }
            if (triggerFun[fun] == "rotate") {
                const transform = player.getComponentOfType(Transform);
                if (!transform) {
                    return;
                }
                const twopi = Math.PI * 2;
                const halfpi = Math.PI / 2;
                
                const controller = player.getComponentOfType(FirstPersonController);
                const yawRot = (((this.rotation[0] + controller.yaw) % twopi) + twopi) % twopi;

                console.log(yawRot);
                controller.yaw = yawRot;
                const m = mat3.fromRotation(mat3.create(), yawRot);
                console.log(m);
                controller.velocity = vec3.transformMat3(controller.velocity, controller.velocity, m);
            }
            if (triggerFun[fun] == "scale") {
                const transform = player.getComponentOfType(Transform);
                if (!transform) {
                    return;
                }
                vec3.add(transform.scale, transform.scale, this.scale);
            }
        }
    }
}