import { Object } from './object.js';

export class ObjectContainer {

    valid = true;

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

            object._parent = this.object;
        });
    }

    invalidate() {
        this.valid = false;
    }

    setScene(scene) {
        this.objects.forEach(object => object.scene = scene);
    }

    add(...objects) {
        objects.forEach(object => {
            object._parent = this.object;
            object.scene = this.object._scene;

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

                object.scene = null;
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
        if (this.valid === false) {
            this.objects = this.objects.filter(object => object.state.isDestroyed === false);

            this.valid = true;
        }

        this.objects.forEach(object => object.update(deltaTime));
    }

    render(context, screenSize) {
        this.objects.forEach(object => object.render(context, screenSize));
    }

    renderWithCamera(context, camera) {
        this.objects.forEach(object => object.renderWithCamera(context, camera));
    }

    receive(message, sender, options) {
        this.objects.forEach(object => {
            if (object.enable === false) { return }

            object.receive(message, sender, options);
        });
    }
}