import { View } from "./view.js";

export class Grid extends View {

    constructor({
        itemPadding=0,
        itemSize,
        rows=1, columns=1,
        ...args
    }={}) {
        super(args);

        this.itemPadding = itemPadding;
        this.itemSize = itemSize;
        this.rows = rows;
        this.columns = columns;
    }

    evaluateWrapSizeSelf() {
        if (this._size[0] === View.Size.Wrap) {
            if (this._objects.legnth <= 0) {
                this._realSize[0] = 0;
            }
            else {
                this._realSize[0] = (this.itemSize[0] + this.itemPadding) * Math.min(this._objects.length, this.columns) - this.itemPadding;
            }

            this._realSize[0] += this.padding * 2;
        }

        if (this._size[1] === View.Size.Wrap) {
            if (this._objects.legnth <= 0) {
                this._realSize[1] = 0;
            }
            else {
                this._realSize[1] = (this.itemSize[1] + this.itemPadding) * Math.min(this._objects.length, this.rows) - this.itemPadding;
            }

            this._realSize[1] += this.padding * 2;
        }
    }

    #align() {
        const itemSize = this.itemSize;

        let cumulativeSize = [0, 0];
        for (let r = 0, i = 0; r < this.rows && i < this._objects.length; r++) {
            for (let c = 0; c < this.columns && i < this._objects.length; c++, i++) {
                const object = this._objects[i];

                const objectPosition = [
                    Math.floor(cumulativeSize[0]),
                    Math.floor(cumulativeSize[1]),
                ];

                object._position.splice(0, 2, ...objectPosition);
                object._realPosition.splice(0, 2, ...objectPosition);

                const objectSize = [
                    Math.floor(cumulativeSize[0] + itemSize[0]) - Math.floor(cumulativeSize[0]),
                    Math.floor(cumulativeSize[1] + itemSize[1]) - Math.floor(cumulativeSize[1]),
                ];

                object._size.splice(0, 2, ...objectSize);
                object._realSize.splice(0, 2, ...objectSize);

                cumulativeSize[0] += itemSize[0] + this.itemPadding;
            }

            cumulativeSize[0] = 0;
            cumulativeSize[1] += itemSize[1] + this.itemPadding;
        }
    }

    get objects() { return this._objects }
    set objects(value) {
        if (!(value instanceof Array)) {
            throw `Expected an array, but got ${value}`;
        }

        this._objects.forEach(object => object.parent = null);
        this._objects.splice(0, this._objects.length, ...value);
        if (this.parent) {
            this.#align();
            this.evaluate();
        }
        this._objects.forEach(object => object.parent = this);
    }

    add(object) {
        this._objects.push(object);
        object.parent = this;

        if (this.parent) {
            this.#align();
            this.evaluate();
        }
    }

    remove(object) {
        const index = this._objects.indexOf(object);
        if (index >= 0) {
            this._objects.splice(index, 1);
            object.parent = null;

            if (this.parent) {
                this.#align();
                this.evaluate();
            }
        }
    }

    create() {
        this.onCreate();

        this.#align();

        for (const object of this._objects) {
            object.create();
        }
    }
}