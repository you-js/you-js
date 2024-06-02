export class ObjectRenderer {

    transform;

    constructor({
        object,
        transform,
    }) {
        this.object = object;
        this.transform = transform;
    }

    render(context, screenSize) {
        context.save();

        if (this.transform != null) {
            context.translate(...this.transform.position.map(Math.floor));
            context.rotate(this.transform.rotation);
        }

        this.object.componentContainer.render(context, screenSize);
        this.object.objectContainer.render(context, screenSize);

        context.restore();
    }
}