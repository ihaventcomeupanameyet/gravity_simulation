uniform float uDeltaTime;

void main(){
    vec2 uv = gl_FragCoord.xy/resolution.xy;
    vec4 pos = texture(uPosTexture,uv);

    gl_FragColor = pos;
}