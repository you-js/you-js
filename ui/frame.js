import { View } from "./view.js";

export class Frame extends View {

    _view = null;

    create() {
        this.onCreate();

        for (const view of this.container._children) {
            view.create();
        }

        for (const view of this.container._children) {
            view.hide();
        }

        if (this.container._children.length > 0) {
            this.showChildView(this.container._children[0].name);
        }
    }

    showChildView(name) {
        this._view?.hide();
        this._view = this.findViewByName(name);
        this._view?.show();
    }
}