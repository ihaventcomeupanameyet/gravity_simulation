uniform float uDeltaTime;
uniform float uTexSize;

void main(){
    vec2 uv = gl_FragCoord.xy/resolution.xy;
    vec4 pos = texture(uVelTexture,uv);

    gl_FragColor = pos;
}