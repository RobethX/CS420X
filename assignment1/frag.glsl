float t(float offset, float scale, float speed) {
    return scale * ((sin(speed*time)/2.) + 0.5) + offset;
}

vec3 rgb2hsv(vec3 rgb) {
    float maxVal = max(max(rgb.r, rgb.g), rgb.b);
    float minVal = min(min(rgb.r, rgb.g), rgb.b);
    

    float H = 0.;
    float S = 0.;
    float V = 0.;
    
    float C = maxVal - minVal;

    if (maxVal > 0.) {
        V = maxVal;///255.;
        S = C / V;
    }
    
    if (C == 0.) {
        H = 0.;
    } else if (rgb.r >= maxVal) {
        H = (rgb.g - rgb.b) / C;
    } else if (rgb.g >= maxVal) {
        H = 2. + (rgb.b - rgb.r) / C;
    } else {
        H = 4. + (rgb.r - rgb.g) / C;
    }
    
    H = H / 6.;

    return vec3(H, S, V);
}

float zoom = 12.;

void main() {
    vec2 cursor = mouse.xy / resolution.xy / 2.;
    cursor.y = 1. - cursor.y;

    vec2 pos = rotate(uvN(), cursor, t(0., 1., 0.5));
    
    vec3 noiseA = vec3(voronoi(vec3(pos*zoom, time)));
    vec3 noiseB = normalize(hsv2rgb(noiseA));
    
    vec3 c = vec3(normalize(vec2(noiseA.r, noiseA.g)), clamp(noiseA.b, 0., 1.));
    
    c.b = dot(c.g, c.r);
    c.b = fbm(vec2(c.g, noiseB.r), 4);
    c.b = smoothstep(0.3, 0.7, c.b);
    
    c.r = smoothstep(0.6, 0.9, c.r);
    c.r = dot(noiseB.r, c.r);
    c.r = c.r * 3.;
    
    c.g = pow(c.g, t(3.5, 1., .5));
    c.g = c.g * (1. - c.r * 0.5);
    
    vec3 hsv = rgb2hsv(c);
    //hsv.x = hsv.x + uvN().x;
    //c = hsv2rgb(hsv);
    
    gl_FragColor = vec4(c, 1.0);
}