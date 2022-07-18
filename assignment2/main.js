// "global" variables
let gl, uTime, uRes, program, videoTexture, cursorPos

window.onload = function() {
    const canvas = document.getElementById( "gl" )
    gl = canvas.getContext( "webgl" )
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // define drawing area of canvas. bottom corner, width / height
    gl.viewport( 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight )

    // create a buffer object to store vertices
    const buffer = gl.createBuffer()

    // point buffer at graphic context's ARRAY_BUFFER
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer )

    const triangles = new Float32Array([
        -1, -1,
        1,  -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1
    ])

    // initialize memory for buffer and populate it. Give
    // open gl hint contents will not change dynamically.
    gl.bufferData( gl.ARRAY_BUFFER, triangles, gl.STATIC_DRAW )

    // create vertex shader
    let shaderScript = document.getElementById("vertex")
    let shaderSource = shaderScript.text
    const vertexShader = gl.createShader( gl.VERTEX_SHADER )
    gl.shaderSource( vertexShader, shaderSource );
    gl.compileShader( vertexShader )

    // create fragment shader
    shaderScript = document.getElementById("fragment")
    shaderSource = shaderScript.text
    const fragmentShader = gl.createShader( gl.FRAGMENT_SHADER )
    gl.shaderSource( fragmentShader, shaderSource );
    gl.compileShader( fragmentShader )

    // create shader program
    program = gl.createProgram()
    gl.attachShader( program, vertexShader )
    gl.attachShader( program, fragmentShader )
    gl.linkProgram( program )
    gl.useProgram( program )

    /* ALL ATTRIBUTE/UNIFORM INITIALIZATION MUST COME AFTER 
    CREATING/LINKING/USING THE SHADER PROGAM */

    // find a pointer to the uniform "time" in our fragment shader
    uTime = gl.getUniformLocation( program, "time" ) 
    uRes = gl.getUniformLocation( program, "resolution" )
    gl.uniform2f( uRes, window.innerWidth, window.innerHeight )

    // get position attribute location in shader
    const position = gl.getAttribLocation( program, "a_position" )
    // enable the attribute
    gl.enableVertexAttribArray( position )
    // this will point to the vertices in the last bound array buffer.
    // In this example, we only use one array buffer, where we're storing 
    // our vertices
    gl.vertexAttribPointer( position, 2, gl.FLOAT, false, 0, 0)


    // ====== tweakpane ======

    const PARAMS = {
        magnify: true,
        zoom: 0.5,
        radius: 0.1,
        wobble: true,
        speed: 1.0,
        mix: 0.5,
        edges: true,
        threshold: 0.75,
        color: "#8070FF",
    };
    
    const pane = new Tweakpane.Pane({
        title: "Parameters",
        expanded: true,
    });

    const uMagnify = gl.getUniformLocation(program, "u_magnify");
    gl.uniform1f(uMagnify, PARAMS.magnify);
    pane.addInput(PARAMS, "magnify").on("change", e => {
        gl.uniform1f(uMagnify, e.value);
    });
    
    const uZoom = gl.getUniformLocation(program, "u_zoom");
    gl.uniform1f(uZoom, PARAMS.zoom);
    pane.addInput(PARAMS, "zoom", {
        min: 0.0,
        max: 1.0,
    }).on("change", e => {
        gl.uniform1f(uZoom, e.value); 
    });

    const uRadius = gl.getUniformLocation(program, "u_radius");
    gl.uniform1f(uRadius, PARAMS.radius);
    pane.addInput(PARAMS, "radius", {
        min: 0.0,
        max: 0.5,
    }).on("change", e => {
        gl.uniform1f(uRadius, e.value); 
    });

    pane.addSeparator();

    const uWobble = gl.getUniformLocation(program, "u_wobble");
    gl.uniform1f(uWobble, PARAMS.wobble);
    pane.addInput(PARAMS, "wobble").on("change", e => {
        gl.uniform1f(uWobble, e.value);
    });

    const uSpeed = gl.getUniformLocation(program, "u_speed");
    gl.uniform1f(uSpeed, PARAMS.speed);
    pane.addInput(PARAMS, "speed", {
        min: 0.0,
        max: 5.0,
    }).on("change", e => {
        gl.uniform1f(uSpeed, e.value); 
    });

    pane.addSeparator();

    const uMix = gl.getUniformLocation(program, "u_mix");
    gl.uniform1f(uMix, PARAMS.mix);
    pane.addInput(PARAMS, "mix", {
        min: 0.0,
        max: 1.0,
    }).on("change", e => {
        gl.uniform1f(uMix, e.value); 
    });

    pane.addSeparator();

    const uEdges = gl.getUniformLocation(program, "u_edges");
    gl.uniform1f(uEdges, PARAMS.edges);
    pane.addInput(PARAMS, "edges").on("change", e => {
        gl.uniform1f(uEdges, e.value);
    });

    const uThreshold = gl.getUniformLocation(program, "u_threshold");
    gl.uniform1f(uThreshold, PARAMS.threshold);
    pane.addInput(PARAMS, "threshold", {
        min: 0.0,
        max: 1.0,
    }).on("change", e => {
        gl.uniform1f(uThreshold, e.value); 
    });
    
    const uColor = gl.getUniformLocation(program, "u_edge_color");
    gl.uniform3f(uColor, ...hex2rgb(PARAMS.color));
    pane.addInput(PARAMS, "color").on("change", e => {
        gl.uniform3f(uColor, ...hex2rgb(e.value));
    });

    // pane.on("change", (ev)=>{
    //     console.log("Pane variable " + JSON.stringify(ev.presetKey) + " changed to " + JSON.stringify(ev.value))
    // })

    // ====== mouse internaction ======

    const uCursorPos = gl.getUniformLocation(program, "u_cursor_position")

    window.addEventListener("mousemove", e => {
        cursorPos = getMousePos(e, canvas)
        gl.uniform2f(uCursorPos, cursorPos.x, cursorPos.y);
    })

    // ====== video texture ======

    video = getVideo()
}

