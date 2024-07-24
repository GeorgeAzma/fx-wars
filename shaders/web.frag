float hash11(float p) {
    p = fract(p / 0.1031);
    p *= p + 33.33;
    return fract(p * p * 2.0);
}

float noise11(float p) {
    float i = floor(p);
    float f = fract(p);
    f *= f * (3.0 - 2.0 * f);
    return mix(hash11(i), hash11(i + 1.0), f);
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    uv.y = 1.0 - uv.y;
    vec3 c = texture2D(video, uv).rgb;
    float f = 1.0 / min(resolution.x, resolution.y);

    for (int i = 0; i < 41; ++i) {
        vec2 a = normalize(uv - points[i].xy);
        float an = noise11(time * 0.01 + float(i) * 33.618) * 111.0;
        a = cos(an) * a + sin(an) * vec2(-a.y, a.x);
        vec2 b = normalize(points[i + 1].xy - points[i].xy);
        c = mix(c, vec3(1), smoothstep(f / distance(uv, points[i].xy), 0.0, abs(dot(a, b)) - 0.005) * max(0.0, 1.0 - 3.0 * distance(points[i].xy, uv)));
    }

    gl_FragColor = vec4(c, 1);
}