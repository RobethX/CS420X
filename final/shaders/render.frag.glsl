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
    color = vec4(clamp(o_vpos.z * 100. + 1., 0., 1.), clamp(o_vpos.w * 100. + 1., 0., 1.), 0., 1.);
    color = vec4(1.);
}
`;