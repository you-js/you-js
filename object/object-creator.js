export class ObjectCreator {

    constructor({
        object,
    }) {
        this.object = object;
    }

    create(...args) {
        this.object.componentContainer.create(...args);
        this.object.objectContainer.create(...args);
    }
}