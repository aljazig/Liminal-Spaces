struct VertexInput {
    @location(0) position : vec3f,
    @location(1) texcoords : vec2f,
    @location(2) normal : vec3f,
}

struct VertexOutput {
    @builtin(position) clipPosition : vec4f,
    @location(0) position : vec3f,
    @location(1) texcoords : vec2f,
    @location(2) normal : vec3f,
}

struct FragmentInput {
    @location(0) position : vec3f,
    @location(1) texcoords : vec2f,
    @location(2) normal : vec3f,
}

struct FragmentOutput {
    @location(0) color : vec4f,
}

struct CameraUniforms {
    position : vec3f,
    viewMatrix : mat4x4f,
    projectionMatrix : mat4x4f,
}

struct ModelUniforms {
    modelMatrix : mat4x4f,
    normalMatrix : mat3x3f,
}

struct MaterialUniforms {
    baseFactor : vec4f,
}

struct LightUniforms {
    position : vec3f,
    color : vec3f,
    ambient : f32,
}

@group(0) @binding(0) var<uniform> camera : CameraUniforms;

@group(1) @binding(0) var<uniform> model : ModelUniforms;

@group(2) @binding(0) var<uniform> material : MaterialUniforms;
@group(2) @binding(1) var baseTexture : texture_2d<f32>;
@group(2) @binding(2) var baseSampler : sampler;

@group(3) @binding(0) var<uniform> light : LightUniforms;

@vertex
fn vertex(input : VertexInput) -> VertexOutput {
    var output : VertexOutput;

    output.clipPosition = camera.projectionMatrix * camera.viewMatrix * model.modelMatrix * vec4(input.position, 1);
    output.position = (model.modelMatrix * vec4(input.position, 1)).xyz;
    output.texcoords = input.texcoords;
    output.normal = model.normalMatrix * input.normal;

    return output;
}

@fragment
fn fragment(input : FragmentInput) -> FragmentOutput {
    var output : FragmentOutput;

    let L = normalize(light.position - input.position);
    let N = normalize(input.normal);

    //let Lvzp = (dot(L, N) / dot(N, N)) * N
    //let Lprav = L - Lvzp
    let R = -reflect(L, N);
    let V = normalize(camera.position - input.position);

    let lambert = max(dot(N, L), 0);
    let reflection = pow(max(dot(R, V), 0), 100);
    let ambient = light.ambient;
    let fog = pow(2, -(1) * length(V));
    let distFall = 1 / pow(distance(light.position, input.position), 2);

    let textureSampleColor = textureSample(baseTexture, baseSampler, input.texcoords);
    let materialColor = (textureSampleColor * material.baseFactor).rgb;
    let materialColorWithFog = mix(materialColor, vec3f(0, 0, 0), fog);
    let lambertFactor = vec3(lambert);
    let ambientFactor = vec3(ambient);
    let reflectionFactor = vec3(reflection);

    output.color = vec4((distFall * materialColorWithFog * ((lambertFactor + ambientFactor) + reflectionFactor)), 1);

    return output;
}
