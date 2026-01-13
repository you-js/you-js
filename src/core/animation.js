import { Sprite } from './sprite.js';

export class Animation {
    /**
     * @param {object[]} frames Array of { sprite: Sprite, duration: number (seconds) }
     * @param {object} options { speed, loop, name }
     */
    constructor(frames, { speed = 1, loop = true, name = 'default' } = {}) {
        if (!frames || frames.length === 0) {
            throw new Error('Animation: frames are required');
        }

        this.name = name;
        this.frames = frames;
        this.speed = speed;
        this.loop = loop;
        
        this.currentTime = 0;
        this.currentFrameIndex = 0;
        this.isFinished = false;

        // Pre-calculate duration boundaries
        this.totalDuration = 0;
        this.frameBoundaries = [0];
        
        for (const frame of frames) {
            this.totalDuration += frame.duration;
            this.frameBoundaries.push(this.totalDuration);
        }

        // Callbacks
        this.onFinish = null;
        this.onLoop = null;
    }

    reset() {
        this.currentTime = 0;
        this.currentFrameIndex = 0;
        this.isFinished = false;
    }

    update(deltaTime) {
        if (this.isFinished) return;

        this.currentTime += deltaTime * this.speed;

        // Check if finished or loop
        if (this.currentTime >= this.totalDuration) {
            if (this.loop) {
                // Handle looping
                while (this.currentTime >= this.totalDuration) {
                    this.currentTime -= this.totalDuration;
                    if (this.onLoop) this.onLoop();
                }
            } else {
                // Finish
                this.currentTime = this.totalDuration;
                this.isFinished = true;
                if (this.onFinish) this.onFinish();
            }
        }

        // Find current frame
        // Optimization: usually we just advance one frame, so check current+1 first
        // But for robust seeking, binary search or linear scan is safer. Linear is fine for small frame counts.
        this.currentFrameIndex = this.frames.length - 1; // Default to last
        for (let i = 0; i < this.frameBoundaries.length - 1; i++) {
            if (this.currentTime >= this.frameBoundaries[i] && this.currentTime < this.frameBoundaries[i + 1]) {
                this.currentFrameIndex = i;
                break;
            }
        }
    }

    get currentFrame() {
        return this.frames[this.currentFrameIndex];
    }

    get currentSprite() {
        return this.frames[this.currentFrameIndex].sprite;
    }

    copy() {
        const instance = new Animation(this.frames, {
            speed: this.speed,
            loop: this.loop,
            name: this.name
        });
        instance.currentTime = this.currentTime;
        return instance;
    }
}
