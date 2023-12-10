import { Mesh, Vertex, Material, Model, Sampler, Texture, Node, Primitive } from './core.js';
import { vec4 } from './gl-matrix-module.js';
import * as WebGPU from './WebGPU.js'

export class OBJLoader {

    async load(url) {
        const response = await fetch(url);
        const text = await response.text();
        const adapter = await navigator.gpu.requestAdapter();
        const device = await adapter.requestDevice();
        this.device = device;

        const folder = url.replace(url.split('/')[url.split('/').length - 1], '');

        const lines = text.split('\n');
        const mtllib = await (await fetch(folder + lines.filter(line => (/mtllib\s+/).test(line))[0].replace("mtllib ", ""))).text();
        const newMatRegex = /usemtl\s+/;
        const materials = lines.filter(line => newMatRegex.test(line));
        let matCount = 0;

        const models = new Node();
        const dif = text.split("o ");
        for (let i = 1; i < dif.length; i++) {
            let m = new Node();
            let material = await this.loadMaterial(materials[matCount].replace("usemtl ", ""), mtllib, folder);
            console.log(material);
            m.addComponent(new Model({
                primitives: [
                    new Primitive({
                        material: material,
                        mesh: this.loadMesh(dif[i]),
                    }),
                ],
                name: "object_part" + matCount,
            }));
            m.isStatic = true;
            models.addChild(m);
        }
        console.log(models);
        return models;
    }

    async loadMaterial(currentMat, mtllib, folder){
        const mat = mtllib.split("newmtl ");
        for (let n = 0; n < mat.length; n++) {
            if (mat[n].includes(currentMat)) {
                const matLines = mat[n].split('\n');

                const textureColorsString = matLines.filter(line => (/Kd\s+/).test(line))[0].replace("Kd ", "");
                const textureColors = textureColorsString.split(' ');
                const colors = (() => {
                    let all = new Uint8ClampedArray(1 * 1 * 4);
                    for (let factor in textureColors) {
                        let color = Math.round(255 * parseFloat(textureColors[factor]));
                        all[factor] = color;
                    }
                    all[3] = 1;
                    return all;
                })();

                const imageData = new ImageData(colors, 1, 1);
                const imageBitmap = await createImageBitmap(imageData);
                console.log(colors);
                const baseTexture = new Texture({
                    image: imageBitmap,
                    sampler: new Sampler(),
                });
                
                return new Material({
                    baseTexture: baseTexture,
                    normalTexture: baseTexture,
                });
            }
        }
    }

    loadMesh(text) {
        //const response = await fetch(url);
        //const text = await response.text();

        const lines = text.split('\n');
        //const mtllib = lines.filter(line => (/mtllib\s+/).test(line))[0];

        const vRegex = /v\s+(\S+)\s+(\S+)\s+(\S+)\s*/;
        const vData = lines
            .filter(line => vRegex.test(line))
            .map(line => [...line.match(vRegex)].slice(1))
            .map(entry => entry.map(entry => Number(entry)));

        const vnRegex = /vn\s+(\S+)\s+(\S+)\s+(\S+)\s*/;
        const vnData = lines
            .filter(line => vnRegex.test(line))
            .map(line => [...line.match(vnRegex)].slice(1))
            .map(entry => entry.map(entry => Number(entry)));

        const vtRegex = /vt\s+(\S+)\s+(\S+)\s*/;
        const vtData = lines
            .filter(line => vtRegex.test(line))
            .map(line => [...line.match(vtRegex)].slice(1))
            .map(entry => entry.map(entry => Number(entry)));

        function triangulate(list) {
            const triangles = [];
            for (let i = 2; i < list.length; i++) {
                triangles.push(list[0], list[i - 1], list[i]);
            }
            return triangles;
        }

        const fRegex = /f\s+(.*)/;
        const fData = lines
            .filter(line => fRegex.test(line))
            .map(line => line.match(fRegex)[1])
            .map(line => line.trim().split(/\s+/))
            .flatMap(face => triangulate(face));

        const vertices = [];
        const indices = [];
        const cache = {};
        let cacheLength = 0;
        const indicesRegex = /(\d+)(\/(\d+))?(\/(\d+))?/;

        for (const id of fData) {
            if (id in cache) {
                indices.push(cache[id]);
            } else {
                cache[id] = cacheLength;
                indices.push(cacheLength);
                const [,vIndex,,vtIndex,,vnIndex] = [...id.match(indicesRegex)]
                    .map(entry => Number(entry) - 1);
                vertices.push(new Vertex({
                    position: vData[vIndex],
                    normal: vnData[vnIndex],
                    texcoords: vtData[vtIndex],
                }));
                cacheLength++;
            }
        }

        return new Mesh({ vertices, indices });
    }

}
