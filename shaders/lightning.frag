float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    return abs(0.5 - fract(p * p * 2.0)) * 2.0;
}

float noise11(float p) {
	float i = floor(p);
	float f = fract(p);
    f *= f * (3.0 - 2.0 * f);
	return mix(hash11(i), hash11(i + 1.0), f);
}

float hash12(vec2 p) {
	vec3 p3 = fract(p.xyx * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	float res = mix(
		mix(hash12(i), hash12(i + vec2(1, 0)), f.x),
		mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1)), f.x), f.y);
	return res;	
}
  
float fbm(vec2 p) {
	float s = 0.0, m = 0.0, a = 1.0;
	for(int i = 0; i < 6; i++) {
		s += a * noise(p);
		m += a;
		a *= 0.5;
		p *= mat2(1.6, 1.2, -1.2, 1.6); 
	}
	return s / m;
}
   
float lightning(vec2 uv, float i) {
    // Expanding / Warping
    float n = fract(noise11(i * 3.0) * 3.0) * 2.0 - 1.0;
    float bend = n * 0.15;
    bend *= smoothstep(1.0, -0.5, abs(0.5 - gl_FragCoord.x / resolution.x) * 1.6);
    uv.y += (2.0 - uv.x * uv.x) * bend;
    uv.x -= time;
    
    float d = fbm(uv * vec2(2, 1.4) - vec2(0, i));
    d = (d * 2.0 - 1.0) * 0.45;
    return abs(uv.y - d);
}

vec3 lightnings(vec2 uv) {
    float t2 = time * 0.2;
    float d1 = lightning(uv, 21.17 + t2);
    float d2 = lightning(uv, 63.41 + t2);
    float d3 = lightning(uv, 77.69 + t2);
    float d4 = lightning(uv, 21.99 + t2);
    float dd = max(0.0, 1.0 - sqrt(d1 + d2 * d3 + d3 + d4 * d1) * 0.5);
    float d = 0.007 / sqrt(d1 * d2 * d3 * d4);
    vec3 col = vec3(0.31, 0.5, 0.89) * sqrt(d);
    
    float md = 1.0 - dd;
    col = col * 0.7 + 0.7 * vec3(4.0 * md * md + 3.5 * md, 0.3, 0.6) * md * d;
    col = mix(col, col * col, min(1.0, dd * dd * dd * dd));
    col = (col - 0.5) * 0.6 + 0.3;
    col = clamp(col, vec3(0), vec3(1));
    
    return col;
}

#define p(i) (((r ? points[i + 21] : points[i]) * 2.0 - 1.0) * vec3(-resolution.x / resolution.y, 1, 1))

void hand(vec2 uv, inout vec3 col, bool r) {
    if (p(0).y < -1.01) return;

    uv += p(9).xy;
    
    // vec3 a = normalize(p(9) - p(0));
    // vec3 b = normalize(p(17) - p(9));
    // vec3 c = cross(a, b);
    // uv.x /= abs(c.x) > abs(c.y) ? c.x : c.y;

    vec2 p1 = p(9).xy - p(0).xy;
    float an = (r ? PI : -PI) * 0.63 - atan(p1.y, p1.x);
    uv = cos(an) * uv + sin(an) * vec2(-uv.y, uv.x);

    vec3 l = lightnings(uv) * smoothstep(0.3, 0.1, abs(uv.y)) * smoothstep(0.0, 0.1, uv.x);
    col = mix(col, l, min(dot(l, l), 1.0));
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / resolution.y;
    vec3 c = texture(video, vec2(gl_FragCoord.x / resolution.x, 1.0 - gl_FragCoord.y / resolution.y)).rgb;
    hand(uv, c, true);
    hand(uv, c, false);
    fragColor = vec4(c, 1);
}