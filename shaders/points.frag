void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    uv.y = 1.0 - uv.y;
    vec3 c = texture2D(video, vec2(uv.x, uv.y)).rgb;
    float f = 1.0 / min(resolution.x, resolution.y);

    for (int i = 0; i < 42; ++i)
        c = mix(c, vec3(1), smoothstep(f, 0.0, distance(uv, points[i].xy) - 0.005));
    
    gl_FragColor = vec4(c, 1);
}