let accelerometer = null;
let gyroscope = null;
let magnetometer = null;
let sensor = null;

function startAccelerometer() {
    try {
        accelerometer = new Accelerometer();

        accelerometer.addEventListener("reading", () => {
            console.log(accelerometer.x, accelerometer.y, accelerometer.z);
        });

        accelerometer.addEventListener("error", (e) => {
            if (e.error.name === "NotAllowedError") {
                navigator.permissions.query("accelerometer").then(result => {
                    if (result.state === "denied") {
                        console.log("Accelerometer access denied.");
                    }
                });
            } else if (e.error.name === "NotReadableError") {
                console.log("Accelerometer is not available.");
            }
        });

        accelerometer.start();
    } catch (e) {
        if (e.name === "SecurityError") {
            console.log("Accelerometer construction was blocked by a feature policy.");
        } else if (error.name === "ReferenceError") {
            console.log("Accelerometer is not supported by the User Agent.");
        } else {
            console.error(e);
        }
    }
}

function startGyroscope() {
    try {
        gyroscope = new Gyroscope();

        gyroscope.addEventListener("reading", () => {
            console.log(gyroscope.x, gyroscope.y, gyroscope.z);
        });

        gyroscope.addEventListener("error", (e) => {
            if (e.error.name === "NotAllowedError") {
                navigator.permissions.query("gyroscope").then(result => {
                    if (result.state === "denied") {
                        console.log("Gyroscope access denied.");
                    }
                });
            } else if (e.error.name === "NotReadableError") {
                console.log("Gyroscope is not available.");
            }
        });

        gyroscope.start();
    } catch (e) {
        if (e.name === "SecurityError") {
            console.log("Gyroscope construction was blocked by a feature policy.");
        } else if (error.name === "ReferenceError") {
            console.log("Gyroscope is not supported by the User Agent.");
        } else {
            console.error(e);
        }
    }
}

function startMagnetometer() {
    try {
        magnetometer = new Magnetometer();

        magnetometer.addEventListener("reading", () => {
            console.log(magnetometer.x, magnetometer.y, magnetometer.z);
        });

        magnetometer.addEventListener("error", (e) => {
            if (e.error.name === "NotAllowedError") {
                navigator.permissions.query("magnetometer").then(result => {
                    if (result.state === "denied") {
                        console.log("Magnetometer access denied.");
                    }
                });
            } else if (e.error.name === "NotReadableError") {
                console.log("Magnetometer is not available.");
            }
        });

        magnetometer.start();
    } catch (e) {
        if (e.name === "SecurityError") {
            console.log("Magnetometer construction was blocked by a feature policy.");
        } else if (error.name === "ReferenceError") {
            console.log("Magnetometer is not supported by the User Agent.");
        } else {
            console.error(e);
        }
    }
}

function startOrientationSensor() {
    try {
        sensor = new AbsoluteOrientationSensor();

        sensor.addEventListener("reading", () => {
            console.log(sensor.alpha, sensor.beta, sensor.gamma);
        })

        accelerometer.addEventListener("error", (e) => {
            if (e.error.name === "NotAllowedError") {
                Promise.all([
                    navigator.permissions.query("accelerometer"),
                    navigator.permissions.query("gyroscope"),
                    navigator.permissions.query("magnometer")
                ]).then(result => {
                    if (result.state === "denied") {
                        console.log("Orientation access denied.");
                    }
                });
            } else if (e.error.name === "NotReadableError") {
                console.log("Orientation is not available.");
            }
        });
        
        sensor.start();
    } catch (e) {
        if (e.name === "SecurityError") {
            console.log("Absolute Orientation Sensor construction was blocked by a feature policy.");
        } else if (error.name === "ReferenceError") {
            console.log("Absolute Orientation Sensor is not supported by the User Agent.");
        } else {
            console.error(e);
        }
    }
}