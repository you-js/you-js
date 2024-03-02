export class ObjectEventHandler {

    constructor({
        object,
    }) {
        this.object = object;
    }

    handle(events) {
        this.object.componentContainer.handle(events);
        this.object.objectContainer.handle(events);
    }
}