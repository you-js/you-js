class InputEvent {

    type = null;
    propagationToParent = true;
    propagationToChild = true;

    constructor({ type }={}) {
        this.type = type;
    }

    static create(type, event) {
        const inputEvent = new InputEvent(type);

        if (type === 'mousedown' || type === 'mouseup') {
            inputEvent.position = [event.offsetX, event.offsetY];
            inputEvent.button = event.button;
        }
        else if (type === 'mousemove') {
            inputEvent.position = [event.offsetX, event.offsetY];
            inputEvent.buttons = event.buttons;
        }
        else if (type === 'mousewheel') {
            inputEvent.position = [event.offsetX, event.offsetY];
            inputEvent.delta = event.deltaY;
        }
        else if (type === 'keydown' || type === 'keyup') {
            inputEvent.key = event.keyCode;
        }

        return inputEvent;
    }
}

export class Input {

    events = [];

    constructor(canvas) {
        this.mouseInput = new MouseInput(canvas);
        this.keyboardInput = new KeyboardInput();
    }

    get mouse() { return this.mouseInput.position }
    get keys() { return this.keyboardInput.keys }

    connect() {
        this.mouseInput.connect(this.events);
        this.keyboardInput.connect(this.events);
    }

    disconnect() {
        this.mouseInput.disconnect();
        this.keyboardInput.disconnect();
    }

    clear() {
        this.events.splice(0);
    }
}

class MouseInput {

    events = null;
    position = [0, 0];

    constructor(canvas) {
        this.canvas = canvas;

        this.onMouseDownCallback = this.onMouseDown.bind(this);
		this.onMouseMoveCallback = this.onMouseMove.bind(this);
		this.onMouseUpCallback = this.onMouseUp.bind(this);
		this.onWheelCallback = this.onWheel.bind(this);
    }

    connect(events) {
        this.events = events;

        this.canvas.addEventListener('mousedown', this.onMouseDownCallback);
        this.canvas.addEventListener('mousemove', this.onMouseMoveCallback);
        this.canvas.addEventListener('mouseup', this.onMouseUpCallback);
        this.canvas.addEventListener('wheel', this.onWheelCallback);
    }

    disconnect() {
        this.canvas.removeEventListener('mousedown', this.onMouseDownCallback);
        this.canvas.removeEventListener('mousemove', this.onMouseMoveCallback);
        this.canvas.removeEventListener('mouseup', this.onMouseUpCallback);
        this.canvas.removeEventListener('wheel', this.onWheelCallback);
    }

    onMouseDown(event) {
		this.events.push(InputEvent.create('mousedown', event));
	}

	onMouseMove(event) {
		this.position = [event.offsetX, event.offsetY];
		this.events.push(InputEvent.create('mousemove', event));
	}

	onMouseUp(event) {
		this.events.push(InputEvent.create('mouseup', event));
	}

	onWheel(event) {
		this.events.push(InputEvent.create('mousewheel', event));
	}
}

class KeyboardInput {

    events = null;
    keys = new Set();

    constructor() {
        this.onKeyDownCallback = this.onKeyDown.bind(this);
		this.onKeyUpCallback = this.onKeyUp.bind(this);
    }

    connect(events) {
        this.events = events;

        window.addEventListener('keydown', this.onKeyDownCallback);
		window.addEventListener('keyup', this.onKeyUpCallback);
    }

    disconnect() {
        window.removeEventListener('keydown', this.onKeyDownCallback);
		window.removeEventListener('keyup', this.onKeyUpCallback);
    }

    onKeyDown(event) {
		if (!this.keys.has(event.keyCode)) {
			this.events.push(InputEvent.create('keydown', event));
		}
		this.keys.add(event.keyCode);
	}

	onKeyUp(event) {
		if (this.keys.has(event.keyCode)) {
			this.events.push(InputEvent.create('keyup', event));
		}

		this.keys.delete(event.keyCode);
	}
}

export const KEYS = {
	ESC: 27,
	ENTER: 13,
	SPACE: 32,
	SHIFT: 16,
	TAB: 9,
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
	W: 87,
	A: 65,
	S: 83,
	D: 68,
	Q: 81,
	E: 69,
	C: 67,
	I: 73,
	0: 48,
	1: 49,
	2: 50,
	3: 51,
	4: 52,
	5: 53,
	6: 54,
	7: 55,
	8: 56,
	9: 57,
};