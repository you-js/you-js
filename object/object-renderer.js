export class ObjectRenderer {

    transform;

    constructor({
        object,
    }) {
        this.object = object;
    }

    render(context, screenSize) {
        context.save();

        if (this.transform != null) {
            context.translate(...this.transform.position.map(Math.floor));
        }

        this.object.componentContainer.render(context, screenSize);
        this.object.objectContainer.render(context, screenSize);

        context.restore();
    }
}