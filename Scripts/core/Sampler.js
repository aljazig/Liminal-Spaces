export class Sampler {

    constructor({
        minFilter = 'nearest',
        magFilter = 'linear',
        mipmapFilter = 'linear',
        addressModeU = 'repeat',
        addressModeV = 'repeat',
        addressModeW = 'clamp-to-edge',
        maxAnisotropy = 1,
    } = {}) {
        this.minFilter = minFilter;
        this.magFilter = magFilter;
        this.mipmapFilter = mipmapFilter;
        this.addressModeU = addressModeU;
        this.addressModeV = addressModeV;
        this.addressModeW = addressModeW;
        this.maxAnisotropy = maxAnisotropy;
    }

}
