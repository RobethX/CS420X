const PARAMS = {
    options: {
        var1: 1,
        var2: "#AAAFFF",
        var3: 0.5,
    },
    controller: {
        leftStick: 0,
        inputs: "",
    }
};

const pane = new Tweakpane.Pane();

pane.folders = {};

// Options

pane.folders.options = pane.addFolder({
    title: "options",
    expanded: true,
});

pane.folders.options.addInput(PARAMS.options, "var1");
pane.folders.options.addInput(PARAMS.options, "var2");
pane.folders.options.addInput(PARAMS.options, "var3");

// Controller

// pane.folders.controller = pane.addFolder({
//     title: "controller",
//     expanded: true,
//     hidden: true,
// });


// pane.folders.controller.addMonitor(PARAMS.controller, "leftStick", {
//     view: "graph",
//     min: -1,
//     max: +1,
// });

// pane.folders.controller.addMonitor(PARAMS.controller, "inputs", {
//     multiLine: true,
//     lineCount: 3,
// });