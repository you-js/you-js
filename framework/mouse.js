import { EventQueue } from "./event.js";
import { Screen } from "./screen.js";

export class Mouse {

    eventQueue = null;
    screen = null;
    position = null;

    constructor() {
        this.onContextMenuCallback = this.onContextMenu.bind(this);
        this.onMouseEnterCallback = this.onMouseEnter.bind(this);
        this.onMouseLeaveCallback = this.onMouseLeave.bind(this);
        this.onMouseDownCallback = this.onMouseDown.bind(this);
        this.onMouseMoveCallback = this.onMouseMove.bind(this);
        this.onMouseUpCallback = this.onMouseUp.bind(this);
        this.onMouseWheelCallback = this.onMouseWheel.bind(this);
    }

    connect(eventQueue) {
        if (eventQueue == null) {
            throw `eventQueue is null`;
        }

        if (!(eventQueue instanceof EventQueue)) {
            throw `eventQueue is not EventQueue instance: ${eventQueue}`;
        }

        this.eventQueue = eventQueue;
    }

    disconnect() {
        this.eventQueue = null;
    }

    startListening(screen) {
        if (screen == null) {
            throw `screen is null`;
        }

        if (!(screen instanceof Screen)) {
            throw `screen is not Screen instance: ${screen}`;
        }

        this.screen = screen;

        screen.canvas.addEventListener('contextmenu', this.onContextMenuCallback);
        screen.canvas.addEventListener('mouseenter', this.onMouseEnterCallback);
        screen.canvas.addEventListener('mouseleave', this.onMouseLeaveCallback);
        screen.canvas.addEventListener('mousedown', this.onMouseDownCallback);
        screen.canvas.addEventListener('mousemove', this.onMouseMoveCallback);
        screen.canvas.addEventListener('mouseup', this.onMouseUpCallback);
        screen.canvas.addEventListener('mousewheel', this.onMouseWheelCallback);
    }

    stopListening() {
        this.screen?.canvas.removeEventListener('contextmenu', this.onContextMenuCallback);
        this.screen?.canvas.removeEventListener('mouseenter', this.onMouseEnterCallback);
        this.screen?.canvas.removeEventListener('mouseleave', this.onMouseLeaveCallback);
        this.screen?.canvas.removeEventListener('mousedown', this.onMouseDownCallback);
        this.screen?.canvas.removeEventListener('mousemove', this.onMouseMoveCallback);
        this.screen?.canvas.removeEventListener('mouseup', this.onMouseUpCallback);
        this.screen?.canvas.removeEventListener('mousewheel', this.onMouseWheelCallback);

        this.screen = null;
    }

    onContextMenu(event) {
        event.preventDefault();
    }

    onMouseEnter(event) {
        this.position = [event.offsetX, event.offsetY];
    }

    onMouseLeave(event) {
        this.position = null;
    }

    onMouseDown(event) {
        this.position?.splice(0, 2, event.offsetX, event.offsetY);
        this.eventQueue?.push({
            type: 'mousedown',
            position: [event.offsetX, event.offsetY],
            which: event.which,
        });
    }

    onMouseMove(event) {
        this.position?.splice(0, 2, event.offsetX, event.offsetY);
        this.eventQueue?.push({
            type: 'mousemove',
            position: [event.offsetX, event.offsetY],
        });
    }

    onMouseUp(event) {
        this.position?.splice(0, 2, event.offsetX, event.offsetY);
        this.eventQueue?.push({
            type: 'mouseup',
            position: [event.offsetX, event.offsetY],
            which: event.which,
        });
    }

    onMouseWheel(event) {
        this.eventQueue?.push({
            type: 'mousewheel',
            position: [event.offsetX, event.offsetY],
            deltaX: event.deltaX,
            deltaY: event.deltaY,
        });
    }
}