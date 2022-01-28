void main () {
    vec3 noise = vec3(voronoi(vec3(uvN()*10., time)));
    noise = smoothstep(0.3, 1.2, noise);

    vec3 noiseB = hsv2rgb(noise);
    noiseB = normalize(noiseB);
    
    vec3 c = mix(noise, noiseB, 0.15);
    
    gl_FragColor = vec4(c, 1.0);
}