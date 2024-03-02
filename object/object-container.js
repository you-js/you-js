import { Object } from './object.js';

export class ObjectContainer {

    constructor({
        object,
        objects=[],
    }) {
        this.object = object;
        this.objects = objects;

        this.objects.forEach(object => {
            if (!(object instanceof Object)) {
                throw `object is not an instance of Object`;
            }

            object._parent = this;
        });
    }

    add(...objects) {
        objects.forEach(object => {
            object._parent = this;

            this.objects.push(object);

            if (this.object.state.isCreated) {
                object.create();
            }
        });
    }

    remove(...objects) {
        objects.forEach(object => {
            const index = this.objects.indexOf(object);

            if (index >= 0) {
                const object = this.objects[index];

                object.destroy();

                this.objects.splice(index, 1);

                object._parent = null;
            }
        });
    }

    findById(id) {
        return this.objects.find(object => object.id === id);
    }

    findByName(name) {
        return this.objects.find(object => object.name === name);
    }

    findAllByName(name) {
        return this.objects.filter(object => object.name === name);
    }

    create() {
        this.objects.forEach(object => object.create());
    }

    destroy() {
        this.objects.forEach(object => object.destroy());
    }

    handle(events) {
        this.objects.forEach(object => object.handle(events));
    }

    update(deltaTime) {
        this.objects.forEach(object => object.update(deltaTime));
    }

    render(context, screenSize) {
        this.objects.forEach(object => object.render(context, screenSize));
    }

    renderWithCamera(context, camera) {
        this.objects.forEach(object => object.renderWithCamera(context, camera));
    }
}