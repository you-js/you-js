export class Screen {

    constructor(canvas, size=null) {
		this.canvas = canvas;

		if (size === null) {
			size = [document.documentElement.clientWidth, document.documentElement.clientHeight];
		}

        if (size instanceof Array && size.length === 2) {
            if (size[0]) { this.canvas.width = size[0] }
            if (size[1]) { this.canvas.height = size[1] }
        }

		this.context = canvas.getContext('2d');
	}

    get width() { return this.canvas.width }
	set width(value) { this.canvas.width = value }

	get height() { return this.canvas.height }
	set height(value) { this.canvas.height = value }

	get size() { return [this.canvas.width, this.canvas.height] }
	set size(value) { [this.canvas.width, this.canvas.height] = value }

	clear() {
		this.context.clearRect(0, 0, ...this.size);
	}

    static createOffscreen(id, size) {
		const offscreenCanvas = document.createElement('canvas');

		return new Screen(id, size, offscreenCanvas);
	}
}