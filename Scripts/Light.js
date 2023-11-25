export class Light {

    constructor({
        color = [1, 1, 1],
        ambient = 0.5,
    } = {}) {
        this.color = color;
        this.ambient = ambient;
    }

}