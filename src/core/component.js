export class Component {
    constructor() {
        this.entity = null;
        this._hasStarted = false;
    }

    onAttach(entity) {
        this.entity = entity;
    }

    start() {}

    update(deltaTime) {}

    draw(context) {}
}
