import { EventEmitter } from "../utilities/event.js";

export class Progress {

    constructor(speed=1, repeat=false) {
        Object.defineProperty(this, 'event', { value: new EventEmitter(this) });
        this.speed = speed;
        this.repeat = repeat;
        this.value = 0;
    }

    update(delta, ...args) {
        if (!this.repeat &&
            (this.speed > 0 && this.value >= 1 || this.speed < 0 && this.value <= 0)) { return }
        this.value += delta * this.speed;

        this.event.emit('update', this.value, ...args);

        if (this.value >= 1) {
            if (!this.repeat) {
                this.value = 1;
                this.event.emit('finish', this.value, ...args);
            }
            else {
                const count = Math.trunc(this.value);
                this.value -= count;

                for (let i = 0; i < count; i++) {
                    this.event.emit('exceed', this.value, ...args);
                }
            }
        }
        else if (this.value <= 0) {
            if (!this.repeat) {
                this.value = 0;
                this.event.emit('finish', this.value, ...args);
            }
            else {
                const count = Math.trunc(this.value);
                this.value -= count;

                for (let i = 0; i < -count; i++) {
                    this.event.emit('exceed', this.value, ...args);
                }
            }
        }
    }

    static create(speed, repeat, update, finish, exceed) {
        const animation = new this(speed, repeat);

        if (update) {
            animation.event.on('update', update);
        }

        if (finish) {
            animation.event.on('finish', finish);
        }

        if (exceed) {
            animation.event.on('exceed', exceed);
        }

        return animation;
    }
}