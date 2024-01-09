import { EventEmitter } from "../utility/event.js";
import { Renderable } from "./renderable.js";

export class Animation extends Renderable {

    frames;
    speed;
    loop;

    #currentTime;
    #currentFrameIndex;
    #boundaries;
    #duration;

    constructor({
        source,
        frames, speed=1, loop=true,
        events={},
    }={}) {
        super({ source });

        if (!frames || frames.length <= 0) {
            throw 'frames are required';
        }

        this.frames = frames;
        this.speed = speed;
        this.loop = loop;
        this.events = new EventEmitter({ bindee: this, handlers: events });

        this.#currentTime = 0;
        this.#currentFrameIndex = 0;
        this.#boundaries = [0];
        this.#duration = this.frames.reduce((accumulatedDuration, currentFrame) => {
            const nextDuration = accumulatedDuration + currentFrame.duration;
            this.#boundaries.push(nextDuration);
            return nextDuration;
        }, 0);
    }

    get size() {
        return this.frames[this.#currentFrameIndex].sprite.size;
    }

    get sprite() {
        return this.frames[this.#currentFrameIndex].sprite;
    }

    get currentTime() {
        return this.#currentTime;
    }

    set currentTime(value) {
        this.#currentTime = value;
        this.#currentFrameIndex = this.#findFrameIndex();
    }

    update(deltaTime, ...args) {
        if (this.#currentTime < this.#duration) {
            this.#currentTime += deltaTime * this.speed;

            if (this.#currentTime >= this.#duration) {
                if (this.loop) {
                    while (this.#currentTime >= this.#duration) {
                        this.#currentTime = this.#currentTime - this.#duration;
                        this.events.emit('exceed', ...args);
                    }
                }
                else {
                    this.#currentTime = this.#duration;
                    this.events.emit('finish', ...args);
                }
            }

            this.#currentFrameIndex = this.#findFrameIndex();
        }
	}

    #findFrameIndex() {
        for (let i = 0; i < this.frames.length; i++) {
            const index = (this.#currentFrameIndex + i) % this.frames.length;

            if (this.#boundaries[index] <= this.#currentTime &&
                this.#currentTime < this.#boundaries[index + 1]) {
                return index;
            }
        }

        return this.frames.length - 1;
    }

    render(context, position=[0, 0], scale=[1, 1]) {
        this.frames[this.#currentFrameIndex].sprite.render(context, position, scale);
    }

    reset() {
        this.#currentTime = 0;
        this.#currentFrameIndex = 0;
    }

    copy() {
        const instance = new this.constructor({
            source: this.source,
            frames: this.frames.map(frame => ({
                duration: frame.duration,
                sprite: frame.sprite,
            })),
            speed: this.speed,
            loop: this.loop,
        });

        instance.currentTime = this.currentTime;

        return instance;
    }
}