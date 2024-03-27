import { Component } from "../component.js";

export class AnimationRenderer extends Component {

    animations;
    animation;
    animationId;

    constructor({
        speed=1,
        animations=[],
        animationId=null,
        opacity=1,
    }={}) {
        super();

        this.speed = speed;
        this.animations = animations;
        this.animationId = animationId ?? Object.keys(animations)[0];
        this.animation = this.animations[this.animationId];
        this.opacity = opacity;
    }

    onUpdate(deltaTime) {
        this.animation?.update(deltaTime * this.speed);
    }

    onRender(context) {
        if (this.animation == null) { return }
        if (this.opacity === 0) { return }

        context.save();
        context.globalAlpha = this.opacity;

        this.animation.render(context);

        context.restore();
    }

    play(animationId) {
        const animation = this.animations[animationId];

        if (animation == null) { return }
        if (animation === this.animation) { return }

        this.animation = animation;
        this.animationId = animationId;

        this.animation.reset();
    }
}