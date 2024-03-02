export class ObjectDestroyer {

    constructor({
        object,
    }) {
        this.object = object;
    }

    destroy() {
        this.object.componentContainer.destroy();
        this.object.objectContainer.destroy();
    }
}