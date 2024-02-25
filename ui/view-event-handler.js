import { View } from "./view.js";

export class ViewEventHandler {

    constructor({
        events,
    }) {
        this.events = events;

        this.mouseDown = false;
        this.mouseIn = false;
    }

    handle(events, view) {
        if (view.eventHandlingPolicy.eventHandling === false) { return }
        if (view.renderingPolicy.rendering === false) { return }

        this._handleChildren(events, view);
        this._handleSelf(events, view);
    }

    _handleChildren(events, view) {
        const isRenderingChildren = (
            view.renderingPolicy.targetPolicy === View.TargetPolicy.Children ||
            view.renderingPolicy.targetPolicy === View.TargetPolicy.Both
        );

        const isHandlingChildren = (
            view.eventHandlingPolicy.targetPolicy === View.TargetPolicy.Children ||
            view.eventHandlingPolicy.targetPolicy === View.TargetPolicy.Both
        );

        const propagatingEvents = [];

        for (const event of events) {
            if (event.type.startsWith('mouse')) {
                if (!isRenderingChildren) { continue }
                if (!isHandlingChildren) { continue }

                const isMouseUp = event.type === 'mouseup';
                if (isMouseUp) { propagatingEvents.push(event); continue }

                const isMouseMoveIn = event.type === 'mousemove' && this.mouseIn;
                if (isMouseMoveIn) { propagatingEvents.push(event); continue }

                const containsMousePosition = view.globalArea.contains(event.position);
                if (containsMousePosition) { propagatingEvents.push(event) }
            }
            else {
                if (event.handled) { continue }

                propagatingEvents.push(event);
            }
        }

        if (propagatingEvents.length >= 1) {
            for (let i = view.container._children.length - 1; i >= 0; i--) {
                view.container._children[i].handle(propagatingEvents);
            }
        }
    }

    _handleSelf(events, view) {
        const isRenderingSelf = (
            view.renderingPolicy.targetPolicy === View.TargetPolicy.Self ||
            view.renderingPolicy.targetPolicy === View.TargetPolicy.Both
        );

        const isHandlingSelf = (
            view.eventHandlingPolicy.targetPolicy === View.TargetPolicy.Self ||
            view.eventHandlingPolicy.targetPolicy === View.TargetPolicy.Both
        );

        for (const event of events) {
            if (event.type.startsWith('mouse')) {
                if (!isRenderingSelf) { continue }
                if (!isHandlingSelf) { continue }

                if (event.type === 'mousedown') {
                    this._handleMouseDown(event, view);
                }
                else if (event.type === 'mousemove') {
                    this._handleMouseMove(event, view);
                }
                else if (event.type === 'mouseup') {
                    this._handleMouseUp(event, view)
                }
            }
            else {
                if (event.handled) { continue }

                this.events.emit(event.type, event);
            }
        }
    }

    _handleMouseDown(event, view) {
        if (event.handled) { return }

        const mousePosition = event.position;

        if (view.globalArea.contains(mousePosition)) {
            this.events.emit('mousedown', event);
            event.handled = true;

            this.mouseDown = true;
        }
    }

    _handleMouseMove(event, view) {
        const mousePosition = event.position;

        if (view.globalArea.contains(mousePosition)) {
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

    _handleMouseUp(event, view) {
        const mousePosition = event.position;

        if (view.globalArea.contains(mousePosition)) {
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

        children.forEach(child => child.eventHandler.resetStates(child.container._children));
    }
}