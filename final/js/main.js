// "global" variables
let gl, uTime, uRes, uResDD, transformFeedback, 
    buffer1, buffer2, simulationPosition, renderPosition,
    textureBack, textureFront, framebuffer,
    simulationProgram, renderProgram,
    dimensions = { width:null, height:null },
    agentCount = 1000,
    pane, params, tab, fAgent, fJoystick, fGamepad, fOrientation,
    cursorPos, joystick, inputPos, uJoystickPos, uRightStickPos

const PRESET = { // default
    speed: 1,
    separation_dist: 1.0,
    cohesion_dist: 5.0,
    alignment_dist: 5.0,
    separation_power: 1.0,
    cohesion_power: 1.0,
    alignment_power: 1.0,
    centering_power: 1.0
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
    debug: "",
}

window.onload = function() {
    const canvas = document.getElementById("gl")
    gl = canvas.getContext("webgl2")
    gl.getExtension("EXT_color_buffer_float");
    // const dim = window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight
    // canvas.width  = dimensions.width  = dim
    // canvas.height = dimensions.height = dim
    canvas.width = dimensions.width = window.innerWidth
    canvas.height = dimensions.height = window.innerHeight

    // define drawing area of canvas. bottom corner, width / height
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

    makeTweakPane()
    makeSimulationPhase()
    makeInteractionPhase()
    makeRenderPhase()
    makeTextures()
    render()
}

function makeTweakPane() {
    params = Object.assign(INPUT_PARAMS, PRESET);

    pane = new Tweakpane.Pane({
        title: "Parameters",
        expanded: true,
    });

    tab = pane.addTab({
        pages: [
            {title: "Simulation"},
            {title: "Input"},
        ]
    });

    fPresets = tab.pages[0].addFolder(({title: "Presets"}));
    fAgent = tab.pages[0].addFolder({title: "Agent"});

    fJoystick = tab.pages[1].addFolder({title: "Virtual Joystick"});
    fGamepad = tab.pages[1].addFolder({title: "Gamepad"});
    fOrientation = tab.pages[1].addFolder({title: "Orientation"});

    fPresets.addButton({
        label: "preset 1",
        title: "Default"
    }).on("click", () => {
        console.info("Loading preset 1")
        pane.importPreset(PRESET);
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

function makeSimulationPhase(){
    makeSimulationShaders()
    makeSimulationBuffer()
    makeSimulationPane()
    makeSimulationUniforms()
}

function makeSimulationShaders() {
    let vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexShader, simulationVertexShaderScript)
    gl.compileShader(vertexShader)

    // create fragment shader
    const simulationFragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(simulationFragmentShader, simulationFragmentShaderScript)
    gl.compileShader(simulationFragmentShader)
    console.log(gl.getShaderInfoLog(simulationFragmentShader))
    
    // create render program that draws to screen
    simulationProgram = gl.createProgram()
    gl.attachShader(simulationProgram, vertexShader)
    gl.attachShader(simulationProgram, simulationFragmentShader)

    transformFeedback = gl.createTransformFeedback()
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback)
    gl.transformFeedbackVaryings(simulationProgram, ["o_vpos"], gl.SEPARATE_ATTRIBS)

    gl.linkProgram(simulationProgram)
    gl.useProgram(simulationProgram)
}

function makeSimulationBuffer() {
    // create a buffer object to store vertices
    buffer1 = gl.createBuffer()
    buffer2 = gl.createBuffer()
  
    // we’re using a vec4
    const agentSize = 4
    const buffer = new Float32Array(agentCount * agentSize)
      
      // set random positions / random headings
    for (let i = 0; i < agentCount * agentSize; i+= agentSize) {
        buffer[i]   = -1 + Math.random() * 2
        buffer[i+1] = -1 + Math.random() * 2
        buffer[i+2] = -1 + Math.random() * 2
        buffer[i+3] = -1 + Math.random() * 2
    }
  
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer1)
  
    gl.bufferData(
        gl.ARRAY_BUFFER, 
        buffer, 
        gl.DYNAMIC_COPY 
   )
  
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer2)
  
    gl.bufferData(gl.ARRAY_BUFFER, agentCount*16, gl.DYNAMIC_COPY)
  
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
}

