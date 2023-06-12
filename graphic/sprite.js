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