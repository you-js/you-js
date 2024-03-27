import { Component } from "../component.js";

export class SpriteRenderer extends Component {

    sprite;

    constructor({
        sprite=null,
        opacity=1,
    }={}) {
        super();

        this.sprite = sprite;
        this.opacity = opacity;
    }

    onRender(context) {
        if (this.sprite == null) { return }
        if (this.opacity === 0) { return }

        context.save();
        context.globalAlpha = this.opacity;

        this.sprite.render(context);

        context.restore();
    }
}