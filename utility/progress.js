import { EventEmitter } from './event.js';

export class Progress {

    value;
    speed;
    loop;
    events;

    constructor({
        value=0,
        speed=1,
        loop=false,
        events={},
    }={}) {
        this.value = value;
        this.speed = speed;
        this.loop = loop;

        this.events = new EventEmitter({ bindee: this, handlers: events });
    }

    update(deltaTime, ...args) {
        if (this.loop === false && this.value === 1) { return }

        this.value += deltaTime * this.speed;

        if (this.value >= 1) {
            if (this.loop) {
                const count = Math.trunc(this.value);
                this.value -= count;

                for (let i = 0; i < count; i++) {
                    this.events.emit('exceed', ...args);
                }
            }
            else {
                this.value = 1;
                this.events.emit('finish', ...args);
            }
        }
    }

    reset() {
        this.value = 0;
    }

    dispose() {
        this.value = null;
        this.speed = null;
        this.loop = null;
        this.events.dispose();
        this.events = null;
    }

    toJSON() {
        return {
            value: this.value,
            speed: this.speed,
            loop: this.loop,
        };
    }

    static fromJSON(json) {
        return new this(json);
    }
}