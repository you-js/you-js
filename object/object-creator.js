export class ObjectCreator {

    constructor({
        object,
    }) {
        this.object = object;
    }

    create() {
        this.object.componentContainer.create();
        this.object.objectContainer.create();
    }
}