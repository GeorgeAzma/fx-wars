precision highp float;

uniform sampler2D video;
uniform float time;
uniform float brightness;
uniform vec2 resolution;
uniform vec3 points[21 * HANDS];

out vec4 fragColor;

const float PI = 3.141592653;
const float TAU = PI * 2.0;

bool is_base(int i) {
    return i == +1 || i == +5 || i == +9 || i == 13 || i == 17 || 
           i == 22 || i == 26 || i == 30 || i == 34 || i == 38;
}

bool is_tip(int i) {
    return i == +4 || i == +8 || i == 12 || i == 16 || i == 20 ||
           i == 25 || i == 29 || i == 33 || i == 37 || i == 41;
}

bool is_top(int i) {
    return i == +3 || i == +7 || i == 11 || i == 15 || i == 19 ||
           i == 24 || i == 28 || i == 32 || i == 36 || i == 40;
}

bool is_bot(int i) {
    return i == +2 || i == +6 || i == 10 || i == 14 || i == 18 ||
           i == 23 || i == 27 || i == 31 || i == 35 || i == 39;
}