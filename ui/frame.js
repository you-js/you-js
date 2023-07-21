import { ENABLE, STATE, STATES } from "../framework/object.js";
import { View } from "./view.js";
import { Scene } from "../scene.js";


export class Frame extends View {

    view = null;

    create(...args) {
		if (this[STATE] !== STATES.INSTANTIATED) { return }
        if (this.position instanceof Function) {
            this.position = this.position.bind(this)(this, this.parent?.objects?.indexOf(this) ?? undefined);
        }
        if ((this.size ?? null) === null) {
            this.size = [null, null];
        }
        else if (this.size instanceof Function) {
            this.size = this.size.bind(this)(this, this.parent?.objects?.indexOf(this) ?? undefined);
        }

        if (this.size[0] === null) {
            this.size[0] = this.parent instanceof Scene ? this.scene.application.screen.size[0] : this.parent.size[0];
        }
        if (this.size[1] === null) {
            this.size[1] = this.parent instanceof Scene ? this.scene.application.screen.size[1] : this.parent.size[1];
        }

        this.willCreate(...args);
        this.event.emit('willCreate', ...args);
        this[STATE] = STATES.CREATED;

        this.objects.forEach(object => object.visible = false);
        this.view = this.objects?.[0];
        this.view.visible = true;

        this.components.forEach(component => component.create(...args));
        this.objects.forEach(object => object.create(...args));
        this.didCreate(...args);
        this.event.emit('didCreate', ...args);
	}

    handleUIEvent(events, input) {
        if (this[STATE] !== STATES.CREATED) { return }
        if (!this[ENABLE]) { return }
        if (!this.size) { return }
        if (this.size[0] === 0 || this.size[1] === 0) { return }

        const area = [...this.globalPosition, ...this.size];

        this.event.emit('willHandleUIEvent', events, input);

        const propagationEvents = new Set();
        for (const event of events) {
            if (!event.propagationToChild) { continue }
            if (!event.type.startsWith('mouse')) { continue }

            if (event.type === 'mouseup'
                || event.type === 'mousemove' && this._mouseIn
                || area.contains(event.position)) {
                propagationEvents.add(event);
            }
        }

        if (propagationEvents.size > 0) {
            this.view?.handleUIEvent?.(propagationEvents, input);
        }

        for (const event of events) {
            if (event.type !== 'mousemove') {
                if (!this.eventHandling) { continue }
                if (!event.propagationToParent) { continue }
            }

            if (event.type === 'mousedown') {
                if (propagationEvents.has(event)) {
                    event.propagationToParent = false;
                    this.event.emit('mousedown', event);
                    this._mouseDown = true;
                }
            }
            else if (event.type === 'mouseup') {
                if (area.contains(event.position)) {
                    event.propagationToParent = false;
                    this.event.emit('mouseup', event);
                    if (this._mouseDown) {
                        this.event.emit('click', event);
                    }
                }

                this._mouseDown = false;
            }
            else if (event.type === 'mousemove') {
                if (area.contains(event.position)) {
                    if (event.propagationToParent) {
                        event.propagationToParent = false;
                        this.event.emit('mousemove', event);
                    }
                    if (!this._mouseIn) {
                        this.event.emit('mousein', event);
                        this._mouseIn = true;
                    }
                }
                else {
                    if (this._mouseIn) {
                        this.event.emit('mouseout', event);
                        this._mouseIn = false;
                    }
                }
            }
            else if (event.type === 'mousewheel') {
                if (propagationEvents.has(event)) {
                    event.propagationToParent = false;
                    this.event.emit('mousewheel', event);
                }
            }
        }

        this.event.emit('didHandleUIEvent', events, input);
    }

    show(name) {
        if (this.view) { this.view.visible = false }

        this.view = this.find(name);
        if (this.view) {
            const index = this.objects.indexOf(this.view);
            this.objects.splice(index, 1);
            this.objects.push(this.view);
        }

        if (this.view) { this.view.visible = true }
    }
}