export class ObjectUpdater {

    constructor({
        object,
    }) {
        this.object = object;
    }

    update(deltaTime) {
        this.object.componentContainer.update(deltaTime);
        this.object.objectContainer.update(deltaTime);
    }
}