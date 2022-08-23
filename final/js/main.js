// "global" variables
let gl, uTime, uRes, uResDD, transformFeedback, 
    buffer1, buffer2, simulationPosition, copyPosition, ddPosition,
    textureBack, textureFront, framebuffer,
    copyProgram, simulationProgram, ddProgram, quad, pane,
    dimensions = { width:null, height:null },
    agentCount = 1000000,
    params, tab, fSensor, fAgent, fChemical, fJoystick, fGamepad, fOrientation,
    cursorPos, joystick, inputPos, uJoystickPos, uRightStickPos

const PRESET_1 = { // default
    distance: 9,
    sweep: 0.5,
    size: 1,
    opacity: 0.1,
    speed: 1,
    rotate: 1,
    strength: 0.9,
};

const PRESET_2 = { // smoke
    distance: 5,
    sweep: 0.5,
    size: 1.25,
    opacity: 0.15,
    speed: 5,
    rotate: 0.35,
    strength: 0.3,
};

const PRESET_3 = { // coral
    distance: 3,
    sweep: 0,
    size: 1,
    opacity: 0.1,
    speed: 8.5,
    rotate: 1.65,
    strength: 0.5,
};

const PRESET_4 = { // sand
    distance: 15,
    sweep: 0.85,
    size: 0.01,
    opacity: 0.75,
    speed: 3.25,
    rotate: 0.2,
    strength: 0.01,
};

var INPUT_PARAMS = {
    joystick: false,
    joystick_x: 0,
    joystick_y: 0,
    gamepad: -1,
    gamepad_x: 0,
    gamepad_y: 0,
    accelerometer: false,
    gyroscope: false,
    magnetometer: false,
}

window.onload = function() {
    const canvas = document.getElementById( 'gl' )
    gl = canvas.getContext( 'webgl2' )
    // const dim = window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight
    // canvas.width  = dimensions.width  = dim
    // canvas.height = dimensions.height = dim
    canvas.width = dimensions.width = window.innerWidth
    canvas.height = dimensions.height = window.innerHeight

    // define drawing area of canvas. bottom corner, width / height
    gl.viewport( 0,0,gl.drawingBufferWidth, gl.drawingBufferHeight )

    makeTweakPane()
    makeCopyPhase()
    makeSimulationPhase()
    makeDecayDiffusePhase()
    makeInteractionPhase()
    makeTextures()
    render()
}

function makeTweakPane() {
    params = Object.assign(INPUT_PARAMS, PRESET_2); // use smoke by default

    pane = new Tweakpane.Pane({
        title: "Parameters",
        expanded: true,
    });

    tab = pane.addTab({
        pages: [
            {title: "Input"},
            {title: "Simulation"},
        ]
    });

    fJoystick = tab.pages[0].addFolder({title: "Virtual Joystick"});
    fGamepad = tab.pages[0].addFolder({title: "Gamepad"});
    fOrientation = tab.pages[0].addFolder({title: "Orientation"});

    fPresets = tab.pages[1].addFolder(({title: "Presets"}));
    fSensor = tab.pages[1].addFolder({title: "Sensor"});
    fAgent = tab.pages[1].addFolder({title: "Agent"});
    fChemical = tab.pages[1].addFolder({title: "Chemical"});

    fPresets.addButton({
        label: "preset 1",
        title: "Default"
    }).on("click", () => {
        console.info("Loading preset 1")
        pane.importPreset(PRESET_1);
    });

    fPresets.addButton({
        label: "preset 2",
        title: "Smoke"
    }).on("click", () => {
        console.info("Loading preset 2")
        pane.importPreset(PRESET_2);
    });

    fPresets.addButton({
        label: "preset 3",
        title: "Coral"
    }).on("click", () => {
        console.info("Loading preset 3")
        pane.importPreset(PRESET_3);
    });

    fPresets.addButton({
        label: "preset 4",
        title: "Sand"
    }).on("click", () => {
        console.info("Loading preset 4")
        pane.importPreset(PRESET_4);
    });

    fPresets.addSeparator();

    fPresets.addButton({
        title: "Export Preset to Console"
    }).on("click", () => {
        let preset = pane.exportPreset();
        console.log(preset);
    });

    pane.addButton({
        title: "Reset Simulation",
    }).on("click", () => {
        makeSimulationBuffer();
    });
}

