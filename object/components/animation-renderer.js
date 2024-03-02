import { Component } from "../component.js";

export class AnimationRenderer extends Component {

    animation;

    onUpdate(deltaTime) {
        this.animation?.update(deltaTime);
    }

    onRender(context) {
        this.animation?.render(context);
    }
}