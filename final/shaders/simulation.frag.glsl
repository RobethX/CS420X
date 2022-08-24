const simulationFragmentShaderScript = `\
#version 300 es

#ifdef GL_ES
    precision mediump float;
#endif

in vec4 o_vpos;

out vec4 o_frag;

void main() {
    o_frag = o_vpos;
}
`;