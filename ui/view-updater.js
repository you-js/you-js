import { View } from "./view.js";

export class ViewUpdater {

    update(deltaTime, view) {
        if (view.updatingPolicy.updating === false) { return }

        const isUpdatingSelf = (
            view.updatingPolicy.targetPolicy === View.TargetPolicy.Self ||
            view.updatingPolicy.targetPolicy === View.TargetPolicy.Both
        );

        if (isUpdatingSelf) {
            this._updateSelf(deltaTime);
        }

        const isUpdatingChildren = (
            view.updatingPolicy.targetPolicy === View.TargetPolicy.Children ||
            view.updatingPolicy.targetPolicy === View.TargetPolicy.Both
        );

        if (isUpdatingChildren) {
            this._updateChildren(deltaTime, view);
        }
    }

    _updateSelf(deltaTime) {}
    _updateChildren(deltaTime, view) {
        view.container._children.forEach(child => child.update(deltaTime));
    }
}