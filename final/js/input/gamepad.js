var gamepads = [];
let active_gamepad = null;

function buttonPressed(b) {
    if (typeof(b) == "object") {
        return b.pressed;
    }
    return b == 1.0;
}

function controllerLoop() {
    gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []); // update
    gamepads = gamepads.filter(gp => gp); // filter out disconnected gamepads

    if (!gamepads || gamepads.length < 1) { // Return if no gamepads connected
        return null
    }

    var gp = gamepads[active_gamepad];

    return gp;
}

function controllerPane(gamepad, connected) {
    if (connected) {
        if (!pane.folders.controller) {
            pane.folders.controller = pane.addFolder({
                title: "controller",
                expanded: true,
            });

            pane.folders.controller.addMonitor(gamepads[0].axes, 0, {
                label: "axes",
                view: "graph",
                min: -1,
                max: +1
            });
        }
    } else {
        //pane.remove(pane.folders.controller.tab)
        if (gamepads.length < 1) {
            pane.remove(pane.folders.controller)
        }
    }
}

function gamepadHandler(event, connected) {
    var gamepad = event.gamepad;

    if (connected) {
        gamepads[gamepad.index] = gamepad;
        active_gamepad = gamepad.index;
        console.log(`Gamepad ${gamepad.index} connected: ${gamepad.id} with ${gamepad.buttons.length} buttons and ${gamepad.axes.length} axes.`)
    } else {
        delete gamepads[gamepad.index];
        active_gamepad = gamepads.length > 0 ? gamepads[0].index : null;
        console.log(`Gamepad ${gamepad.index} disconnected: ${gamepad.id}.`)
    }

    if (pane) {
        params.gamepad = active_gamepad; // DEBUG: stupid
    }
}

window.addEventListener("gamepadconnected", function(e) { gamepadHandler(e, true); }, false);
window.addEventListener("gamepaddisconnected", function(e) { gamepadHandler(e, false); }, false);