function makeCopyPhase() {
    makeCopyShaders()
    quad = makeCopyBuffer()
    makeCopyUniforms()
}

function makeCopyShaders() {
    let shaderScript = document.getElementById('copyVertex')
    let shaderSource = shaderScript.text
    let vertexShader = gl.createShader( gl.VERTEX_SHADER )
    gl.shaderSource( vertexShader, shaderSource )
    gl.compileShader( vertexShader )

    // create fragment shader
    shaderScript = document.getElementById('copyFragment')
    shaderSource = shaderScript.text
    const drawFragmentShader = gl.createShader( gl.FRAGMENT_SHADER )
    gl.shaderSource( drawFragmentShader, shaderSource )
    gl.compileShader( drawFragmentShader )
    console.log( gl.getShaderInfoLog(drawFragmentShader) )

    // create shader program  
    copyProgram = gl.createProgram()
    gl.attachShader( copyProgram, vertexShader )
    gl.attachShader( copyProgram, drawFragmentShader )
    
    gl.linkProgram( copyProgram )
    gl.useProgram( copyProgram )
}

function makeCopyBuffer() {
    // create a buffer object to store vertices
    const buffer = gl.createBuffer()

    // point buffer at graphic context's ARRAY_BUFFER
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer )

    const triangles = new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1
    ])

    // initialize memory for buffer and populate it. Give
    // open gl hint contents will not change dynamically.
    gl.bufferData( gl.ARRAY_BUFFER, triangles, gl.STATIC_DRAW )

    return buffer
}

function makeCopyUniforms() {
    uRes = gl.getUniformLocation( copyProgram, 'resolution' )
    gl.uniform2f( uRes, dimensions.width, dimensions.height )

    // get position attribute location in shader
    copyPosition = gl.getAttribLocation( copyProgram, 'a_pos' )
    // enable the attribute
    gl.enableVertexAttribArray( copyPosition )
    // this will point to the vertices in the last bound array buffer.
    // In this example, we only use one array buffer, where we're storing 
    // our vertices. Each vertex will have to floats (one for x, one for y)
    gl.vertexAttribPointer( copyPosition, 2, gl.FLOAT, false, 0,0 )
}

function makeSimulationPhase(){
    makeSimulationShaders()
    makeSimulationBuffer()
    makeSimulationPane()
    makeSimulationUniforms()
}

function makeSimulationShaders() {
    let shaderScript = document.getElementById('simulationVertex')
    let shaderSource = shaderScript.text
    let vertexShader = gl.createShader( gl.VERTEX_SHADER )
    gl.shaderSource( vertexShader, shaderSource )
    gl.compileShader( vertexShader )

    // create fragment shader
    shaderScript = document.getElementById('simulationFragment')
    shaderSource = shaderScript.text
    const simulationFragmentShader = gl.createShader( gl.FRAGMENT_SHADER )
    gl.shaderSource( simulationFragmentShader, shaderSource )
    gl.compileShader( simulationFragmentShader )
    console.log( gl.getShaderInfoLog(simulationFragmentShader) )
    
    // create render program that draws to screen
    simulationProgram = gl.createProgram()
    gl.attachShader( simulationProgram, vertexShader )
    gl.attachShader( simulationProgram, simulationFragmentShader )

    transformFeedback = gl.createTransformFeedback()
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback)
    gl.transformFeedbackVaryings( simulationProgram, ["o_vpos"], gl.SEPARATE_ATTRIBS )

    gl.linkProgram( simulationProgram )
    gl.useProgram(  simulationProgram )
}

function makeSimulationBuffer() {
    // create a buffer object to store vertices
    buffer1 = gl.createBuffer()
    buffer2 = gl.createBuffer()
  
    // we’re using a vec4
    const agentSize = 4
    const buffer = new Float32Array( agentCount * agentSize )
      
      // set random positions / random headings
    for (let i = 0; i < agentCount * agentSize; i+= agentSize ) {
        buffer[i]   = -1 + Math.random() * 2
        buffer[i+1] = -1 + Math.random() * 2
        buffer[i+2] = Math.random()
        buffer[i+3] = Math.random()
    }
  
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer1 )
  
    gl.bufferData( 
        gl.ARRAY_BUFFER, 
        buffer, 
        gl.DYNAMIC_COPY 
    )
  
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer2 )
  
    gl.bufferData( gl.ARRAY_BUFFER, agentCount*16, gl.DYNAMIC_COPY )
  
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
}

