import { Renderable } from "./renderable.js";

export class Image extends Renderable {

    raw;
    loading;

    constructor({
        source,
    }={}) {
        super({ source });

        this.raw = new globalThis.Image();
        this.raw._loaded = false;
        this.raw.src = source;

        this.loading = new Promise((resolve, reject) => {
            this.raw.addEventListener('load', () => {
                this.raw._loaded = true;
                resolve();
            });
        });
    }

    get loaded() { return this.raw._loaded }
    get width() { return this.raw.width }
    get height() { return this.raw.height }
    get size() { return [this.raw.width, this.raw.height] }

    render(context, position=[0, 0], scale=[1, 1]) {
        if (!this.raw._loaded) { return }

        context.drawImage(this.raw, ...position, this.raw.width * scale[0], this.raw.height * scale[1]);
    }
}