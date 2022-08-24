const renderVertexShaderScript = `\
#version 300 es

in vec4 a_pos;

out vec4 o_vpos;

void main() {
    gl_Position = vec4( a_pos.xy, 0, 1 );
    gl_PointSize = 2.;
    o_vpos = a_pos;
}
`;