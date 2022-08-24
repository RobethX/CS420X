const simulationFragmentShaderScript = `\
#version 300 es

#ifdef GL_ES
    precision mediump float;
#endif

in vec4 o_vpos;

uniform vec3 u_agent_color;
uniform float u_agent_opacity;

out vec4 o_frag;

void main() {
    //o_frag = vec4(u_agent_color, u_agent_opacity );
    o_frag = vec4(1., 1., 1., u_agent_opacity );
    //o_frag = o_vpos;
}
`;