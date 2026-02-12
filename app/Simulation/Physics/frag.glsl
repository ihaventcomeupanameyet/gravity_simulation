varying vec3 vColor;
void main()
{
    vec2 uv = gl_PointCoord;
    float alpha = length(uv - 0.5);
    alpha = 0.005/alpha - 0.01;
    gl_FragColor = vec4(vColor, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}