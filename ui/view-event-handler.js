import { View } from "./view.js";

export class ViewEventHandler {

    constructor({
        events,
    }) {
        this.events = events;

        this.mouseIn = false;
    }

    handle(events, policy, globalArea, children) {
        this._handleChildren(events, policy, globalArea, children);
        this._handleSelf(events, policy, globalArea);
    }

    _handleChildren(events, policy, globalArea, children) {
        const isRenderingChildren = (
            policy.rendering === View.TargetPolicy.Children ||
            policy.rendering === View.TargetPolicy.Both
        );

        if (!isRenderingChildren) { return }

        const isHandlingChildren = (
            policy.handling === View.TargetPolicy.Children ||
            policy.handling === View.TargetPolicy.Both
        );

        if (!isHandlingChildren) { return }

        const propagatingEvents = [];

        for (const event of events) {
            if (event.type.startsWith('mouse')) {
                const isMouseUp = event.type === 'mouseup';
                const isMouseMoveIn = event.type === 'mousemove' && this.mouseIn;
                const containsMousePosition = globalArea.contains(event.position);

                if (isMouseUp || isMouseMoveIn || containsMousePosition) {
                    propagatingEvents.push(event);
                }
            }
            else {
                if (event.handled) { continue }

                propagatingEvents.push(event);
            }
        }

        if (propagatingEvents.length >= 1) {
            for (let i = children.length - 1; i >= 0; i--) {
                children[i].handle(propagatingEvents);
            }
        }
    }

    _handleSelf(events, policy, globalArea) {
        const isRenderingSelf = (
            policy.rendering === View.TargetPolicy.Self ||
            policy.rendering === View.TargetPolicy.Both
        );

        if (!isRenderingSelf) { return }

        const isHandlingSelf = (
            policy.handling === View.TargetPolicy.Self ||
            policy.handling === View.TargetPolicy.Both
        );

        if (!isHandlingSelf) { return }

        for (const event of events) {
            if (event.type === 'mousedown') {
                this._handleMouseDown(event, globalArea);
            }
            else if (event.type === 'mousemove') {
                this._handleMouseMove(event, globalArea);
            }
            else if (event.type === 'mouseup') {
                this._handleMouseUp(event, globalArea)
            }
        }
    }

    _handleMouseDown(event, globalArea) {
        if (event.handled) { return }

        const mousePosition = event.position;

        if (globalArea.contains(mousePosition)) {
            this.events.emit('mousedown', event);
            event.handled = true;

            this.mouseDown = true;
        }
    }

    _handleMouseMove(event, globalArea) {
        const mousePosition = event.position;

        if (globalArea.contains(mousePosition)) {
            if (!event.handled) {
                this.events.emit('mousemove', event);
                event.handled = true;
            }

            if (!this.mouseIn) {
                this.events.emit('mousein', event);
                this.mouseIn = true;
            }
        }
        else {
            if (this.mouseIn) {
                this.events.emit('mouseout', event);
                this.mouseIn = false;
            }
        }
    }

    _handleMouseUp(event, globalArea) {
        const mousePosition = event.position;

        if (globalArea.contains(mousePosition)) {
            if (!event.handled) {
                this.events.emit('mouseup', event);
                event.handled = true;

                if (this.mouseDown) {
                    this.events.emit('click', event);
                }
            }
        }

        this.mouseDown = false;
    }

    resetStates(children) {
        this.mouseDown = false;
        this.mouseIn = false;

        children.forEach(child => child.eventHandler.resetStates(child._objects));
    }
}