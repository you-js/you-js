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

const BoundingBoxPolicy = {
    Actual: Symbol.for('actual'),
    Font: Symbol.for('font'),
};

export class Label extends View {

    static path = import.meta.url.replace(import.meta.resolve('app'), '');

    static font = '16px sans-serif';
    static fontColor = 'black';
    static textAlign = 'left';
    static textBaseline = 'top';

    static BoundingBoxPolicy = BoundingBoxPolicy;

    constructor({
        position=[0, 0],
        size=[View.Size.Wrap, View.Size.Wrap],
        text='',
        font,
        fontColor,
        textAlign,
        textBaseline,
        maxWidth=null,
        spacing=0,
        boundingBoxPolicy=BoundingBoxPolicy.Actual,
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
            maxWidth,
            spacing,
            boundingBoxPolicy,
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

    get maxWidth() { return this.renderer.maxWidth }
    set maxWidth(value) { this.renderer.maxWidth = value }

    get spacing() { return this.renderer.spacing }
    set spacing(value) { this.renderer.spacing = value }

    get boundingBoxPolicy() { return this.renderer.boundingBoxPolicy }
    set boundingBoxPolicy(value) { this.renderer.boundingBoxPolicy = value }
}

class Measurer {

    textMetrics = null;
    measured = null;

    measure(text, view) {
        const { font, textAlign, textBaseline, maxWidth, spacing, boundingBoxPolicy } = view;

        if (text == null || text.length === 0) {
            return {
                lines: [],
                metricsList: [],
                sizeList: [],
                offsetList: [],
                boundingBoxSize: [0, 0],
            };
        }

        const context = globalThis.canvas.getContext('2d');

        context.font = font;
        context.textAlign = textAlign;
        context.textBaseline = textBaseline;

        const lines = (
            maxWidth == null
            ? text.split('\n')
            : this.#parseLines(text.split('\n'), maxWidth, text => context.measureText(text).width)
        );

        const metricsList = lines.map(line => context.measureText(line));
        const sizeList = this.#getSizeList(metricsList, boundingBoxPolicy);
        const offsetList = this.#getOffsetList(textAlign, textBaseline, metricsList);
        const boundingBoxSize = this.#getBoundingBoxSize(metricsList, spacing, boundingBoxPolicy);

        const measured = {
            lines,
            metricsList,
            sizeList,
            offsetList,
            boundingBoxSize,
        };

        this.measured = measured;

        return measured;
    }

    #getSizeList(metricsList, boundingBoxPolicy) {
        return metricsList.map(metrics => this.#getBoundingBoxSizeFromMetrics(metrics, boundingBoxPolicy));
    }

    #getBoundingBoxSize(metricsList, spacing, boundingBoxPolicy) {
        const sizes = metricsList.map(
            metrics => this.#getBoundingBoxSizeFromMetrics(metrics, boundingBoxPolicy)
        );

        return [
            sizes.reduce((acc, cur) => acc[0] < cur[0] ? cur : acc)[0],
            sizes.reduce((acc, cur) => acc + cur[1], 0) + spacing * (sizes.length - 1),
        ];
    }

    #getBoundingBoxSizeFromMetrics(metrics, boundingBoxPolicy) {
        return [
            metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight,
            (
                boundingBoxPolicy === BoundingBoxPolicy.Actual
                ? metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
                : metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
            ),
        ].map(Math.ceil);
    }

    #getOffsetList(textAlign, textBaseline, metricsList) {
        const offsets = metricsList.map(
            metrics => this.#getOffsetFromMetrics(textAlign, textBaseline, metrics)
        );

        return offsets;
    }

    #getOffsetFromMetrics(textAlign, textBaseline, metrics) {
        const offset = [0, 0];

        if (textAlign === 'left') {
            offset[0] = metrics.actualBoundingBoxLeft;
        }
        else if (textAlign === 'center') {
            offset[0] = (metrics.actualBoundingBoxLeft - metrics.actualBoundingBoxRight) / 2;
        }
        else if (textAlign === 'right') {
            offset[0] = -metrics.actualBoundingBoxRight;
        }

        if (textBaseline === 'top') {
            offset[1] = metrics.actualBoundingBoxAscent;
        }
        else if (textBaseline === 'middle') {
            offset[1] = (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
        }
        else if (textBaseline === 'bottom') {
            offset[1] = -metrics.actualBoundingBoxDescent;
        }

        return offset;
    }

    #parseLines(lines, maxWidth, measurer) {
        const parsedLines = [];

        for (const line of lines) {
            let tempLine = '';

            for (let i = 0; i < line.length; i++) {
                const character = line[i];

                tempLine += character;

                const tempLineWidth = measurer(tempLine);

                if (tempLineWidth >= maxWidth) {
                    parsedLines.push(tempLine.slice(0, -1));
                    tempLine = character;
                }
            }

            parsedLines.push(tempLine);
        }

        return parsedLines;
    }
}

class LabelRenderer extends ViewRenderer {

    constructor({
        text,
        font,
        fontColor,
        textAlign,
        textBaseline,
        maxWidth,
        spacing,
        boundingBoxPolicy,
        measurer,
        ...args
    }={}) {
        super(args);

        this.font = font ?? Label.font;
        this.fontColor = fontColor ?? Label.fontColor;
        this.textAlign = textAlign ?? Label.textAlign;
        this.textBaseline = textBaseline ?? Label.textBaseline;
        this.maxWidth = maxWidth;
        this.spacing = spacing;
        this.boundingBoxPolicy = boundingBoxPolicy;

        this.measurer = measurer;

        this.text = text ?? Label.text;
    }

    get text() { return this._text }
    set text(value) {
        this._text = `${value}`;
        this._measured = this.measurer.measure(this._text, this);
    }

    _renderSelf(context, screenSize, view) {
        if (this.text == null || this.text === '') { return }

        context.save();

        context.font = this.font;
        context.fillStyle = this.fontColor;
        context.textAlign = this.textAlign;
        context.textBaseline = this.textBaseline;

        const boundingBoxSize = this._measured.boundingBoxSize;

        const align = [
            HORIZONTAL_ALIGN[this.textAlign],
            VERTICAL_ALIGN[this.textBaseline],
        ].mul(
            view.evaluater.actualSize
            .sub(view.padding * 2)
            .sub([0, boundingBoxSize[1]])
            .add([0, this._measured.sizeList[0][1]])
        );

        let lineHeight = 0;

        for (let i = 0; i < this._measured.lines.length; i++) {
            const offset = this._measured.offsetList[i];

            context.fillText(this._measured.lines[i], ...align.add(offset).add([0, lineHeight]).map(Math.floor));

            lineHeight += this._measured.sizeList[i][1] * (1 - VERTICAL_ALIGN[this.textBaseline]);
            lineHeight += (this._measured.sizeList?.[i+1]?.[1] * VERTICAL_ALIGN[this.textBaseline] ?? 0);
            lineHeight += this.spacing;
        }

        context.restore();
    }
}

class LabelEvaluater extends ViewEvaluater {

    evaluateWrapSizeSelf(view) {
        const measured = view.measurer.measure(view.text, view);

        if (this.size[0] === View.Size.Wrap) {
            this.actualSize[0] = Math.ceil(measured.boundingBoxSize[0] + view.padding * 2);
        }

        if (this.size[1] === View.Size.Wrap) {
            this.actualSize[1] = Math.ceil(measured.boundingBoxSize[1] + view.padding * 2);
        }
    }
}