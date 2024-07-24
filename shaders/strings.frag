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

float segment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa,ba) / dot(ba,ba), 0.0, 1.0);
    return length(pa - ba * h);
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    uv.y = 1.0 - uv.y;
    vec3 c = texture2D(video, vec2(uv.x, uv.y)).rgb;
    float f = 1.0 / min(resolution.x, resolution.y);

    // Points
    // for (int i = 0; i < 42; ++i)
    //     c = mix(c, vec3(1), smoothstep(f, 0.0, distance(uv, points[i].xy) - 0.005));
    
    // Web
    // for (int i = 0; i < 41; ++i) {
    //     vec2 a = normalize(uv - points[i].xy);
    //     float an = noise11(time * 0.01 + float(i) * 33.618) * 111.0;
    //     a = cos(an) * a + sin(an) * vec2(-a.y, a.x);
    //     vec2 b = normalize(points[i + 1].xy - points[i].xy);
    //     c = mix(c, vec3(1), smoothstep(f / distance(uv, points[i].xy), 0.0, abs(dot(a, b)) - 0.005) * max(0.0, 1.0 - 3.0 * distance(points[i].xy, uv)));
    // }

    // Strings
    for (int i = 0; i < 21; ++i) {
        if (points[i].x > -0.1 && points[i + 21].x > -0.1) {
            float id = float(i * 100);
            float d1 = distance(uv, points[i].xy);
            float d = min(d1, distance(uv, points[i + 21].xy));
            vec2 v = uv + sqrt(d) * (noise11(d1 * 3.0 + time * 1.5 + id) * 2.0 - 1.0 + 
                                     noise11(d1 * 6.0 + time * 2.0 + id) * 1.2 - 0.6) * 0.02;
            float d2 = cos(distance((v.yxy * vec3(16) + points[i] * vec3(16, 16, 64)), points[i + 21] * vec3(16, 16, 64)));
            c = mix(c, vec3(d2 * 0.1 + 0.9) * (sqrt(brightness) * 1.3 + 0.1), 
                smoothstep(f, 0.0, segment(v, points[i].xy, points[i + 21].xy) - abs(0.0014 - 0.0022 * noise11(d1 * 70.0 + id))) * noise11(d1 * 70.0 + id));
        }
    }
    gl_FragColor = vec4(c, 1);
}