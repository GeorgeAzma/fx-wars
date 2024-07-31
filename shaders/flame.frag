vec2 hash22(vec2 p) {
	vec3 p3 = fract(p.xyx * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
}

float noise(vec2 p) {
	vec2 i = floor(p + (p.x + p.y) * 0.366025);
    vec2 a = p - i + (i.x + i.y) * 0.211324;
    float m = step(a.y, a.x); 
    vec2 o = vec2(m, 1.0 - m);
    vec2 b = a - o + 0.211324;
	vec2 c = a - 0.577351;
    vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
	vec3 n = h * h * h * h * 
        vec3(dot(a, hash22(i) - 0.5), 
             dot(b, hash22(i + o) - 0.5), 
             dot(c, hash22(i + 1.0) - 0.5));
    return dot(n, vec3(70));
}

float fbm(vec2 uv) {
	const mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
	float f = 0.5 * noise(uv); uv = m * uv;
	f += 0.25 * noise(uv); uv = m * uv;
	f += 0.125 * noise(uv); uv = m * uv;
	f += 0.0625 * noise(uv); uv = m * uv;
	f += 0.03 * noise(uv); uv = m * uv;
	return f + 0.55;
}

vec3 flame(vec2 uv, float i) {
    float r = resolution.x / resolution.y;
    vec2 a = mix(vec2(1, 1.0 / r), vec2(r, 1), step(1.0, r));
    uv = (uv * 2.0 - 1.0) * a * 1.3;
    
    float d = fbm(uv * 1.5 - vec2(i * 315.5189, time * 2.0));
    float y = uv.y * 0.5 + 0.5 * a.y;
    float x = sqrt(y) * PI * 0.5;
    x = sin(x * 0.7) * cos(x);
    float z = smoothstep(0.2*d*x, 0.7*d*d, x - sqrt(abs(uv.x)) * abs(uv.x) * 1.5);

    d = smoothstep(0.0, 0.9+0.7*y*y*z, d);
    d *= z * z;
    vec3 col = vec3(d*sqrt(d), d*d*d, d*d*d*d);
    z = max(0.0001, z);
    col *= vec3(3.1, 3.8 / (z * z), 2.5 / (z * z * z * z));

    return col;
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec2 p = (points[0].xy + points[9].xy) * 0.5;
    vec3 col = flame(uv - vec2(p.x - 0.5, 0.85 - p.y), 0.0) * step(points[11].y, points[0].y);
    p = (points[21].xy + points[30].xy) * 0.5;
    col += flame(uv - vec2(p.x - 0.5, 0.85 - p.y), 1.0);
    uv.y = 1.0 - uv.y;
    col = mix(texture(video, uv).rgb, col, dot(col, vec3(0.299, 0.587, 0.114)));

    fragColor = vec4(col, 1);
}