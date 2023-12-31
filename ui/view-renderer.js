import { View } from "./view.js";

export class ViewRenderer {

    /**
     * @param {object} args
     * @param {?string} args.backgroundColor
     * @param {?string} args.borderColor
     * @param {number} args.borderWidth
     * @param {boolean} args.clipping
     */
    constructor({
        view,
        backgroundColor=null,
        borderColor=null, borderWidth=1,
        clipping=true,
    }) {
        this.view = view;
        this.backgroundColor = backgroundColor;
        this.borderColor = borderColor;
        this.borderWidth = borderWidth;
        this.clipping = clipping;
    }

    render(context, renderingPolicy, position, size, padding, children) {
        context.save();
        context.translate(...position);

        this._clip(context, size);

        if (renderingPolicy !== View.TargetPolicy.Children) {
            this._renderBackground(context, size);
        }

        context.save();
        context.translate(Math.floor(padding), Math.floor(padding));

        if (renderingPolicy !== View.TargetPolicy.Children) {
            this._renderSelf(context);
        }

        if (renderingPolicy !== View.TargetPolicy.Self) {
            this._renderChildren(context, children);
        }

        context.restore();

        if (renderingPolicy !== View.TargetPolicy.Children) {
            this._renderBorder(context, size);
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

    _renderSelf(context) {}

    _renderChildren(context, children) {
        children.forEach(child => child.render(context));
    }

    _renderBorder(context, size) {
        if (this.borderColor && this.borderWidth > 0) {
            context.lineWidth = this.borderWidth;
            context.strokeStyle = this.borderColor;
            context.strokeRect(.5, .5, ...size.sub(1));
        }
    }
}