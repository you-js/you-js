import { View } from "./view.js";

export class ViewRenderer {

    constructor({
        backgroundColor=null,
        borderColor=null, borderWidth=1,
        clipping=true,
        alpha,
    }) {
        this.backgroundColor = backgroundColor;
        this.borderColor = borderColor;
        this.borderWidth = borderWidth;
        this.clipping = clipping;
        this.alpha = alpha;
    }

    render(context, screenSize, view) {
        if (view.renderingPolicy.rendering === false) { return }
        if (view.evaluater.actualSize[0] == null || view.evaluater.actualSize[1] == null) { return }
        if (this.alpha === 0) { return }

        this._render(context, screenSize, view);
    }

    _render(context, screenSize, view) {
        const quantizedSize = view.evaluater.actualSize.map(Math.floor);

        if (quantizedSize[0] === 0 || quantizedSize[1] === 0) { return }

        const quantizedPosition = view.evaluater.actualPosition.map(Math.floor);
        const quantizedPadding = Math.floor(view.padding);

        const isRenderingSelf = (
            view.renderingPolicy.targetPolicy === View.TargetPolicy.Self ||
            view.renderingPolicy.targetPolicy === View.TargetPolicy.Both
        );

        const isRenderingChildren = (
            view.renderingPolicy.targetPolicy === View.TargetPolicy.Children ||
            view.renderingPolicy.targetPolicy === View.TargetPolicy.Both
        );

        context.save();

        if (this.alpha != null) {
            context.globalAlpha = this.alpha;
        }

        context.translate(...quantizedPosition);

        this._clip(context, quantizedSize);

        if (isRenderingSelf) {
            this._renderBackground(context, quantizedSize);
        }

        context.save();
        context.translate(quantizedPadding, quantizedPadding);

        if (isRenderingSelf) {
            this._renderSelf(context, screenSize, view);
        }

        if (isRenderingChildren) {
            this._renderChildren(context, screenSize, view);
        }

        context.restore();

        if (isRenderingSelf) {
            this._renderBorder(context, quantizedSize);
        }

        context.restore();
    }

    _clip(context, size) {
        if (this.clipping === true) {
            context.beginPath();
            context.rect(0, 0, ...size);
            context.clip();
        }
    }

    _renderBackground(context, size) {
        if (this.backgroundColor) {
            context.fillStyle = this.backgroundColor;
            context.fillRect(0, 0, ...size);
        }
    }

    _renderSelf(context, screenSize, view) {}

    _renderChildren(context, screenSize, view) {
        view.container._children.forEach(child => child.render(context, screenSize));
    }

    _renderBorder(context, size) {
        if (this.borderColor && this.borderWidth > 0) {
            context.lineWidth = this.borderWidth;
            context.strokeStyle = this.borderColor;
            context.strokeRect(.5, .5, ...size.sub(1));
        }
    }
}