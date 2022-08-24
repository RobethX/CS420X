const simulationVertexShaderScript = `\
#version 300 es

#define PI_4 3.1415926538/4.

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

uniform vec2 u_cursor_position;
uniform vec2 u_joystick_position;
uniform vec2 u_right_stick_position;

// our chemical layer
uniform sampler2D uSampler;

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
    
    // get normalied height / width of a single pixel 
    vec2 pixel = 1. / resolution;
    ivec2 ires = ivec2( resolution );
    
    // how far ahead should sensing occur? this is fun to play with
    //vec2 sensorDistance = pixel * (u_sensor_distance + u_right_stick_position.x * 3.); //9.
    
    // normalize our {-1,1} vertex coordinates to {0,1} for texture lookups
    vec2 pos = (1. + a_pos.xy) / 2.;

    // angle to turn
    //float turn_angle = PI_4 * u_agent_rotate;
    //turn_angle -= u_right_stick_position.y / 4.;

    vec2 separation = vec2(0.0);
    vec2 cohesion = vec2(0.0);
    vec2 cohesionCentroid = vec2(0.0);
    int cohesionCount = 0;
    vec2 alignment = vec2(0.0);

    int range = 25;
    ivec2 iv = ivec2(o_vpos.xy);

    for (int i = iv.x - range; i < iv.x + range; i++) {
        for (int j = iv.y - range; j < iv.y + range; j++) {
            ivec2 coord = (ivec2(i, j) + ires) % ires;
            vec4 agent = texelFetch( uSampler, coord, 0 );
            float dist = distance( pos, agent.xy );
            vec2 diff = agent.xy - pos;
            diff = normalize(diff);

            if (agent.xy == pos) {
                continue;
            }

            if (dist < u_separation_distance * pixel.y) { // separation
                //o_vpos.xy -= diff * u_agent_speed * pixel.x;
                separation += diff * pixel.x;
            }

            if (dist < u_cohesion_distance * pixel.y) { // cohesion
                cohesionCount++;
                cohesionCentroid += agent.xy;
            }

            if (dist < u_alignment_distance * pixel.x) { // alignment
                alignment += agent.zw;
            }
        }
    }

    o_vpos.zw += separation * 0.01;

    if (cohesionCount > 0) {
        cohesionCentroid /= float(cohesionCount);
        cohesion = cohesionCentroid - pos;
        cohesion = normalize(cohesion);
        o_vpos.zw += cohesion * 0.1;
    }

    o_vpos.zw += alignment * 0.01;

    // move our agent in our new direction by one pixel
    o_vpos.xy += o_vpos.zw * pixel * u_agent_speed;

    // joystick :)
    //float joystick_sensor = readSensor( pos, u_joystick_position, 0., sensorDistance );
    //o_vpos.xy += u_joystick_position * pixel * u_agent_speed * joystick_sensor;
    
    //gl_PointSize = u_agent_size; // 1.
    gl_PointSize = 1.;
    
    // position is for fragment shader rendering, don"t need to include heading
    //gl_Position = vec4( a_pos.x, a_pos.y, 0., 1. );
    gl_Position = vec4( o_vpos.xy, 0., 1. );
}
`;