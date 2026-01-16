import { Sprite } from './sprite.js';

export class Loader {
    static loadSprite(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(new Sprite(img));
            img.onerror = err => reject(err);
            img.src = src;
        });
    }
}
