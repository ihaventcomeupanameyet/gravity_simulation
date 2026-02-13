uniform vec2 uResolution;
uniform float uSize;
uniform sampler2D uDataTex;

varying vec3 vColor;

attribute vec2 aUv;
attribute float aSize;
void main()
{
    // Final position
    vec4 particle_info = texture(uDataTex,aUv);
    vec4 modelPosition = modelMatrix * vec4(particle_info.xyz, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Point size
    gl_PointSize = uSize * uResolution.y * aSize;
    gl_PointSize *= (1.0 / - viewPosition.z);

    // Varyings
    vColor = mix(vec3(1.0,1.0,0.0), vec3(0.0,0.0,1.0),particle_info.a);
}