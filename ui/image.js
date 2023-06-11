import { ENABLE, STATE, STATES } from "../framework/object.js";
import { View } from "./view.js";

export class Image extends View {

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
        image=null,
        alpha=1,
        smoothing=true,
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

        this.image = image;
        this.alpha = alpha;
        this.smoothing = smoothing;
    }

    render(context, screen, screens) {
        if (this[STATE] !== STATES.CREATED) { return }
		if (!this[ENABLE]) { return }
        if (!this.visible) { return }

        context.save();

        context.translate(...this.position.map(Math.floor));

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

        this.willRender(context, screen, screens);
        this.event.emit('willRender', context, screen, screens);

        context.save();
        context.imageSmoothingEnabled = this.smoothing;
        context.globalAlpha = this.alpha;
        this.image?.render(context, 0, 0, ...this.size);
        context.restore();

        this.components.forEach(component => component.render(context, screen, screens));
        this.objects.forEach(object => object.render(context, screen, screens));
        this.didRender(context, screen, screens);
        this.event.emit('didRender', context, screen, screens);

        if (this.borderColor) {
            context.save();
            context.lineWidth = this.borderWidth;
            context.strokeStyle = this.borderColor;
            context.strokeRect(0, 0, ...this.size.map(Math.floor));
            context.restore();
        }

        context.restore();
	}
}