import { View } from './view.js';
import { EventHandlingPolicy } from "./event-handling-policy.js";
import { UpdatingPolicy } from "./updating-policy.js";
import { RenderingPolicy } from "./rendering-policy.js";
import { ViewRenderer } from "./view-renderer.js";

const ImageRenderingStrategy = {
    Stretch: 'stretch',
    Center: 'center',
    Tile: 'tile',
};

export class Image extends View {

    static ImageRenderingStrategy = ImageRenderingStrategy;

    constructor({
        imageRenderingStrategy=ImageRenderingStrategy.Stretch,
        renderable=null,
        renderableAlpha,
        smoothing=true,
        ...args
    }, ...children) {
        super({
            eventHandlingPolicy: new EventHandlingPolicy({ eventHandling: false, targetPolicy: View.TargetPolicy.Self }),
            updatingPolicy: new UpdatingPolicy({ updating: false, targetPolicy: View.TargetPolicy.Self }),
            renderingPolicy: new ImageRenderingPolicy({ rendering: true, targetPolicy: View.TargetPolicy.Self, imageRenderingStrategy }),
            renderer: null,
            ...args,
        }, ...children);

        this.renderer = new ImageRenderer({
            ...args,
            renderable,
            renderableAlpha,
            smoothing,
        });
    }
}

class ImageRenderingPolicy extends RenderingPolicy {

    constructor({
        imageRenderingStrategy,
        ...args
    }) {
        super(args);

        this.imageRenderingStrategy = imageRenderingStrategy;
    }
}

class ImageRenderer extends ViewRenderer {

    constructor({
        renderable=null,
        renderableAlpha,
        smoothing=true,
        ...args
    }={}) {
        super(args);

        this.renderable = renderable;
        this.renderableAlpha = renderableAlpha;
        this.smoothing = smoothing;
    }

    _renderSelf(context, screenSize, view) {
        if (this.renderable == null) { return }
        if (this.renderable.loaded === false) { return }
        if (this.renderable.size == null) { return }
        if (this.renderable.size[0] === 0 || this.renderable.size[1] === 0) { return }

        context.save();

        if (this.renderableAlpha != null) {
            context.globalAlpha = this.renderableAlpha;
        }

        context.imageSmoothingEnabled = this.smoothing;

        if (view.renderingPolicy.imageRenderingStrategy === ImageRenderingStrategy.Stretch) {
            this.renderable.render(context, [0, 0], view.evaluater.actualSize.div(this.renderable.size));
        }
        else if (view.renderingPolicy.imageRenderingStrategy === ImageRenderingStrategy.Center) {
            this.renderable.render(context, view.evaluater.actualSize.sub(this.renderable.size).div(2));
        }
        else if (view.renderingPolicy.imageRenderingStrategy === ImageRenderingStrategy.Tile) {
            for (let x = 0; x < view.evaluater.actualSize[0]; x += this.renderable.size[0]) {
                for (let y = 0; y < view.evaluater.actualSize[1]; y += this.renderable.size[1]) {
                    this.renderable.render(context, [x, y]);
                }
            }
        }

        context.restore();
    }
}