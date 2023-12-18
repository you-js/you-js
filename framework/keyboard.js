import { EventQueue } from "./event.js";

export class Keyboard {

    eventQueue = null;
    keys = new Set();

    constructor() {
        this.onKeyDownCallback = this.onKeyDown.bind(this);
        this.onKeyUpCallback = this.onKeyUp.bind(this);

        window.addEventListener('keydown', this.onKeyDownCallback);
        window.addEventListener('keyup', this.onKeyUpCallback);
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

    onKeyDown(event) {
        this.eventQueue?.push({ type: 'keydown', key: event.code });

        this.keys.add(event.code);
    }

    onKeyUp(event) {
        this.eventQueue?.push({ type: 'keyup', key: event.code });

        this.keys.delete(event.code);
    }
}