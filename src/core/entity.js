import { Component } from './component.js';

export class Entity {
    constructor(x = 0, y = 0, width = 32, height = 32) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.components = [];
    }

    addComponent(component) {
        if (!(component instanceof Component)) {
            throw new Error('Entity.addComponent: argument must be an instance of Component');
        }
        this.components.push(component);
        component.onAttach(this);
        return this;
    }

    getComponent(componentClass) {
        return this.components.find(c => c instanceof componentClass);
    }

    update(deltaTime) {
        for (const component of this.components) {
            component.update(deltaTime);
        }
    }

    draw(context) {
        for (const component of this.components) {
            component.draw(context);
        }
    }
}
