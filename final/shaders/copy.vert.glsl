const copyVertexShaderScript = `\
#version 300 es

in vec4 a_pos;

out vec4 vcolor;
out vec4 o_vpos;

void main() {
    gl_Position = vec4( a_pos.xy, 0, 1 );
    o_vpos = a_pos;
    vcolor = vec4( 0, 0, 0, 1 );
    vcolor.r = clamp(a_pos.z * 100. + 1., 0., 1.);
    vcolor.g = clamp(a_pos.w * 100. + 1., 0., 1.);

    gl_PointSize = 2.;
}
`;