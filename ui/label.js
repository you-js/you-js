import { View } from './view.js';
import { EventHandlingPolicy } from "./event-handling-policy.js";
import { UpdatingPolicy } from "./updating-policy.js";
import { RenderingPolicy } from "./rendering-policy.js";
import { ViewRenderer } from "./view-renderer.js";
import { ViewEvaluater } from "./view-evaluater.js";

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

    constructor({
        position=[0, 0],
        size=[View.Size.Wrap, View.Size.Wrap],
        text='',
        font,
        fontColor,
        textAlign,
        textBaseline,
        ...args
    }, ...children) {
        super({
            eventHandlingPolicy: new EventHandlingPolicy({ eventHandling: false, targetPolicy: View.TargetPolicy.Self }),
            updatingPolicy: new UpdatingPolicy({ updating: false, targetPolicy: View.TargetPolicy.Self }),
            renderingPolicy: new RenderingPolicy({ rendering: true, targetPolicy: View.TargetPolicy.Self }),
            renderer: null,
            evaluater: null,
            ...args
        }, ...children);

        this.measurer = new Measurer();

        this.renderer = new LabelRenderer({
            ...args,
            text,
            font,
            fontColor,
            textAlign,
            textBaseline,
            measurer: this.measurer,
        });

        this.evaluater = new LabelEvaluater({
            position,
            size,
        });
    }

    get text() { return this.renderer.text }
    set text(value) { this.renderer.text = value }

    get font() { return this.renderer.font }
    set font(value) { this.renderer.font = value }

    get fontColor() { return this.renderer.fontColor }
    set fontColor(value) { this.renderer.fontColor = value }

    get textAlign() { return this.renderer.textAlign }
    set textAlign(value) { this.renderer.textAlign = value }

    get textBaseline() { return this.renderer.textBaseline }
    set textBaseline(value) { this.renderer.textBaseline = value }
}

class Measurer {

    textMetrics = null;

    measure(text, font, textAlign, textBaseline) {
        const context = globalThis.canvas.getContext('2d');

        context.font = font;
        context.textAlign = textAlign;
        context.textBaseline = textBaseline;

        const metrics = this.textMetrics = context.measureText(text);

        return metrics;
    }
}

class LabelRenderer extends ViewRenderer {

    constructor({
        text,
        font,
        fontColor,
        textAlign,
        textBaseline,
        measurer,
        ...args
    }={}) {
        super(args);

        this.text = text ?? Label.text;
        this.font = font ?? Label.font;
        this.fontColor = fontColor ?? Label.fontColor;
        this.textAlign = textAlign ?? Label.textAlign;
        this.textBaseline = textBaseline ?? Label.textBaseline;

        this.measurer = measurer;
    }

    _renderSelf(context, screenSize, view) {
        if (this.text == null || this.text === '') { return }

        context.save();

        context.font = this.font;
        context.fillStyle = this.fontColor;
        context.textAlign = this.textAlign;
        context.textBaseline = this.textBaseline;

        const offset = this.#getOffset();
        const align = [
            HORIZONTAL_ALIGN[this.textAlign] * (view.evaluater.actualSize[0] - view.padding * 2),
            VERTICAL_ALIGN[this.textBaseline] * (view.evaluater.actualSize[1] - view.padding * 2),
        ].add(offset)
        .map(Math.floor);

        context.fillText(this.text, ...align);

        context.restore();
    }

    #getOffset() {
        const offsets = [];

        const textMetrics = this.measurer.textMetrics;

        if (this.textAlign === 'left') {
            offsets[0] = textMetrics.actualBoundingBoxLeft;
        }
        else if (this.textAlign === 'center') {
            offsets[0] = (textMetrics.actualBoundingBoxLeft - textMetrics.actualBoundingBoxRight) / 2;
        }
        else if (this.textAlign === 'right') {
            offsets[0] = -textMetrics.actualBoundingBoxRight;
        }

        if (this.textBaseline === 'top') {
            offsets[1] = textMetrics.actualBoundingBoxAscent;
        }
        else if (this.textBaseline === 'middle') {
            offsets[1] = (textMetrics.actualBoundingBoxAscent - textMetrics.actualBoundingBoxDescent) / 2;
        }
        else if (this.textBaseline === 'bottom') {
            offsets[1] = -textMetrics.actualBoundingBoxDescent;
        }

        return offsets;
    }
}

class LabelEvaluater extends ViewEvaluater {

    evaluateWrapSizeSelf(view) {
        const textMetrics = view.measurer.measure(view.text, view.font, view.textAlign, view.textBaseline);

        if (this.size[0] === View.Size.Wrap) {
            this.actualSize[0] = Math.ceil(textMetrics.actualBoundingBoxLeft + textMetrics.actualBoundingBoxRight + view.padding * 2);
        }

        if (this.size[1] === View.Size.Wrap) {
            this.actualSize[1] = Math.ceil(textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent + view.padding * 2);
        }
    }
}