function hex2rgb(hex) {
    validator = /^#?[0-9A-F]{6}$/i // regex pattern for validating hex colors

    var color = {
        r: 0.0,
        g: 0.0,
        b: 0.0,
    }

    if (validator.test(hex) != true) {
        console.warn("hex2rgb error: color \"" + hex + "\" failed validation")
        hex = "#000000"
        //return color
    }

    color.r = Number("0x" + hex.substr(-6, 2))/255
    color.g = Number("0x" + hex.substr(-4, 2))/255
    color.b = Number("0x" + hex.substr(-2, 2))/255

    return [color.r, color.g, color.b]
}

function getMousePos(event, canvas) { // normalize cursor coordinates
    return {
        x: event.clientX / canvas.width,
        y: 1-(event.clientY / canvas.height),
    }
}

function getVideo() {
    const video = document.createElement("video")

    // request video stream
    navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 }
    }).then( stream => { 
        // this block happens when the video stream has been successfully requested
        video.srcObject = stream
        video.play()

        makeTexture()
    })
      
    return video
  }
  
  function makeTexture() {
    // create an OpenGL texture object
    videoTexture = gl.createTexture()
    
    // this tells OpenGL which texture object to use for subsequent operations
    gl.bindTexture( gl.TEXTURE_2D, videoTexture)
      
    // since canvas draws from the top and shaders draw from the bottom, we
    // have to flip our canvas when using it as a shader.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    // how to map when texture element is more than one pixel
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR )
    // how to map when texture element is less than one pixel
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR )
    
    // you must have these properties defined for the video texture to
    // work correctly at non-power-of-2 sizes
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE )
    
    gl.texImage2D( 
        gl.TEXTURE_2D,    // target: you will always want gl.TEXTURE_2D
        0,                // level of detail: 0 is the base
        gl.RGBA,          // internal color format
        1280,             // width
        720,              // height
        0,                // border: always 0
        gl.RGBA,          // color format
        gl.UNSIGNED_BYTE, // type: the type of texture data; 0-255
        null             // pixel source: could also be video or image
    )

    render()
  }

// keep track of time via incremental frame counter
let time = 0
function render() {
    // schedules render to be called the next time the video card requests 
    // a frame of video
    window.requestAnimationFrame( render )

    // update time on CPU and GPU
    time++
    gl.uniform1f( uTime, time )
    
    gl.texSubImage2D( // use this instead of texImage2D again to (try to) fix firefox memory leak
        gl.TEXTURE_2D,    // target: you will always want gl.TEXTURE_2D
        0,                // level of detail: 0 is the base
        0, 0,             // offsets
        gl.RGBA,          // color formats
        gl.UNSIGNED_BYTE, // type: the type of texture data; 0-255
        video             // pixel source: could also be video or image
    )

    // draw triangles using the array buffer from index 0 to 6 (6 is count)
    gl.drawArrays( gl.TRIANGLES, 0, 6)
}