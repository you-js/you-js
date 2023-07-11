import { Image } from "./image.js";

export class Sprite {

    constructor({
        sheet,
        scale=[1, 1], anchor=[0, 0],
        croppingArea=null,
    }={}) {
        if (!sheet) { throw 'required' }

        this.sheet = sheet;
        this.scale = scale;
        this.anchor = anchor;
        this.croppingArea = croppingArea;
    }

    get size() {
        const size = this.croppingArea?.slice(2, 4) ?? this.sheet.size;
        return [...size];
    }

    get area() {
        const size = this.croppingArea?.slice(2, 4) ?? this.sheet.size;
        const scaledSize = size.mul(this.scale);
        const scaledPosition = scaledSize.mul(this.anchor).negate;

        return [...scaledPosition, ...scaledSize];
    }

    render(context, position, scale) {
        if (this.sheet.loaded) {
            this._drawSprite(context, position, scale);
        }
    }

    _drawSprite(context, position=[0, 0], scale=[1, 1]) {
        context.save();
        context.translate(...position);
        context.scale(...this.scale.mul(scale));

        if (this.croppingArea) {
            context.translate(
                -this.anchor[0] * this.croppingArea[2],
                -this.anchor[1] * this.croppingArea[3]
            );
            this.sheet.render(
                context,
                ...this.croppingArea,
                0, 0, this.croppingArea[2], this.croppingArea[3]
            );
        }
        else {
            context.translate(
                -this.anchor[0] * this.sheet.width,
                -this.anchor[1] * this.sheet.height
            );
            this.sheet.render(
                context,
                0, 0
            );
        }

        context.restore();
    }

    toJSON() {
        return {
            sheet: this.sheet.url,
            scale: this.scale,
            anchor: this.anchor,
            croppingArea: this.croppingArea,
        };
    }

    static fromJSON(obj) {
        return new this({
            sheet: new Image(obj.sheet),
            scale: [...obj.scale],
            anchor: [...obj.anchor],
            croppingArea: [...obj.croppingArea],
        });
    }
}

export class Animation {

    constructor({
        id, enable=true, frames, speed=1, repeat=true,
    }={}) {
        if (!id) { throw 'required' }
        if (!frames || frames.length <= 0) { throw 'required' }
        this.id = id;
        this.enable = enable;
        this.frames = frames;
        this.speed = speed;
        this.repeat = repeat;

        this.value = 0;
        this._currentFrameIndex = 0;
        this._boundaries = [0];
        this.frames.reduce((acc, cur) => {
            const result = acc + cur.duration;
            this._boundaries.push(result);
            return result;
        }, 0);
        this._duration = this._boundaries[this._boundaries.length - 1];
    }

    get sprite() {
        return this.frames[this._currentFrameIndex].sprite;
    }

    update(deltaTime) {
        if (!this.enable) { return }

        let next = this.value + deltaTime * this.speed;

        next = (
            this.repeat
            ? next % this._duration
            : Math.min(next, this._duration)
        );

        for (let i = 0; i < this.frames.length; i++) {
            const index = (this._currentFrameIndex + i) % this.frames.length;
            if (this._boundaries[index] <= next && next <= this._boundaries[index + 1]) {
                this.value = next;
                this._currentFrameIndex = index;
                break;
            }
        }
	}

    render(context, position, scale) {
        this.frames[this._currentFrameIndex].sprite.render(context, position, scale);
    }

    play(startPosition=null) {
        if (startPosition) {
            this.value = (startPosition + this._duration) % this._duration;
        }

        this.enable = true;
    }

    pause() {
        this.enable = false;
    }

    stop() {
        this.enable = false;
        this.value = 0;
        this._currentFrameIndex = 0;
    }

    toJSON() {
        return {
            id: this.id,
            frames: this.frames.map(frame => ({ sprite: frame.sprite.toJSON(), duration: frame.duration })),
            speed: this.speed,
            repeat: this.repeat,
        };
    }

    static fromJSON(obj) {
        obj = {...obj};
        obj.frames = obj.frames.map(frame => ({
            sprite: Sprite.fromJSON(frame.sprite),
            duration: frame.duration
        }));
        return new this(obj);
    }

    copy(deep=true) {
        const instance = Animation.fromJSON(this.toJSON());

        if (deep) {
            instance.enable = this.enable;
            instance.value = this.value;
            instance._currentFrameIndex = this._currentFrameIndex;
        }

        return instance;
    }
}