function makeSimulationPane() {
    const uSensorDistance = gl.getUniformLocation(simulationProgram, "u_sensor_distance");
    gl.uniform1f(uSensorDistance, params.distance);
    fSensor.addInput(params, "distance", {
        min: 0,
        max: 15,
        step: 0.25,
    }).on("change", e => {
        gl.useProgram(simulationProgram);
        gl.uniform1f(uSensorDistance, e.value);
    });

    const uSensorSweep = gl.getUniformLocation(simulationProgram, "u_sensor_sweep");
    gl.uniform1f(uSensorSweep, params.sweep);
    fSensor.addInput(params, "sweep", {
        min: 0,
        max: 1,
    }).on("change", e => {
        gl.useProgram(simulationProgram);
        gl.uniform1f(uSensorSweep, e.value);
    });

    const uAgentSize = gl.getUniformLocation(simulationProgram, "u_agent_size");
    gl.uniform1f(uAgentSize, params.size);
    fAgent.addInput(params, "size", {
        min: 0.01,
        max: 2,
    }).on("change", e => {
        gl.useProgram(simulationProgram);
        gl.uniform1f(uAgentSize, e.value);
    });

    /*
    const uAgentColor = gl.getUniformLocation(simulationProgram, "u_agent_color");
    gl.uniform3f(uAgentColor, ...hex2rgb(params.color));
    fAgent.addInput(params, "color", {type: "color",}).on("change", e => {
        gl.useProgram(simulationProgram);
        gl.uniform3f(uAgentColor, ...hex2rgb(e.value));
    });
    */

    const uAgentOpacity = gl.getUniformLocation(simulationProgram, "u_agent_opacity");
    gl.uniform1f(uAgentOpacity, params.opacity);
    fAgent.addInput(params, "opacity", {
        min: 0,
        max: 1,
    }).on("change", e => {
        gl.useProgram(simulationProgram);
        gl.uniform1f(uAgentOpacity, e.value);
    });

    const uAgentSpeed = gl.getUniformLocation(simulationProgram, "u_agent_speed");
    gl.uniform1f(uAgentSpeed, params.speed);
    fAgent.addInput(params, "speed", {
        min: 0,
        max: 10,
    }).on("change", e => {
        gl.useProgram(simulationProgram);
        gl.uniform1f(uAgentSpeed, e.value);
    });

    const uAgentRotate = gl.getUniformLocation(simulationProgram, "u_agent_rotate");
    gl.uniform1f(uAgentRotate, params.rotate);
    fAgent.addInput(params, "rotate", {
        min: 0,
        max: 2,
    }).on("change", e => {
        gl.useProgram(simulationProgram);
        gl.uniform1f(uAgentRotate, e.value);
    });
}

function makeSimulationUniforms() {
    uRes = gl.getUniformLocation( simulationProgram, 'resolution' )
    gl.uniform2f( uRes, gl.drawingBufferWidth, gl.drawingBufferHeight )

    uTime = gl.getUniformLocation( simulationProgram, "time")
    gl.uniform1f( uTime, 0 )

    const uCursorPos = gl.getUniformLocation(simulationProgram, "u_cursor_position")
    gl.uniform2f(uCursorPos, 0, 0);
    window.addEventListener("mousemove", e => {
        cursorPos = getMousePos(e, gl.drawingBufferWidth, gl.drawingBufferHeight)
        gl.useProgram(simulationProgram)
        gl.uniform2f(uCursorPos, cursorPos.x, cursorPos.y)
    })
     
    // get position attribute location in shader
    simulationPosition = gl.getAttribLocation( simulationProgram, 'a_pos' )
    // enable the attribute
    gl.enableVertexAttribArray( simulationPosition )

    gl.vertexAttribPointer( simulationPosition, 4, gl.FLOAT, false, 0,0 )
}

function makeDecayDiffusePhase() {
    makeDecayDiffuseShaders()
    makeDecayDiffusePane()
    makeDecayDiffuseUniforms()
}

