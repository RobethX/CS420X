var gamepads = [];

function buttonPressed(b) {
    if (typeof(b) == "object") {
        return b.pressed;
    }
    return b == 1.0;
}

function controllerLoop() {
    if (!gamepads || gamepads.length < 1) { // Return if no gamepads connected
        return
    }

    gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []); // update

    

    var gp = gamepads[0]; // Only use the first gamepad
    //TODO: implement multiple gamepads
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
        console.log(`Gamepad ${gamepad.index} connected: ${gamepad.id} with ${gamepad.buttons.length} buttons and ${gamepad.axes.length} axes.`)
    } else {
        delete gamepads[gamepad.index];
        console.log(`Gamepad ${gamepad.index} disconnected: ${gamepad.id}.`)
    }

    if (pane) {
        //controllerPane(gamepad, connected);
    }
}

window.addEventListener("gamepadconnected", function(e) { gamepadHandler(e, true); }, false);
window.addEventListener("gamepaddisconnected", function(e) { gamepadHandler(e, false); }, false);