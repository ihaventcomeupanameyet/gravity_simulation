uniform float uDeltaTime;
uniform float uTexSize;

void main(){
    vec2 uv = gl_FragCoord.xy/resolution.xy;
    vec4 vel = texture(uVelTexture,uv);

    vec4 pos = texture(uPosTexture,uv);


    vec3 acc = vec3(0.0);

    for (float y = 0.0; y < uTexSize; y++) {
        for (float x = 0.0; x < uTexSize; x++) {

            vec2 otherUV = (vec2(x, y) + 0.5) / uTexSize;
            vec4 otherData = texture2D(uPosTexture, otherUV);

            vec3 r = otherData.xyz - pos.xyz;
            float m = otherData.w;

            float r2 = dot(r, r) + 0.01;

            float invR = inversesqrt(r2);
            float invR3 = invR * invR * invR;

            acc += 0.00003 * m * r * invR3;
        }
    }
    vel.xyz += acc * uDeltaTime;
    gl_FragColor = vel;
}