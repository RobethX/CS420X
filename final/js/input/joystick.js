class JoystickController extends InputController {
    constructor() {
        super();
    }
}

class Joystick {
    constructor(id, params = {}) {
        this.id = id;
        this.radius = params.radius || Math.min(Math.max(0.07 * window.innerWidth, 25), 0.1 * window.innerHeight);
        this.radius_inner = params.radius_inner || this.radius - 10;
        this.radius_outer = params.radius_outer || this.radius * 2;
        this.mouse_support = params.mouse_support || true;
        this.touch_support = params.touch_support || true;
        this.pos = params.pos || "bottom-left";

        this.active = false;

        this.init();
    }

    init() {
        this.div = document.createElement("div");
        this.div.className = "joystick-container";
        this.div.id = "joystick-" + this.id;
        this.div.setAttribute("style", "width: " + this.radius_outer * 2 + "px; height: " + this.radius_outer * 2 + "px;");
        this.div.classList.add(this.pos);

        // let base = document.createElement("span");
        // base.className = "joystick-base";
        // // base.setAttribute("style", "left: " + this.radius + "px; top: " + this.radius + "px;"); // "width: " + this.radius * 2 + "px; height: " + this.radius * 2 + "px; \
        // this.div.appendChild(base);

        this.control = document.createElement("span");
        this.control.className = "joystick-control";
        this.control.setAttribute("style", "left: " + this.radius + "px; top: " + this.radius + "px;"); // "width: " + this.radius_inner * 2 + "px; height: " + this.radius_inner * 2 + "px; 
        this.div.appendChild(this.control);

        if (this.mouse_support) {
            this.div.addEventListener("mousedown", this.onStart.bind(this));
            this.div.addEventListener("mouseup", this.onEnd.bind(this));
            this.div.addEventListener("mouseout", this.onEnd.bind(this));
            this.div.addEventListener("mousemove", this.onMouseMove.bind(this));
        }
        
        if (this.touch_support) {
            this.div.addEventListener("touchstart", this.onStart.bind(this));
            this.div.addEventListener("touchend", this.onEnd.bind(this));
            this.div.addEventListener("touchmove", this.onTouchMove.bind(this));
        }

        document.body.appendChild(this.div);
    }

    onStart(e) {
        this.active = true;
        console.debug(e)
        e.preventDefault();
    }

    onEnd(e) {
        this.active = false;
        console.debug(e)
        this.control.style.transform = "translate(0, 0)";
    }

    onTouchMove(e) {
        if (this.active) {
            let touch = e.targetTouches[0];

            let deltaX = touch.clientX - e.currentTarget.offsetLeft - this.radius_outer;
            let deltaY = touch.clientY - e.currentTarget.offsetTop - this.radius_outer;

            let cappedX = Math.min(Math.max(deltaX, -this.radius_outer), this.radius_outer);
            let cappedY = Math.min(Math.max(deltaY, -this.radius_outer), this.radius_outer);

            this.control.style.transform = "translate(" + cappedX + "px, " + cappedY + "px)";
        }
    }

    onMouseMove(e) {
        let deltaX = e.clientX - e.currentTarget.offsetLeft - this.radius_outer;
        let deltaY = e.clientY - e.currentTarget.offsetTop - this.radius_outer;

        let cappedX = Math.min(Math.max(deltaX, -this.radius_outer), this.radius_outer);
        let cappedY = Math.min(Math.max(deltaY, -this.radius_outer), this.radius_outer);

        if (this.active) {
            this.control.style.transform = "translate(" + cappedX + "px, " + cappedY + "px)";
        }

        document.getElementById("debug").innerHTML = "x: " + deltaX + " y: " + deltaY;
    }
}