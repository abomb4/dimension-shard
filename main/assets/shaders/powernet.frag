#define HIGHP

#define ALPHA 0.04
#define step 1

uniform sampler2D u_texture;
uniform vec2 u_texsize;
uniform vec2 u_invsize;
uniform float u_time;
uniform float u_dp;
uniform vec2 u_offset;

varying vec2 v_texCoords;

void main(){
    vec2 T = v_texCoords.xy;
    vec2 coords = (T * u_texsize) + u_offset;

    vec4 color = texture2D(u_texture, T);
    vec2 v = u_invsize;

    float a_mul = (sin(u_time / 22.0) + 1) * 0.3 + 0.4;

    vec4 maxed = max(
    max(
    max(
    texture2D(u_texture, T + vec2(0, step) * v),
    texture2D(u_texture, T + vec2(0, -step) * v)
    ),
    texture2D(u_texture, T + vec2(step, 0) * v)
    ),
    texture2D(u_texture, T + vec2(-step, 0) * v)
    );

    if (texture2D(u_texture, T).a < 0.9 && maxed.a > 0.59) {
        gl_FragColor = vec4(maxed.rgb, 0.8 * a_mul);
    } else {
        if (color.a > 0.0) {
            // if (mod(coords.x / u_dp + coords.y / u_dp + u_time / 4.0, 20.0) < 2.0) {
            if (mod(coords.x / u_dp + coords.y / u_dp + mod(coords.y * 2, 10) + mod(coords.y, 10), 40.0) < 2.0) {
                // color *= 1.85;
                color.a = 0.4 * a_mul;
            } else {
                color.a = 0.12 * a_mul;
            }
        }

        gl_FragColor = color;
    }
}
