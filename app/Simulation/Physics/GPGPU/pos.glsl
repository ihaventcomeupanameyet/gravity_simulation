uniform float uDeltaTime;

void main(){
    vec2 uv = gl_FragCoord.xy/resolution.xy;
    vec4 pos = texture(uPosTexture,uv);

    vec4 vel = texture(uVelTexture,uv);

    pos.xyz+=vel.xyz * uDeltaTime;

    gl_FragColor = pos;
}