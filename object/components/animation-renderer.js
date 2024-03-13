import { Component } from "../component.js";

export class AnimationRenderer extends Component {

    animations;
    animation;
    animationId;

    onUpdate(deltaTime) {
        this.animation?.update(deltaTime);
    }

    onRender(context) {
        this.animation?.render(context);
    }

    play(animationId) {
        this.animation = this.animations[animationId];

        if (this.animation == null) { return }

        this.animationId = animationId;
        this.animation.reset();
    }
}