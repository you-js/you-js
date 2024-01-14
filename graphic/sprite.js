import { Renderable } from "./renderable.js";

export class Sprite extends Renderable {

    anchor;
    scale;
    sourceArea;
    sheet;

    constructor({
        source,
        anchor=[0, 0], scale=[1, 1], sourceArea, sheet,
    }={}) {
        super({ source });

        if (sheet == null) {
            throw 'sheet is required';
        }

        this.sheet = sheet;
        this.anchor = anchor;
        this.scale = scale;
        this.sourceArea = sourceArea;
    }

    get sourceSize() {
        return (
            this.sourceArea == null
            ? this.sheet.size
            : this.sourceArea.slice(2, 4)
        );
    }

    get size() {
        return this.sourceSize.mul(this.scale);
    }

    set size(value) {
        this.scale = value.div(this.sourceSize);
    }

    getArea(position=[0, 0], scale=[1, 1]) {
        const scaledSize = this.size.mul(scale);

        return [
            position[0] - this.anchor[0] * scaledSize[0],
            position[1] - this.anchor[1] * scaledSize[1],
            scaledSize[0],
            scaledSize[1],
        ];
    }

    render(context, position=[0, 0], scale=[1, 1]) {
        if (this.sheet == null || !this.sheet.loaded) { return }

        const sourceArea = (
            this.sourceArea == null
            ? [0, 0, ...this.sheet.size]
            : this.sourceArea
        );

        const scaledSize = [
            sourceArea[2] * this.scale[0] * scale[0],
            sourceArea[3] * this.scale[1] * scale[1],
        ];

        context.save();
        context.translate(...position);
        context.translate(-this.anchor[0] * scaledSize[0], -this.anchor[1] * scaledSize[1]);
        context.translate(.5 * scaledSize[0], .5 * scaledSize[1]);
        context.scale(...this.scale);
        context.scale(...scale);
        context.translate(-.5 * sourceArea[2], -.5 * sourceArea[3]);
        context.drawImage(this.sheet.raw, ...sourceArea, 0, 0, sourceArea[2], sourceArea[3]);
        context.restore();
    }

    copy() {
        return new this.constructor({
            source: this.source,
            anchor: [...this.anchor],
            scale: [...this.scale],
            sourceArea: this.sourceArea == null ? null : [...this.sourceArea],
            sheet: this.sheet,
        });
    }
}