function makeSimulationPane() {
    const uAgentSpeed = gl.getUniformLocation(simulationProgram, "u_agent_speed");
    gl.uniform1f(uAgentSpeed, params.speed);
    fAgent.addInput(params, "speed", {
        min: 0,
        max: 10,
    }).on("change", e => {
        gl.useProgram(simulationProgram);
        gl.uniform1f(uAgentSpeed, e.value);
    });

    const uSeparationDist = gl.getUniformLocation(simulationProgram, "u_separation_distance");
    gl.uniform1f(uSeparationDist, params.separation_dist);
    fAgent.addInput(params, "separation_dist", {
        min: 0,
        max: 10,
    }).on("change", e => {
        gl.useProgram(simulationProgram);
        gl.uniform1f(uSeparationDist, e.value);
    });

    const uCohesionDist = gl.getUniformLocation(simulationProgram, "u_cohesion_distance");
    gl.uniform1f(uCohesionDist, params.cohesion_dist);
    fAgent.addInput(params, "cohesion_dist", {
        min: 0,
        max: 10,
    }).on("change", e => {
        gl.useProgram(simulationProgram);
        gl.uniform1f(uCohesionDist, e.value);
    });

    const uAlignmentDist = gl.getUniformLocation(simulationProgram, "u_alignment_distance");
    gl.uniform1f(uAlignmentDist, params.alignment_dist);
    fAgent.addInput(params, "alignment_dist", {
        min: 0,
        max: 10,
    }).on("change", e => {
        gl.useProgram(simulationProgram);
        gl.uniform1f(uAlignmentDist, e.value);
    });

    const uSeparationPower = gl.getUniformLocation(simulationProgram, "u_separation_power");
    gl.uniform1f(uSeparationPower, params.separation_power);
    fAgent.addInput(params, "separation_power", {
        min: 0,
        max: 10,
    }).on("change", e => {
        gl.useProgram(simulationProgram);
        gl.uniform1f(uSeparationPower, e.value);
    });

    const uCohesionPower = gl.getUniformLocation(simulationProgram, "u_cohesion_power");
    gl.uniform1f(uCohesionPower, params.cohesion_power);
    fAgent.addInput(params, "cohesion_power", {
        min: 0,
        max: 10,
    }).on("change", e => {
        gl.useProgram(simulationProgram);
        gl.uniform1f(uCohesionPower, e.value);
    });

    const uAlignmentPower = gl.getUniformLocation(simulationProgram, "u_alignment_power");
    gl.uniform1f(uAlignmentPower, params.alignment_power);
    fAgent.addInput(params, "alignment_power", {
        min: 0,
        max: 10,
    }).on("change", e => {
        gl.useProgram(simulationProgram);
        gl.uniform1f(uAlignmentPower, e.value);
    });

    const uCenteringPower = gl.getUniformLocation(simulationProgram, "u_centering_power");
    gl.uniform1f(uCenteringPower, params.centering_power);
    fAgent.addInput(params, "centering_power", {
        min: 0,
        max: 10,
    }).on("change", e => {
        gl.useProgram(simulationProgram);
        gl.uniform1f(uCenteringPower, e.value);
    });
}

function makeSimulationUniforms() {
    uRes = gl.getUniformLocation(simulationProgram, "resolution")
    gl.uniform2f(uRes, gl.drawingBufferWidth, gl.drawingBufferHeight)

    uTime = gl.getUniformLocation(simulationProgram, "time")
    gl.uniform1f(uTime, 0)

    const uCursorPos = gl.getUniformLocation(simulationProgram, "u_cursor_position")
    gl.uniform2f(uCursorPos, 0, 0);
    window.addEventListener("mousemove", e => {
        cursorPos = getMousePos(e, gl.drawingBufferWidth, gl.drawingBufferHeight)
        gl.useProgram(simulationProgram)
        gl.uniform2f(uCursorPos, cursorPos.x, cursorPos.y)
    })

    const uAgentCount = gl.getUniformLocation(simulationProgram, "u_agent_count")
    gl.uniform1i(uAgentCount, agentCount)
     
    // get position attribute location in shader
    simulationPosition = gl.getAttribLocation(simulationProgram, "a_pos")
    // enable the attribute
    gl.enableVertexAttribArray(simulationPosition)

    gl.vertexAttribPointer(simulationPosition, 4, gl.FLOAT, false, 0,0)
}

