import { Component } from './component.js';

export class ComponentContainer {

    constructor({
        object,
        components,
    }) {
        this.object = object;
        this.components = components;

        this.components.forEach(component => {
            if (!(component instanceof Component)) {
                throw `component is not an instance of Component`;
            }

            component._owner = object;
        });
    }

    add(...types) {
        types.forEach(type => {
            if (this.components.some(component => component instanceof type)) {
                throw `already has component of type ${type.name}`;
            }

            const component = new type();

            component._owner = this.object;

            this.components.push(component);
        });
    }

    remove(...types) {
        types.forEach(type => {
            const component = this.components.find(component => component instanceof type);

            if (component == null) { return }

            const index = this.components.indexOf(component);

            this.components.splice(index, 1);

            component._owner = null;

            component.destroy();
        });
    }

    has(type) {
        return this.components.some(component => component instanceof type);
    }

    find(type) {
        return this.components.find(component => component instanceof type);
    }

    create() {
        this.components.forEach(component => component.create());
    }

    destroy() {
        this.components.forEach(component => component.destroy());
    }

    handle(events) {
        this.components.forEach(component => component.handle(events));
    }

    update(deltaTime) {
        this.components.forEach(component => component.update(deltaTime));
    }

    render(context, screenSize) {
        this.components.forEach(component => component.render(context, screenSize));
    }

    renderWithCamera(context, camera) {
        this.components.forEach(component => component.renderWithCamera(context, camera));
    }

    receive(message, sender, options) {
        this.components.forEach(component => component.receive(message, sender, options));
    }

    static createByTypes({
        types=[],
    }) {
        const componentContainer = new ComponentContainer();

        componentContainer.add(...types);

        return componentContainer;
    }
}