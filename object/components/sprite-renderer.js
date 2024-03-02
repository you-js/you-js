import { Component } from "../component.js";

export class SpriteRenderer extends Component {

    sprite;

    onRender(context) {
        this.sprite?.render(context);
    }
}