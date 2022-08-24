const copyFragmentShaderScript = `\
#version 300 es

#ifdef GL_ES
    precision mediump float;
#endif

uniform sampler2D uSampler;
uniform vec2 resolution;

out vec4 color;
void main() {
    vec2 pos = gl_FragCoord.xy / resolution;
    vec4 tex = texture( uSampler, pos );
    color = vec4( tex.rgb, 1. );
}
`;