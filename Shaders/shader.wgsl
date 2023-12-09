struct VertexInput {
    @location(0) position : vec3f,
    @location(1) texcoords : vec2f,
    @location(2) normal : vec3f,
    @location(3) tangent : vec3f,
}

struct VertexOutput {
    @builtin(position) clipPosition : vec4f,
    @location(0) position : vec3f,
    @location(1) texcoords : vec2f,
    @location(2) normal : vec3f,
    @location(3) tangent : vec3f,
}

struct FragmentInput {
    @location(0) position : vec3f,
    @location(1) texcoords : vec2f,
    @location(2) normal : vec3f,
    @location(3) tangent : vec3f,
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
    normalFactor : f32,
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
@group(2) @binding(3) var normalTexture : texture_2d<f32>;
@group(2) @binding(4) var normalSampler : sampler;

@group(3) @binding(0) var<uniform> light : LightUniforms;

@vertex
fn vertex(input : VertexInput) -> VertexOutput {
    var output : VertexOutput;

    output.clipPosition = camera.projectionMatrix * camera.viewMatrix * model.modelMatrix * vec4(input.position, 1);
    output.position = (model.modelMatrix * vec4(input.position, 1)).xyz;
    output.texcoords = input.texcoords;
    output.normal = model.normalMatrix * input.normal;
    output.tangent = model.normalMatrix * input.tangent;

    return output;
}

@fragment
fn fragment(input : FragmentInput) -> FragmentOutput {
    var output : FragmentOutput;

    let baseColor = textureSample(baseTexture, baseSampler, input.texcoords);
    let normalColor = textureSample(normalTexture, normalSampler, input.texcoords).rgb;
    let scaledNormal = normalize(normalColor * 2 - 1);// * vec3(vec2(material.normalFactor), 1));

    let normal = normalize(input.normal);
    let tangent = normalize(input.tangent);
    let bitangent = normalize(cross(normal, tangent));
    let TBN = mat3x3(tangent, bitangent, normal);
    
    let N = TBN * scaledNormal;

    let L = normalize(light.position - input.position);
    let R = -reflect(L, N);
    let V = normalize(camera.position - input.position);

    let lambert = max(dot(N, L), 0);
    let reflection = pow(max(dot(R, V), 0), 100);
    let ambient = light.ambient;
    let fog = pow(2, -(1) * length(V));
    let distFall = 1 / pow(distance(light.position, input.position), 2);
    let closeFall = pow(distance(light.position, input.position), 2) * 0.05  + 0.1;
    let fall = min(distFall, closeFall);

    let materialColor = (baseColor * material.baseFactor).rgb;
    let materialColorWithFog = mix(materialColor, vec3f(0, 0, 0), fog);
    let lambertFactor = vec3(lambert);
    let ambientFactor = vec3(ambient);
    let reflectionFactor = vec3(reflection);

    output.color = vec4((fall * materialColorWithFog * ((lambertFactor + ambientFactor) + reflectionFactor)), 1);

    return output;
}
