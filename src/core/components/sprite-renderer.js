import { Component } from '../component.js';
import { Sprite } from '../sprite.js';

export class SpriteRenderer extends Component {
    constructor(sprite) {
        super();
        if (sprite && !(sprite instanceof Sprite)) {
            throw new Error('SpriteRenderer: argument must be an instance of Sprite');
        }
        this.sprite = sprite;
    }

    setSprite(sprite) {
        this.sprite = sprite;
    }

    draw(context) {
        if (this.sprite && this.entity) {
            this.sprite.draw(context);
        }
    }
}
