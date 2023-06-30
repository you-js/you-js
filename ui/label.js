import { ENABLE, STATE, STATES } from "../framework/object.js";
import { Scene } from "../scene.js";
import { View } from "./view.js";

const TEXT_POSITION_MAP = (size, alignment) => [
    { left: 0, center: size[0] / 2 + 1, right: size[0] - 1 }[alignment.horizontal],
    { top: 0, middle: size[1] / 2 + 1, bottom: size[1] }[alignment.vertical],
];

const FIT_CONTENT = Symbol('pack');

export class Label extends View {

    static SIZE = { FIT_CONTENT };

    constructor({
        name='', enable=true,
		tags=[],
		components=[],
		objects=[],
		events={},
        eventHandling=true,
        visible=true,
        position=[0, 0], size,
        clip=true,
        backgroundColor=null,
        borderColor=null, borderWidth=1,
        text='',
        fontColor='black', fontSize='12px', fontFamily='sans-serif',
        alpha=1,
        alignment={ horizontal: 'center', vertical: 'middle' },
    }={}) {
        super({
            name, enable,
            tags,
            components,
            objects,
            events,
            eventHandling,
            visible,
            position, size, clip,
            backgroundColor,
            borderColor, borderWidth,
        });

        this.text = text;
        this.fontColor = fontColor;
        this.fontSize = fontSize;
        this.fontFamily = fontFamily;
        this.alpha = alpha;
        this.alignment = {
            horizontal: alignment.horizontal ?? 'center',
            vertical: alignment.vertical ?? 'middle',
        };
    }

    get font() { return `${this.fontSize} ${this.fontFamily}` }
    set font(value) {
        [this.fontSize, this.fontFamily] = value.split(' ');
    }

    create(...args) {
        if (this[STATE] !== STATES.INSTANTIATED) { return }

        if (this.position instanceof Function) {
            this.position = this.position.bind(this)(this, this.parent?.objects?.indexOf(this) ?? undefined);
        }
        if ((this.size ?? null) === null) {
            this.size = [null, null];
        }
        else if (this.size instanceof Function) {
            this.size = this.size.bind(this)(this, this.parent?.objects?.indexOf(this) ?? undefined);
        }

        if (this.size[0] === null) {
            this.size[0] = this.parent instanceof Scene ? this.scene.application.screen.size[0] : this.parent.size[0];
        }
        if (this.size[1] === null) {
            this.size[1] = this.parent instanceof Scene ? this.scene.application.screen.size[1] : this.parent.size[1];
        }

        if (this.size === Label.SIZE.FIT_CONTENT) {
            this.size = [Label.SIZE.FIT_CONTENT, Label.SIZE.FIT_CONTENT];
        }

        if (this.size[0] === Label.SIZE.FIT_CONTENT ||
            this.size[1] === Label.SIZE.FIT_CONTENT) {
            const screen = this.scene.application.screen;
            const context = screen.context;

            context.save();
            context.textAlign = this.alignment.horizontal;
            context.textBaseline = 'top';
            context.font = `${this.fontSize} ${this.fontFamily}`;
            const textMetrics = context.measureText(this.text);
            context.restore();

            if (this.size[0] === Label.SIZE.FIT_CONTENT) {
                this.size[0] = Math.abs(textMetrics.actualBoundingBoxLeft)
                            + Math.abs(textMetrics.actualBoundingBoxRight);
            }
            if (this.size[1] === Label.SIZE.FIT_CONTENT) {
                this.size[1] = Math.abs(textMetrics.fontBoundingBoxAscent)
                            + Math.abs(textMetrics.fontBoundingBoxDescent);
            }
        }

		this.willCreate(...args);
		this.event.emit('willCreate', ...args);
		this[STATE] = STATES.CREATED;
		this.components.forEach(component => component.create(...args));
		this.objects.forEach(object => object.create(...args));
		this.didCreate(...args);
		this.event.emit('didCreate', ...args);
	}

    render(context, screen) {
        if (this[STATE] !== STATES.CREATED) { return }
		if (!this[ENABLE]) { return }
        if (!this.visible) { return }

        context.save();

        context.globalAlpha = this.alpha;
        context.translate(...this.position.map(Math.floor));

        context.textAlign = this.alignment.horizontal;
        context.textBaseline = this.alignment.vertical;
        context.font = `${this.fontSize} ${this.fontFamily}`;

        if (this.clip) {
            context.beginPath();
            context.rect(0, 0, ...this.size.map(Math.floor));
            context.clip();
        }

        if (this.backgroundColor) {
            context.save();
            context.fillStyle = this.backgroundColor;
            context.fillRect(0, 0, ...this.size.map(Math.floor));
            context.restore();
        }

        this.willRender(context, screen);
        this.event.emit('willRender', context, screen);

        const textPosition = TEXT_POSITION_MAP(this.size, this.alignment);

        const texts = this.text?.split('\n') ?? [];
        context.fillStyle = this.fontColor;
        for (let l = 0; l < texts.length; l++) {
            const measure = context.measureText(texts[l]);
            const height = measure.fontBoundingBoxAscent + measure.fontBoundingBoxDescent;
            context.fillText(texts[l], ...textPosition.add([0, l * height]));
        }

        this.components.forEach(component => component.render(context, screen));
        this.objects.forEach(object => object.render(context, screen));
        this.didRender(context, screen);
        this.event.emit('didRender', context, screen);

        if (this.borderColor) {
            context.save();
            context.lineWidth = this.borderWidth;
            context.strokeStyle = this.borderColor;
            context.strokeRect(0, 0, ...this.size.map(Math.floor));
            context.restore();
        }

        context.restore();
	}

    pack({
        horizontal=false,
        vertical=false,
    }) {
        if (!horizontal && !vertical) { return }

        const screen = this.scene.application.screen;
        const context = screen.context;

        context.save();
        context.textAlign = this.alignment.horizontal;
        context.textBaseline = 'top';
        context.font = `${this.fontSize} ${this.fontFamily}`;
        const textMetrics = context.measureText(this.text);
        context.restore();

        if (horizontal) {
            this.size[0] = Math.abs(textMetrics.actualBoundingBoxLeft)
                        + Math.abs(textMetrics.actualBoundingBoxRight);
        }
        if (vertical) {
            this.size[1] = Math.abs(textMetrics.fontBoundingBoxAscent)
                        + Math.abs(textMetrics.fontBoundingBoxDescent);
        }
    }
}