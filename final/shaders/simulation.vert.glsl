const simulationVertexShaderScript = `\
#version 300 es

#define PI_4 3.14159265359/4.

#ifdef GL_ES
    precision mediump float;
#endif

// input from our feedback TRANSFORM_FEEDBACK
in vec4 a_pos;

uniform vec2 resolution;
uniform float time;

uniform int u_agent_count;
uniform float u_agent_speed;

uniform float u_separation_distance;
uniform float u_cohesion_distance;
uniform float u_alignment_distance;

uniform float u_separation_power;
uniform float u_cohesion_power;
uniform float u_alignment_power;
uniform float u_centering_power;

uniform vec2 u_cursor_position;
uniform vec2 u_joystick_position;
uniform vec2 u_right_stick_position;

uniform sampler2D uSampler;
//uniform samplerBuffer temp;

// the output of our feedback transform
// xy will store our position
// zw wiil store our heading / direction
out vec4 o_vpos;

// this function accepts a direction (header) for a
// agent and a rotation in radians, returning the
// new, rotated direction
vec2 rotate(vec2 dir, float angle) {
    float  s = sin( angle );
    float  c = cos( angle );
    mat2   m = mat2( c, -s, s, c );
    return m * dir;
}

float random(in vec2 p) {
    return fract(sin(dot(p.xy, vec2(42.6852, 11.2225))) * 12366.4566);
}

// pos - position of agent
// dir - heading of agent
// angle - direction to sense, in radians
// distance - distance to sense
float readSensor( vec2 pos, vec2 dir, float angle, vec2 distance ) {
    vec2 newangle  = rotate( dir, angle  );
    vec2 offset = newangle * distance;

    if ((pos + offset).x < 0. || (pos + offset).x > resolution.x || (pos + offset).y < 0. || (pos + offset).y > resolution.y) {
        return 0.0;
    }

    return texture( uSampler, pos + offset ).r;
}

void main() {
    // initialize feedback transform output
    o_vpos = a_pos;

    int id = gl_VertexID;

    // get normalied height / width of a single pixel 
    vec2 pixel = 1. / resolution;
    ivec2 ires = ivec2(resolution);
    
    // how far ahead should sensing occur? this is fun to play with
    //vec2 sensorDistance = pixel * (u_sensor_distance + u_right_stick_position.x * 3.); //9.
    
    // normalize our {-1,1} vertex coordinates to {0,1} for texture lookups
    vec2 pos = (1. + a_pos.xy) / 2.;
    ivec2 ipos = ivec2(a_pos.xy);

    // angle to turn
    //float turn_angle = PI_4 * u_agent_rotate;
    //turn_angle -= u_right_stick_position.y / 4.;

    vec2 separation = vec2(0.0);
    int separation_count = 0;
    vec2 cohesion = vec2(0.0);
    vec2 cohesion_centroid = vec2(0.0);
    int cohesion_count = 0;
    vec2 alignment = vec2(0.0);
    int alignment_count = 0;

    int range = 50;

    for (int i = 0; i <= u_agent_count; i++) {
        if (i == id) {
            continue;
        }

        ivec2 coord = ivec2(i,0);
        //vec4 neighbor = texelFetch(uSampler, coord, 0);
        vec4 neighbor = texture(uSampler, vec2((float(i) + 0.5)/float(u_agent_count), 1.));
        float dist = distance(o_vpos.xy, neighbor.xy);
        vec2 diff = o_vpos.xy - neighbor.xy;

        if (neighbor.xy == vec2(0.0)) {
            continue;
        }

        if (dist < u_separation_distance * 0.01) { // separation
            separation_count++;
            separation += diff.xy;
        } else if (dist < u_cohesion_distance * 0.01) { // cohesion
            cohesion_count++;
            cohesion_centroid += neighbor.xy;
        }

        if (dist < u_alignment_distance * 0.01) { // alignment
            alignment_count++;
            alignment += neighbor.zw;
        }
    }

    if (separation_count > 0) {
        separation /= float(separation_count);
        if (length(separation) > 1.0) {
            //separation = normalize(separation);
        }
        //separation -= o_vpos.xy;
        o_vpos.zw += separation * u_separation_power * 0.5;
    }

    if (cohesion_count > 0) {
        cohesion_centroid /= float(cohesion_count);
        cohesion = cohesion_centroid - o_vpos.xy;
        cohesion = normalize(cohesion);
        o_vpos.zw += cohesion * u_cohesion_power * 0.0025;
    }

    if (alignment_count > 0) {
        alignment /= float(alignment_count);
        alignment = normalize(alignment - o_vpos.zw);
        o_vpos.zw += (alignment) * u_alignment_power * 0.0025;
    }

    //o_vpos.xy += u_joystick_position * 0.005;

    if (length(o_vpos.zw) > 1.) {
        o_vpos.zw = normalize(o_vpos.zw);
    }

    if (length(u_joystick_position) > 0.01) {
        o_vpos.zw += u_joystick_position * 0.01;
    }

    float bound = 0.95;

    // if (o_vpos.x < -bound) {
    //     o_vpos.zw = rotate(o_vpos.zw, PI_4/20.);
    //     //o_vpos.z += 0.05 * u_centering_power;
    // }
    // if (o_vpos.x > bound) {
    //     o_vpos.zw = rotate(o_vpos.zw, -PI_4/20.);
    //     //o_vpos.z -= 0.05 * u_centering_power;
    // }
    // if (o_vpos.y < -bound) {
    //     o_vpos.zw = rotate(o_vpos.zw, PI_4/20.);
    //     //o_vpos.w += 0.05 * u_centering_power;
    // }
    // if (o_vpos.y > bound) {
    //     o_vpos.zw = rotate(o_vpos.zw, -PI_4/20.);
    //     //o_vpos.w -= 0.05 * u_centering_power;
    // }

    o_vpos.zw = rotate(o_vpos.zw, 0.05 - random(o_vpos.xy) * 0.1); // add some randomness

    // move our agent in our new direction by one pixel
    o_vpos.xy += o_vpos.zw * pixel * u_agent_speed;

    if (o_vpos.x > 1. || o_vpos.x < -1.) {
        o_vpos.x *= -1.;
        //o_vpos.zw = rotate(o_vpos.zw, PI_4);
    }

    if (o_vpos.y > 1. || o_vpos.y < -1.) {
        o_vpos.y *= -1.;
        //o_vpos.zw = rotate(o_vpos.zw, PI_4);
    }

    //o_vpos.x = clamp(o_vpos.x, -1., 1.);
    //o_vpos.y = clamp(o_vpos.y, -1., 1.);

    gl_PointSize = 1.;
    //gl_Position = vec4( a_pos.x, a_pos.y, 0., 1. );
    //gl_Position = vec4(o_vpos.x, o_vpos.y, 0., 1.);
    gl_Position = vec4((2. * (float(id) / float(u_agent_count)) - 1.), 0, 0, 1.);
}
`;