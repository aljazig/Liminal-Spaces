import { vec3, vec4, mat3, quat } from '../gl-matrix-module.js';
import { Transform } from './Transform.js';
import { FirstPersonController } from '../FirstPersonController.js';
import { LinearMover } from '../LinearMover.js';
import { Camera } from './Camera.js';

export class Trigger{
    constructor({
        functionality = "",
        monster = null,
        rotation = [0, 0],
        translation = [0, 0, 0],
        scale = [0, 0, 0],
    } = {}){
        this.functionality = functionality;
        this.monster = monster;
        this.rotation = rotation;
        this.translation = translation;
        this.scale = scale;
    }

    donutFunction(player, donut) {
        const controller = player.getComponentOfType(FirstPersonController);
        controller.maxSpeedBase *= 1.1;
        controller.maxSpeedRun = controller.maxSpeedBase + 5;
        donut.parent.removeChild(donut);

        // Donut Audio
        var audio = document.getElementById('blingAud');
        audio.play().catch(function(error) {
            console.log("Bling Auto-play was prevented: " + error);
        });
    }

    monsterAttackFunction() {
        this.monster.getComponentOfType(LinearMover).play();

         // Monster audio
         var audio = document.getElementById('triggerAud');
         audio.play().catch(function(error) {
             console.log("Trigger Auto-play was prevented: " + error);
         });
         var audio = document.getElementById('monsterAud');
         audio.play().catch(function(error) {
             console.log("Monster Auto-play was prevented: " + error);
         });
    }

    monsterKillFunction() {
        window.location = "./../../#dead";
    }

    exitFunction() {
        window.location = "./../../#won";
    }

    executeFunction(player, object){
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

                controller.yaw = yawRot;
                const m = mat3.fromRotation(mat3.create(), yawRot);
                controller.velocity = vec3.transformMat3(controller.velocity, controller.velocity, m);
            }
            if (triggerFun[fun] == "scale") {
                const transform = player.getComponentOfType(Transform);
                if (!transform) {
                    return;
                }
                vec3.add(transform.scale, transform.scale, this.scale);
            }
            if (triggerFun[fun] == "donut") {
                this.donutFunction(player, object);
            }
            if (triggerFun[fun] == "monsterAttack") {
                this.monsterAttackFunction();
            }
            if (triggerFun[fun] == "monsterKill") {
                this.monsterKillFunction();
            }
            if (triggerFun[fun] == "exit") {
                this.exitFunction();
            }
        }
    }
}