const ResizeType = {
	Fill: Symbol('resize-type-fill'),
	Pack: Symbol('resize-type-pack'),
};

export class Screen {

	static ResizeType = ResizeType;

	canvas;
    #originalSize = [0, 0];
    #size = [0, 0];

    #eventQueue = null;

    constructor({
        canvas,
        size,
		resizeType=ResizeType.Fill,
    }={}) {
        this.canvas = canvas;
        this.#originalSize.splice(0, 2, size[0], size[1]);
        this.#size.splice(0, 2, size[0], size[1]);
		this.resizeType = resizeType;

        this.canvas.width = size[0];
        this.canvas.height = size[1];

        this.context = canvas.getContext('2d');

        this.onResizeCallback = this.onResize.bind(this);

        if (this.resizeType === ResizeType.Fill) {
			this.#fill();
        }
        else if (this.resizeType === ResizeType.Pack) {
			this.#pack();
        }
    }

    connect(eventQueue) {
        this.#eventQueue = eventQueue;

		window.addEventListener('resize', this.onResizeCallback);
    }

    disconnect() {
		window.removeEventListener('resize', this.onResizeCallback);

        this.#eventQueue = null;
    }

    fill() {
        this.resizeType = ResizeType.Fill;
		this.#fill();
    }

	#fill() {
		this.size = [
			window.innerWidth,
			window.innerHeight
		];
	}

    pack() {
        this.resizeType = ResizeType.Pack;
		this.#pack();
    }

	#pack() {
		this.size = this.#originalSize;
	}

    onResize(event) {
        if (this.resizeType === ResizeType.Fill) {
			this.#fill();
        }
        else if (this.resizeType === ResizeType.Pack) {
			this.#pack();
        }

        this.#eventQueue?.push({
			type: 'resize',
			size: [
				window.innerWidth,
				window.innerHeight
			],
		});
    }

    get size() {
        return [...this.#size];
    }

    set size(value) {
        this.#size.splice(0, 2, ...value);

        const imageSmoothingEnabled = this.context.imageSmoothingEnabled;

        this.canvas.width = value[0];
        this.canvas.height = value[1];

        this.context.imageSmoothingEnabled = imageSmoothingEnabled;
    }

    get width() {
        return this.#size[0];
    }

    set width(value) {
        this.#size[0] = value;

        this.canvas.width = value;
    }

    get height() {
        return this.#size[1];
    }

    set height(value) {
        this.#size[1] = value;

        this.canvas.height = value;
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

	static createOffscreen(size) {
		return new Screen({
			canvas: document.createElement('canvas'),
			size,
		});
	}
}