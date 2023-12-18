import { View } from './view.js';

export class Image extends View {

    constructor({
        renderable,
        alpha=1,
        smoothing=true,
        ...args
    }={}) {
        super({
            eventHandling: View.TargetPolicy.Ignore,
            rendering: View.TargetPolicy.Self,
            updating: View.TargetPolicy.Ignore,
            ...args,
        });

        this.renderable = renderable;
        this.alpha = alpha;
        this.smoothing = smoothing;
    }

    render(context, screenSize) {
        if (this.rendering === View.TargetPolicy.Ignore) { return }
        if (this._realSize[0] == null || this._realSize[1] == null) { return }
        if (this._realSize[0] === 0 || this._realSize[1] === 0) { return }

        context.save();

        context.imageSmoothingEnabled = this.smoothing;
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

            this.renderable?.render(context);

            this.onRender(context, screenSize);
            this.events.emit('render', context, screenSize);
        }

        if (this.rendering !== View.TargetPolicy.Self) {
            context.save();
            context.translate(Math.floor(this.padding), Math.floor(this.padding));
            this._objects.forEach(object => object.render(context, screenSize));
            context.restore();
        }

        if (this.rendering !== View.TargetPolicy.Children) {
            if (this.borderColor && this.borderWidth > 0) {
                context.lineWidth = this.borderWidth;
                context.strokeStyle = this.borderColor;
                context.strokeRect(.5, .5, ...this._realSize.add([-1, -1]));
            }
        }

        context.restore();
    }
}