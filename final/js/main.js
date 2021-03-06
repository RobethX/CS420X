// "global" variables
let gl, uTime

window.onload = function() {
    const canvas = document.getElementById( 'gl' )
    gl = canvas.getContext( 'webgl' )
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // define drawing area of canvas. bottom corner, width / height
    gl.viewport( 0,0,gl.drawingBufferWidth, gl.drawingBufferHeight )

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
    let shaderScript = document.getElementById('vertex')
    let shaderSource = shaderScript.text
    const vertexShader = gl.createShader( gl.VERTEX_SHADER )
    gl.shaderSource( vertexShader, shaderSource );
    gl.compileShader( vertexShader )

    // create fragment shader
    shaderScript = document.getElementById('fragment')
    shaderSource = shaderScript.text
    const fragmentShader = gl.createShader( gl.FRAGMENT_SHADER )
    gl.shaderSource( fragmentShader, shaderSource );
    gl.compileShader( fragmentShader )

    // create shader program
    const program = gl.createProgram()
    gl.attachShader( program, vertexShader )
    gl.attachShader( program, fragmentShader )
    gl.linkProgram( program )
    gl.useProgram( program )

    /* ALL ATTRIBUTE/UNIFORM INITIALIZATION MUST COME AFTER 
    CREATING/LINKING/USING THE SHADER PROGAM */

    // find a pointer to the uniform "time" in our fragment shader
    uTime = gl.getUniformLocation( program, 'time' ) 
    const uRes = gl.getUniformLocation( program, 'resolution' )
    gl.uniform2f( uRes, window.innerWidth, window.innerHeight )

    // get position attribute location in shader
    const position = gl.getAttribLocation( program, 'a_position' )
    // enable the attribute
    gl.enableVertexAttribArray( position )
    // this will point to the vertices in the last bound array buffer.
    // In this example, we only use one array buffer, where we're storing 
    // our vertices
    gl.vertexAttribPointer( position, 2, gl.FLOAT, false, 0,0 )

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

    // draw triangles using the array buffer from index 0 to 6 (6 is count)
    gl.drawArrays( gl.TRIANGLES, 0, 6 )

    controllerLoop();
}