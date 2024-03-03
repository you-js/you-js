import { Label } from "./label.js";
import { EventHandlingPolicy } from "./event-handling-policy.js";
import { ViewEventHandler } from "./view-event-handler.js";
import { View } from "./view.js";

const Type = {
    Number: Symbol('number'),
    Text: Symbol('text'),
};

export class Text extends Label {

    static Type = Type;
    static focused = null;

    constructor({
        type=Type.Text,
        focus=false,
        ...args
    }, ...children) {
        super({
            eventHandlingPolicy: new EventHandlingPolicy({ eventHandling: true, targetPolicy: Label.TargetPolicy.Self }),
            eventHandler: null,
            ...args
        }, ...children);

        this.eventHandler = new TextEventHandler({
            type,
            focus,
            events: this.events,
        });

        if (type === Type.Number) {
            this.text = '0';
        }

        this.events.on('click', (event, view) => {
            this.focus = true;
        });
    }

    get type() { return this.eventHandler.type }
    set type(value) { this.eventHandler.type = value }

    get focus() { return this.eventHandler.focus }
    set focus(value) {
        if (value === true && Text.focused !== this) {
            if (Text.focused != null) {
                Text.focused.eventHandler.focus = false;
                Text.focused.borderColor = 'white';
                Text.focused.events.emit('focusout');
            }
            Text.focused = this;
            this.eventHandler.focus = true;
            this.borderColor = 'red';
            this.events.emit('focusin');
        }
        else if (value === false && Text.focused === this) {
            Text.focused = null;
            this.eventHandler.focus = false;
            this.borderColor = 'white';
            this.events.emit('focusout');
        }
    }
}

class TextEventHandler extends ViewEventHandler {

    constructor({
        type=Type.Text,
        focus=false,
        ...args
    }) {
        super(args);

        this.type = type;
        this.focus = focus;
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
            else if (event.type === 'keydown') {
                if (this.focus) {
                    this.events.emit('keydown', event);
                    event.handled = true;

                    if (event.key === 'Backspace') {
                        this.#typeBackspaceKey(view);
                    } else if (event.key === 'Enter') {
                        this.events.emit('confirm');
                    } else if (event.key === 'Escape') {
                        this.events.emit('cancel');
                    } else {
                        this.#typeTextKey(event.key, view);
                    }

                    if (view.parent == null) {
                        view.evaluate(globalThis.screen.size);
                    }
                    else {
                        view.parent?.evaluate();
                    }
                }
            }
            else if (event.type === 'keyup') {
                if (this.focus) {
                    this.events.emit('keyup', event);
                    event.handled = true;
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

            view.focus = true;

            this.mouseDown = true;
        }
        else {
            view.focus = false;
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
        else {
            view.focus = false;
        }

        this.mouseDown = false;
    }

    #typeBackspaceKey(view) {
        const previousText = view.text;

        view.text = view.text.slice(0, -1);

        if (view.type === Type.Number) {
            if (view.text === '') {
                view.text = '0';
            }
        }

        if (previousText !== view.text) {
            this.events.emit('change', view.text);
        }
    }

    #typeTextKey(key, view) {
        const previousText = view.text;

        if (this.type === Type.Number) {
            if (key.startsWith('Digit')) {
                const number = key.slice(-1);

                this.#appendNumberAtLast(number, view);
            }
        }
        else if (this.type === Type.Text) {
            if (key.startsWith('Digit') || key.startsWith('Key')) {
                const text = key.slice(-1).toLowerCase();

                this.#appendNormalTextAtLast(text, view);
            }
        }

        if (previousText !== view.text) {
            this.events.emit('change', view.text);
        }
    }

    #appendNumberAtLast(number, view) {
        if (view.text === '0') {
            view.text = '';
        }

        this.#appendTextAtLast(number, view);
    }

    #appendNormalTextAtLast(text, view) {
        this.#appendTextAtLast(text, view);
    }

    #appendTextAtLast(text, view) {
        view.text += text;
    }
}