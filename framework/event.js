export class EventQueue {

    constructor() {
        this.events = [];
    }

    push(...args) {
        this.events.splice(args.length, 0, ...args);
    }

    clear() {
        this.events.splice(0);
    }
}