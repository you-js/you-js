export class Component {
    constructor() {
        this.entity = null;
        this._hasStarted = false;
    }

    onAttach(entity) {
        this.entity = entity;
    }

    onDetach() {
        this.entity = null;
    }

    onDestroy() {}

    start() {}

    update(deltaTime) {}

    draw(context) {}
}
