import { View } from "./view.js";
import { ViewEvaluater } from "./view-evaluater.js";

class Stack extends View {

    constructor({
        position=[0, 0],
        size=[View.Size.Wrap, View.Size.Wrap],
        itemPadding=0,
        ...args
    }, ...children) {
        super({
            evaluater: null,
            ...args,
        }, ...children);

        this.evaluater = new StackEvaluater({
            position,
            size,
        });

        this.itemPadding = itemPadding;
    }

    getStackDirectionIndex() {
        throw 'NotImplementedError';
    }
}

class StackEvaluater extends ViewEvaluater {

    evaluateWrapSizeSelf(view) {
        this.#align(view);
        super.evaluateWrapSizeSelf(view);
    }

    evaluateFillSize(parentSize, view) {
        super.evaluateFillSize(parentSize, view);
        this.#align(view);
    }

    #align(view) {
        const stackDirectionIndex = view.getStackDirectionIndex();

        let cumulativeStackDirectionSize = 0;

        for (let i = 0; i < view.container._children.length; i++) {
            const object = view.container._children[i];

            object.evaluater.actualPosition[stackDirectionIndex] = cumulativeStackDirectionSize;

            cumulativeStackDirectionSize += object.evaluater.actualSize[stackDirectionIndex] + view.itemPadding;
        }
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