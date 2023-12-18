import { View } from "./view.js";

class Stack extends View {

    constructor({
        itemPadding=0,
        ...args
    }={}) {
        super(args);

        this.itemPadding = itemPadding;
    }

    evaluateWrapSizeSelf() {
        this.#align();
        super.evaluateWrapSizeSelf();
    }

    evaluateFillSize(parentSize) {
        super.evaluateFillSize(parentSize);
        this.#align();
    }

    #align() {
        const stackDirectionIndex = this.getStackDirectionIndex();

        let cumulativeStackDirectionSize = 0;

        for (let i = 0; i < this._objects.length; i++) {
            const object = this._objects[i];

            object._realPosition[stackDirectionIndex] = cumulativeStackDirectionSize;

            cumulativeStackDirectionSize += object._realSize[stackDirectionIndex] + this.itemPadding;
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

    getStackDirectionIndex() {
        throw 'NotImplementedError';
    }
}

export class VerticalStack extends Stack {

    getStackDirectionIndex() { return 1 }
}

export const VStack = VerticalStack;

export class HorizontalStack extends Stack {

    getStackDirectionIndex() { return 0 }
}

export const HStack = HorizontalStack;