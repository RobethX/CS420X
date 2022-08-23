class JoystickController extends InputController {
    constructor() {
        super();

        this.left_joystick = new Joystick(0, {pos: "bottom-left", callback: this.onJoystickMove.bind(this)});
        this.right_joystick = new Joystick(1, {pos: "bottom-right", callback: this.onJoystickMove.bind(this)});
    }

    onJoystickMove(joystick, x, y) {
        //console.log(`Joystick ${joystick.id} moved to ${x}, ${y}`);
        if (joystick == this.left_joystick) {
            this.left_x = x;
            this.left_y = y;
            //console.log(`left joystick: ${x}, ${y}`);
        } else if (joystick == this.right_joystick) {
            this.right_x = x;
            this.right_y = y;
            //console.log(`right joystick: ${x}, ${y}`);
        }
    }
}

class Joystick {
    constructor(id, params = {}) {
        this.id = id;
        this.radius = params.radius || Math.min(Math.max(0.05 * window.innerWidth, 25), 0.1 * window.innerHeight);
        this.radius_inner = params.radius_inner || this.radius - 10;
        this.radius_outer = params.radius_outer || this.radius * 2;
        this.mouse_support = params.mouse_support || true;
        this.touch_support = params.touch_support || true;
        this.pos = params.pos || "bottom-left";
        this.callback = params.callback || function() {};

        this.hidden = false;
        this.active = false;
        this.x = 0.0;
        this.y = 0.0;

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
        e.preventDefault();
    }

    onEnd(e) {
        this.active = false;
        this.control.style.transform = "translate(0, 0)";
        this.x = 0;
        this.y = 0;
        this.callback(this, this.x, this.y);
    }

    onTouchMove(e) {
        if (this.active) {
            let touch = e.targetTouches[0];

            let deltaX = touch.clientX - e.currentTarget.offsetLeft - this.radius_outer;
            let deltaY = touch.clientY - e.currentTarget.offsetTop - this.radius_outer;

            this.move(deltaX, deltaY);
        }
    }

    onMouseMove(e) {
        if (this.active) {
            let deltaX = e.clientX - e.currentTarget.offsetLeft - this.radius_outer;
            let deltaY = e.clientY - e.currentTarget.offsetTop - this.radius_outer;

            this.move(deltaX, deltaY);
        }
    }

    move(deltaX, deltaY) {
        let cappedX = Math.min(Math.max(deltaX, -this.radius_outer), this.radius_outer);
        let cappedY = Math.min(Math.max(deltaY, -this.radius_outer), this.radius_outer);

        this.control.style.transform = "translate(" + cappedX + "px, " + cappedY + "px)";

        this.x = cappedX / this.radius_outer;
        this.y = cappedY / this.radius_outer;

        this.callback(this, this.x, this.y);
        return {x: this.x, y: this.y};
    }

    toggle() { // TODO: only show on touch devices
        this.hidden = !this.hidden;
        this.div.classList.toggle("hidden");
        
        // if (this.hidden) {
        //     this.div.classList.add("hidden");
        // } else {
        //     this.div.classList.remove("hidden");
        // }
    }
}