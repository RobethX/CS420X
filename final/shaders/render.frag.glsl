const renderFragmentShaderScript = `\
#version 300 es

#ifdef GL_ES
    precision mediump float;
#endif

in vec4 o_vpos;

uniform sampler2D uSampler;
uniform vec2 resolution;

out vec4 color;

void main() {
    color = vec4(1.);
}
`;