import { View } from "./view.js";

export class ViewEvaluater {

    position = [0, 0];
    size = [0, 0];
    actualPosition = [null, null];
    actualSize = [null, null];

    constructor({
        position,
        size,
    }) {
        this.position = position;
        this.size = size;

        this.setPosition(position);
        this.setSize(size);
    }

    setPosition(value, view) {
        this.position.splice(0, 2, ...value);

        const [x, y] = value;

        if (typeof x === 'number') {
            this.actualPosition[0] = x;
        }

        if (typeof y === 'number') {
            this.actualPosition[1] = y;
        }

        if (view?.parent != null) {
            this.evaluatePosition(view.parent.innerSize, view);
            view.parent.evaluateWrapSize();
        }
    }

    setSize(value, view) {
        this.size.splice(0, 2, ...value);

        const [width, height] = value;

        if (width === View.Size.Fill) {
            if (view?.parent != null) {
                this.evaluateFillSize(view.parent.size, view);
            }
        }
        else if (width === View.Size.Wrap) {
            if (view?.parent != null)
            {
                this.evaluateWrapSize(view);
            }
        }
        else {
            this.actualSize[0] = width;
        }

        if (height === View.Size.Fill) {
            if (view?.parent != null) {
                this.evaluateFillSize(view.parent.size, view);
            }
        }
        else if (height === View.Size.Wrap) {
            if (view?.parent != null)
            {
                this.evaluateWrapSize(view);
            }
        }
        else {
            this.actualSize[1] = height;
        }

        if (view?.parent != null) {
            if (this.actualSize[0] != null && this.actualSize[1] != null) {
                view.parent.evaluate();
            }
        }
    }

    evaluate(parentSize, view) {
        this.evaluateWrapSize(view);

        if (parentSize == null && view.parent == null) { return }

        parentSize ??= view.parent.innerSize;

        this.evaluateFillSize(parentSize, view);
    }

    evaluateWrapSize(view) {
        view.container._children.forEach(child => child.evaluateWrapSize());

        this.evaluateWrapSizeSelf(view);
    }

    evaluateWrapSizeSelf(view) {
        if (this.size[0] === View.Size.Wrap) {
            this.actualSize[0] = 0;

            let end = null;

            for (const object of view.container._children) {
                if (end == null || end < (object.evaluater.actualPosition[0] ?? 0) + (object.evaluater.actualSize[0] ?? 0)) {
                    end = (object.evaluater.actualPosition[0] ?? 0) + (object.evaluater.actualSize[0] ?? 0);
                }
            }

            if (end != null) {
                this.actualSize[0] = end + view.padding * 2;
            }
        }

        if (this.size[1] === View.Size.Wrap) {
            this.actualSize[1] = 0;

            let end = null;

            for (const object of view.container._children) {
                if (end == null || end < object.evaluater.actualPosition[1] + (object.evaluater.actualSize[1] ?? 0)) {
                    end = object.evaluater.actualPosition[1] + (object.evaluater.actualSize[1] ?? 0);
                }
            }

            if (end != null) {
                this.actualSize[1] = end + view.padding * 2;
            }
        }
    }

    evaluateFillSize(parentSize, view) {
        this.evaluateFillSizeSelf(parentSize, view);
        this.evaluatePosition(parentSize, view);

        view.container._children.forEach(child => child.evaluateFillSize(view.innerSize));
    }

    evaluateFillSizeSelf(parentSize, view) {
        const [parentWidth, parentHeight] = parentSize;

        if (this.size[0] === View.Size.Fill) {
            this.actualSize[0] = parentWidth;
            this.actualPosition[0] = 0;
        }

        if (this.size[1] === View.Size.Fill) {
            this.actualSize[1] = parentHeight;
            this.actualPosition[1] = 0;
        }
    }

    evaluatePosition(parentSize, view) {
        const [parentWidth, parentHeight] = parentSize ?? view.parent.innerSize;

        if (this.position[0] === View.Position.Start) {
            this.actualPosition[0] = 0;
        }
        else if (this.position[0] === View.Position.Center) {
            this.actualPosition[0] = Math.floor((parentWidth - this.actualSize[0]) / 2);
        }
        else if (this.position[0] === View.Position.End) {
            this.actualPosition[0] = parentWidth - this.actualSize[0];
        }

        if (this.position[1] === View.Position.Start) {
            this.actualPosition[1] = 0;
        }
        else if (this.position[1] === View.Position.Center) {
            this.actualPosition[1] = Math.floor((parentHeight - this.actualSize[1]) / 2);
        }
        else if (this.position[1] === View.Position.End) {
            this.actualPosition[1] = parentHeight - this.actualSize[1];
        }
    }
}