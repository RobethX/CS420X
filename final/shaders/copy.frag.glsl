const copyFragmentShaderScript = `\
#version 300 es

#ifdef GL_ES
    precision mediump float;
#endif

in vec4 vcolor;
in vec4 o_vpos;

uniform sampler2D uSampler;
uniform vec2 resolution;

out vec4 color;

void main() {
    vec2 pos = gl_FragCoord.xy / resolution;
    vec4 tex = texture(uSampler, pos);

    color = vec4(tex.rgb, 1.);
    //color = vec4( o_vpos.x, o_vpos.z, o_vpos.w, 1. );
    //color = vcolor;
    //gl_fragColor = vcolor;
    color = vec4(clamp(o_vpos.z * 100. + 1., 0., 1.), clamp(o_vpos.w * 100. + 1., 0., 1.), 0., 1.);
}
`;