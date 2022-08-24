const ddFragmentShaderScript = `\
#version 300 es

#ifdef GL_ES
    precision mediump float;
#endif  

uniform sampler2D uSampler;
uniform vec2 resolution;

uniform float u_chemical_strength;
//uniform vec3 u_chemical_color;

float get(int x, int y) {
    return texture( uSampler, ( gl_FragCoord.xy + vec2(x, y) ) / resolution ).r;
}

out vec4 color;
void main() {
    float sum = get(0,0) - 1.;
    sum += get(-1,0)  *  .2;
    sum += get(-1,-1) *  .05;
    sum += get(0,-1)  *  .2;
    sum += get(1,-1)  *  .05;       
    sum += get(1,0)   *  .2;
    sum += get(1,1)   *  .05;
    sum += get(0,1)   *  .2;
    sum += get(-1,1)  *  .05;
    
    vec2 pos = gl_FragCoord.xy / resolution;
    vec4 tex = texture( uSampler, pos );
    color = vec4( vec3(sum) * u_chemical_strength, .25 );
}
`;