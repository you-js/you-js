import { View } from "./view.js";

export class Frame extends View {

    view = null;

    create() {
        this.onCreate();

        for (const object of this._objects) {
            object.create();
        }

        for (const object of this._objects) {
            object.rendering = View.TargetPolicy.Ignore;
        }

        if (this._objects.length > 0) {
            this.show(this._objects[0].name);
        }
    }

    show(name) {
        if (this.view) {
            this.view.rendering = View.TargetPolicy.Ignore;
        }

        this.view = this.findByName(name);

        if (this.view) {
            this.view.rendering = View.TargetPolicy.Both;
        }
    }
}