function makeDecayDiffuseShaders() {
    let shaderScript = document.getElementById('copyVertex')
    let shaderSource = shaderScript.text
    let vertexShader = gl.createShader( gl.VERTEX_SHADER )
    gl.shaderSource( vertexShader, shaderSource )
    gl.compileShader( vertexShader )

    // create fragment shader
    shaderScript = document.getElementById('ddFragment')
    shaderSource = shaderScript.text
    const drawFragmentShader = gl.createShader( gl.FRAGMENT_SHADER )
    gl.shaderSource( drawFragmentShader, shaderSource )
    gl.compileShader( drawFragmentShader )
    console.log( gl.getShaderInfoLog(drawFragmentShader) )

    // create shader program  
    ddProgram = gl.createProgram()
    gl.attachShader( ddProgram, vertexShader )
    gl.attachShader( ddProgram, drawFragmentShader )

    gl.linkProgram( ddProgram )
    gl.useProgram( ddProgram )
}

function makeDecayDiffusePane() {
    const uChemicalStrength = gl.getUniformLocation(ddProgram, "u_chemical_strength");
    gl.uniform1f(uChemicalStrength, params.strength);
    fChemical.addInput(params, "strength", {
        min: 0.01,
        max: 1,
    }).on("change", e => {
        gl.useProgram(ddProgram);
        gl.uniform1f(uChemicalStrength, e.value);
    });

    /*
    const uChemicalColor = gl.getUniformLocation(ddProgram, "u_chemical_color");
    gl.uniform3f(uChemicalColor, ...hex2rgb(params.color));
    fChemical.addInput(params, "color", {type: "color",}).on("change", e => {
        gl.useProgram(ddProgram);
        gl.uniform3f(uChemicalColor, ...hex2rgb(e.value));
    });
    */
}

function makeDecayDiffuseUniforms() {
    uResDD = gl.getUniformLocation( ddProgram, 'resolution' )
    gl.uniform2f( uResDD, dimensions.width, dimensions.height )
  
    // get position attribute location in shader
    ddPosition = gl.getAttribLocation( ddProgram, 'a_pos' )
    // enable the attribute
    gl.enableVertexAttribArray( copyPosition )
    // this will point to the vertices in the last bound array buffer.
    // In this example, we only use one array buffer, where we're storing 
    // our vertices. Each vertex will have to floats (one for x, one for y)
    gl.vertexAttribPointer( copyPosition, 2, gl.FLOAT, false, 0,0 )
}

function makeInteractionPhase() {
    makeInputController();
    makeJoystickPane();
    makeGamepadPane();
    makeOrientationPane();
}

function makeInputController() {
    gl.useProgram(simulationProgram)
    uJoystickPos = gl.getUniformLocation(simulationProgram, "u_joystick_position");
    gl.uniform2f(uJoystickPos, 0, 0);

    joystick = new Joystick(0, {callback: function(joystick, x, y) {
        params.joystick_x = x;
        params.joystick_y = -y;
        inputPos = {x: x, y: -y};

        gl.useProgram(simulationProgram)
        gl.uniform2f(uJoystickPos, inputPos.x, inputPos.y)
    }});

    joystick.toggle(); // DEBUG: start with joystick hidden

    uRightStickPos = gl.getUniformLocation(simulationProgram, "u_right_stick_position");
    gl.uniform2f(uRightStickPos, 0, 0);

    // startAccelerometer();
    // startGyroscope();
    // startMagnetometer();
    startOrientationSensor();
}

function makeJoystickPane() {
    fJoystick.addInput(params, "joystick", {
        label: "virtual joystick"
    }).on("change", () => {
            console.info("joystick: " + params.joystick)
            joystick.toggle();
    });

    fJoystick.addMonitor(params, "joystick_x", {
        //view: "graph",
        min: -1,
        max: 1
    });

    fJoystick.addMonitor(params, "joystick_y", {
        //view: "graph",
        min: -1,
        max: 1
    });
}

function makeGamepadPane() {
    fGamepad.addButton({
        title: "Cycle Gamepad"
    }).on("click", () => {
        if (gamepads.length > 0) {
            active_gamepad = (active_gamepad + 1) % gamepads.length;
            params.gamepad = active_gamepad;
        }
    });

    fGamepad.addMonitor(params, "gamepad");

    fGamepad.addMonitor(params, "gamepad_x", {
        min: -1,
        max: 1
    });

    fGamepad.addMonitor(params, "gamepad_y", {
        min: -1,
        max: 1
    });
}

function makeOrientationPane() {
    fOrientation.addInput(params, "accelerometer").on("change", () => {
        console.info("accelerometer: " + params.accelerometer)
    });

    fOrientation.addInput(params, "gyroscope").on("change", () => {
        console.info("gyroscope: " + params.gyroscope)
    });

    fOrientation.addInput(params, "magnetometer").on("change", () => {
        console.info("magnetometer: " + params.magnetometer)
    });
}

