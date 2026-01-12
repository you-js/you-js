export class Component {
    constructor() {
        this.entity = null;
    }

    onAttach(entity) {
        this.entity = entity;
    }

    update(deltaTime) {}

    draw(context) {}
}