function makeRenderPhase() {
    makeRenderShaders()
    //makeRenderPane()
    makeRenderUniforms()
}

function makeRenderShaders() {
    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, renderVertexShaderScript);
    gl.compileShader(vertexShader);

    // create fragment shader
    const drawFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(drawFragmentShader, renderFragmentShaderScript);
    gl.compileShader(drawFragmentShader);
    console.log(gl.getShaderInfoLog(drawFragmentShader));

    // create shader program  
    renderProgram = gl.createProgram();
    gl.attachShader(renderProgram, vertexShader);
    gl.attachShader(renderProgram, drawFragmentShader);
    
    gl.linkProgram(renderProgram);
    gl.useProgram(renderProgram);
}

function makeRenderUniforms() {
    uRes = gl.getUniformLocation(renderProgram, "resolution");
    gl.uniform2f(uRes, dimensions.width, dimensions.height);

    renderPosition = gl.getAttribLocation(renderProgram, "a_pos");
    gl.enableVertexAttribArray(renderPosition);
    gl.vertexAttribPointer(renderPosition, 4, gl.FLOAT, false, 0, 0);
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
    startGyroscope();
    // startMagnetometer();
    //startOrientationSensor();
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

    fOrientation.addMonitor(params, "debug");
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

    if (gyroscope) {
        let gx = gyroscope.x || 0;
        let gy = gyroscope.y || 0;
        let gz = gyroscope.z || 0;

        params.debug = gx + " " + gy + " " + gz;
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
    gl.bindTexture(gl.TEXTURE_2D, textureBack)
    
    // these two lines are needed for non-power-of-2 textures
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    
    // how to map when texture element is less than one pixel
    // use gl.NEAREST to avoid linear interpolation
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    // how to map when texture element is more than one pixel
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    
    // specify texture format, see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, agentCount, 1, 0, gl.RGBA, gl.FLOAT, (new Float32Array(agentCount * 4)));

    textureFront = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, textureFront)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, agentCount, 1, 0, gl.RGBA, gl.FLOAT, (new Float32Array(agentCount * 4)));
    
    // Create a framebuffer and attach the texture.
    framebuffer = gl.createFramebuffer()
}

let time = 0
function render() {
    window.requestAnimationFrame(render)

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // TODO: update character
    inputLoop();

    /* AGENT-BASED SIMULATION */
    gl.useProgram(simulationProgram)

    // update time on CPU and GPU
    time++
    gl.uniform1f(uTime, time)

    gl.viewport(0, 0, agentCount, 1);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)

    // use the framebuffer to write to our textureFront texture
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureFront, 0)

    gl.activeTexture(gl.TEXTURE0)
    // read from textureBack in our shaders
    gl.bindTexture(gl.TEXTURE_2D, textureBack)

    // bind our array buffer of agents
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer1)
    gl.vertexAttribPointer(simulationPosition, 4, gl.FLOAT, false, 0, 0)
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffer2)
    
    gl.beginTransformFeedback(gl.POINTS)  
    gl.drawArrays(gl.POINTS, 0, agentCount)
    gl.endTransformFeedback()
    /* END Agent-based simulation */

    /* COPY TO SCREEN */
    // use the default framebuffer object by passing null
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

    //gl.bindTexture(gl.TEXTURE_2D, textureFront)

    // use our render shader
    gl.useProgram(renderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer1);
    gl.vertexAttribPointer(renderPosition, 4, gl.FLOAT, false, 0, 0);

    // put simulation on screen
    gl.drawArrays(gl.POINTS, 0, agentCount);
    
    /* END COPY TO SCREEN */

    /* SWAP */
    let tmp = buffer1;  buffer1 = buffer2;  buffer2 = tmp;
    let _tmp = textureFront; textureFront = textureBack; textureBack = _tmp;
}