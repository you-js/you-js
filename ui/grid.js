import { View } from "./view.js";
import { ViewEvaluater } from "./view-evaluater.js";

const Orientation = {
    Horizontal: Symbol('horizontal'),
    Vertical: Symbol('vertical'),
};

export class Grid extends View {

    static Orientation = Orientation;

    constructor({
        position=[0, 0],
        size=[View.Size.Wrap, View.Size.Wrap],
        itemPadding=0,
        itemSize,
        itemOrientation=Orientation.Horizontal,
        rows=1, columns=1,
        ...args
    }, ...children) {
        super({
            evaluater: null,
            ...args,
        }, ...children);

        this.evaluater = new GridEvaluater({
            position,
            size,
        });

        this.itemPadding = itemPadding;
        this.itemSize = itemSize;
        this.itemOrientation = itemOrientation;
        this.rows = rows == null ? null : Math.floor(Math.max(0, rows));
        this.columns = columns == null ? null : Math.floor(Math.max(0, columns));

        if (rows == null) {
            this.itemOrientation = Orientation.Horizontal;
        }
        else if (columns == null) {
            this.itemOrientation = Orientation.Vertical;
        }
    }
}

class GridEvaluater extends ViewEvaluater {

    evaluateWrapSizeSelf(view) {
        if (view.rows == null && view.columns == null) { return }

        this.#align(view);

        if (view.evaluater.size[0] === View.Size.Wrap) {
            if (view.container._children.legnth <= 0) {
                view.evaluater.actualSize[0] = 0;
            }
            else {
                const columns = view.columns ?? Math.ceil(view.container._children.length / view.rows);

                view.evaluater.actualSize[0] = (view.itemSize[0] + view.itemPadding) * Math.min(view.container._children.length, columns) - view.itemPadding;
                view.evaluater.actualSize[0] += view.padding * 2;
            }
        }

        if (view.evaluater.size[1] === View.Size.Wrap) {
            if (view.container._children.legnth <= 0) {
                view.evaluater.actualSize[1] = 0;
            }
            else {
                const rows = view.rows ?? Math.ceil(view.container._children.length / view.columns);

                view.evaluater.actualSize[1] = (view.itemSize[1] + view.itemPadding) * Math.min(view.container._children.length, rows) - view.itemPadding;
                view.evaluater.actualSize[1] += view.padding * 2;
            }
        }
    }

    #align(view) {
        const gridOrientationIndex = this.#getGridOrientationIndex(view);
        const itemSize = view.itemSize;

        let cumulativeSize = [0, 0];

        const rows = view.rows ?? Math.ceil(view.container._children.length / view.columns);
        const columns = view.columns ?? Math.ceil(view.container._children.length / view.rows);

        const counterOrientationLength = gridOrientationIndex === 0 ? rows : columns;
        const orientationLength = gridOrientationIndex === 0 ? columns : rows;

        for (let co = 0, i = 0; co < counterOrientationLength && i < view.container._children.length; co++) {
            for (let o = 0; o < orientationLength && i < view.container._children.length; o++, i++) {
                const object = view.container._children[i];

                const objectPosition = [
                    Math.floor(cumulativeSize[0]),
                    Math.floor(cumulativeSize[1]),
                ];

                object.evaluater.position.splice(0, 2, ...objectPosition);
                object.evaluater.actualPosition.splice(0, 2, ...objectPosition);

                const objectSize = [
                    Math.floor(cumulativeSize[0] + itemSize[0]) - Math.floor(cumulativeSize[0]),
                    Math.floor(cumulativeSize[1] + itemSize[1]) - Math.floor(cumulativeSize[1]),
                ];

                object.evaluater.size.splice(0, 2, ...objectSize);
                object.evaluater.actualSize.splice(0, 2, ...objectSize);

                cumulativeSize[gridOrientationIndex] += itemSize[gridOrientationIndex] + view.itemPadding;
            }

            cumulativeSize[gridOrientationIndex] = 0;
            cumulativeSize[1 - gridOrientationIndex] += itemSize[1 - gridOrientationIndex] + view.itemPadding;
        }
    }

    #getGridOrientationIndex(view) {
        switch (view.itemOrientation) {
            case Orientation.Horizontal:
                return 0;
            case Orientation.Vertical:
                return 1;
            default:
                throw 'NotImplementedError';
        }
    }
}