function inputLoop() {
    let gp = controllerLoop();
    if (gp) {
        if (gp.axes.length >= 2) {
            params.gamepad_x = gp.axes[0] || params.gamepad_x;
            params.gamepad_y = -gp.axes[1] || params.gamepad_y;
            inputPos = {x: gp.axes[0], y: -gp.axes[1]} // TODO: prevent this from overwriting the joystick input

            gl.useProgram(simulationProgram)
            gl.uniform2f(uJoystickPos, inputPos.x, inputPos.y)

            if (gp.axes.length >= 4) {
                gl.uniform2f(uRightStickPos, gp.axes[2], -gp.axes[3]);
            }
        }
    }
}

function hex2rgb(hex) {
    let validator = /^#?[0-9A-F]{6}$/i // regex pattern for validating hex colors

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

function getMousePos(event, width, height) { // normalize cursor coordinates
    return {
        x: (event.clientX / width),
        y: 1-(event.clientY / height),
    }
}

function makeTextures() {
    textureBack = gl.createTexture()
    gl.bindTexture( gl.TEXTURE_2D, textureBack )
    
    // these two lines are needed for non-power-of-2 textures
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE )
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE )
    
    // how to map when texture element is less than one pixel
    // use gl.NEAREST to avoid linear interpolation
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST )
    // how to map when texture element is more than one pixel
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    
    // specify texture format, see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, dimensions.width, dimensions.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null )

    textureFront = gl.createTexture()
    gl.bindTexture( gl.TEXTURE_2D, textureFront )
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE )
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE )
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST )
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST )
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, dimensions.width, dimensions.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null )

    // Create a framebuffer and attach the texture.
    framebuffer = gl.createFramebuffer()
}

let time = 0
function render() {
    window.requestAnimationFrame( render )

    // TODO: update character
    inputLoop();

    /* AGENT-BASED SIMULATION */
    gl.useProgram( simulationProgram )

    // update time on CPU and GPU
    time++
    gl.uniform1f( uTime, time )

    gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer )

    // use the framebuffer to write to our textureFront texture
    gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureFront, 0 )

    gl.activeTexture( gl.TEXTURE0 )
    // read from textureBack in our shaders
    gl.bindTexture( gl.TEXTURE_2D, textureBack )

    // bind our array buffer of agents
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer1 )
    gl.vertexAttribPointer( simulationPosition, 4, gl.FLOAT, false, 0,0 )
    gl.bindBufferBase( gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffer2 )
    
    gl.beginTransformFeedback( gl.POINTS )  
    gl.drawArrays( gl.POINTS, 0, agentCount )
    gl.endTransformFeedback()
    /* END Agent-based simulation */

    /* SWAP */
    let _tmp = textureFront
    textureFront = textureBack
    textureBack = _tmp

    /* Decay / Diffuse */
    gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureFront, 0 )

    gl.activeTexture( gl.TEXTURE0 )
    gl.bindTexture(   gl.TEXTURE_2D, textureBack )

    gl.useProgram( ddProgram )

    gl.bindBuffer( gl.ARRAY_BUFFER, quad )
    gl.vertexAttribPointer( ddPosition, 2, gl.FLOAT, false, 0,0 )

    gl.drawArrays( gl.TRIANGLES, 0, 6 )
    /* END Decay / Diffuse */

    /* COPY TO SCREEN */
    // use the default framebuffer object by passing null
    gl.bindFramebuffer( gl.FRAMEBUFFER, null )
    gl.viewport( 0,0,gl.drawingBufferWidth, gl.drawingBufferHeight )

    gl.bindTexture( gl.TEXTURE_2D, textureFront )

    // use our drawing (copy) shader
    gl.useProgram( copyProgram )

    gl.bindBuffer( gl.ARRAY_BUFFER, quad )
    gl.vertexAttribPointer( copyPosition, 2, gl.FLOAT, false, 0,0 )

    // put simulation on screen
    gl.drawArrays( gl.TRIANGLES, 0, 6 )
    
    /* END COPY TO SCREEN */

    // because we copied texture A over to texture B we don't
    // need to do a swap  
    let tmp = buffer1;  buffer1 = buffer2;  buffer2 = tmp;
}