export class Image {

    constructor(url) {
        this.url = url;

        this.loaded = false;
        this.raw = new window.Image();
        this.raw.onload = () => { this.loaded = true }
        this.raw.src = url;
    }

    get width() { return this.raw.width }
    get height() { return this.raw.height }
    get size() { return [this.raw.width, this.raw.height] }

    render(context, ...args) {
        if (this.loaded === false) { return }

        context.drawImage(this.raw, ...args);
    }
}