import { View } from './view.js';

const HORIZONTAL_ALIGN = {
    left: 0,
    center: 0.5,
    right: 1,
};

const VERTICAL_ALIGN = {
    top: 0,
    middle: 0.5,
    bottom: 1,
};

export class Label extends View {

    static font = '16px sans-serif';
    static fontColor = 'black';
    static textAlign = 'left';
    static textBaseline = 'top';

    #textMetrics = null;

    constructor({
        text='',
        font,
        fontColor,
        textAlign,
        textBaseline,
        alpha=1,
        ...args
    }={}) {
        super({
            eventHandling: View.TargetPolicy.Ignore,
            rendering: View.TargetPolicy.Self,
            updating: View.TargetPolicy.Ignore,
            ...args
        });

        this.text = text;
        this.font = font ?? this.constructor.font;
        this.fontColor = fontColor ?? this.constructor.fontColor;
        this.textAlign = textAlign ?? this.constructor.textAlign;
        this.textBaseline = textBaseline ?? this.constructor.textBaseline;
        this.alpha = alpha;
    }

    evaluateWrapSizeSelf() {
        this.#textMetrics = this.#measureText(this.text);

        if (this._size[0] === View.Size.Wrap) {
            this._realSize[0] = Math.ceil(this.#textMetrics.actualBoundingBoxLeft + this.#textMetrics.actualBoundingBoxRight + this.padding * 2);
        }

        if (this._size[1] === View.Size.Wrap) {
            this._realSize[1] = Math.ceil(this.#textMetrics.actualBoundingBoxAscent + this.#textMetrics.actualBoundingBoxDescent + this.padding * 2);
        }
    }

    #measureText(text) {
        const context = globalThis.canvas.getContext('2d');
        context.font = this.font;
        context.textAlign = this.textAlign;
        context.textBaseline = this.textBaseline;
        const metrics = context.measureText(text);
        return metrics;
    }

    render(context, screenSize) {
        if (this.rendering === View.TargetPolicy.Ignore) { return }
        if (this._realSize[0] == null || this._realSize[1] == null) { return }
        if (this._realSize[0] === 0 || this._realSize[1] === 0) { return }

        context.save();

        context.globalAlpha = this.alpha;
        context.translate(...this._realPosition.map(Math.floor));

        context.beginPath();
        context.rect(0, 0, ...this._realSize.map(Math.floor));
        context.clip();

        if (this.rendering !== View.TargetPolicy.Children) {
            if (this.backgroundColor) {
                context.fillStyle = this.backgroundColor;
                context.fillRect(0, 0, ...this._realSize.map(Math.floor));
            }

            this.willRender(context, screenSize);

            context.font = this.font;
            context.fillStyle = this.fontColor;
            context.textAlign = this.textAlign;
            context.textBaseline = this.textBaseline;
            const align = [
                this.padding + HORIZONTAL_ALIGN[this.textAlign] * (this._realSize[0] - this.padding * 2),
                this.padding + VERTICAL_ALIGN[this.textBaseline] * (this._realSize[1] - this.padding * 2),
            ].map(Math.floor);

            align.splice(0, 2, ...align.add(this.#getOffset()));

            context.fillText(this.text ?? '', ...align);
        }

        if (this.rendering !== View.TargetPolicy.Self) {
            context.save();
            context.translate(Math.floor(this.padding), Math.floor(this.padding));
            this._objects.forEach(object => object.render(context, screenSize));
            context.restore();
        }

        if (this.rendering !== View.TargetPolicy.Children) {
            this.didRender(context, screenSize);

            if (this.borderColor && this.borderWidth > 0) {
                context.lineWidth = this.borderWidth;
                context.strokeStyle = this.borderColor;
                context.strokeRect(.5, .5, ...this._realSize.add([-1, -1]));
            }
        }

        context.restore();
    }

    #getOffset() {
        const offsets = [];

        if (this.textAlign === 'left') {
            offsets[0] = this.#textMetrics.actualBoundingBoxLeft;
        }
        else if (this.textAlign === 'center') {
            offsets[0] = (this.#textMetrics.actualBoundingBoxLeft - this.#textMetrics.actualBoundingBoxRight) / 2;
        }
        else if (this.textAlign === 'right') {
            offsets[0] = -this.#textMetrics.actualBoundingBoxRight;
        }

        if (this.textBaseline === 'top') {
            offsets[1] = this.#textMetrics.actualBoundingBoxAscent;
        }
        else if (this.textBaseline === 'middle') {
            offsets[1] = (this.#textMetrics.actualBoundingBoxAscent - this.#textMetrics.actualBoundingBoxDescent) / 2;
        }
        else if (this.textBaseline === 'bottom') {
            offsets[1] = -this.#textMetrics.actualBoundingBoxDescent;
        }

        return offsets;
    }
}