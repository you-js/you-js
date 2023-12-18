import { Label } from "./label.js";

const Type = {
    Number: Symbol('number'),
    Text: Symbol('text'),
};

export class Text extends Label {

    static Type = Type;
    static focused = null;

    _focus = false;

    constructor({
        type=Type.Text,
        focus=false,
        ...args
    }={}) {
        super({
            eventHandling: Text.TargetPolicy.Self,
            ...args
        });

        this.type = type;
        this.focus = focus;

        if (this.type === Type.Number) {
            this.text = '0';
        }

        this.events.on('click', (event, view) => {
            this.focus = true;
        });
    }

    get focus() { return this._focus }
    set focus(value) {
        if (value === true) {
            if (Text.focused) {
                Text.focused._focus = false;
                Text.focused.borderColor = 'white';
                Text.focused.events.emit('focusout');
            }
            Text.focused = this;
            this._focus = true;
            this.borderColor = 'red';
            this.events.emit('focusin');
        }
        else {
            if (Text.focused === this) {
                Text.focused = null;
            }
            this._focus = false;
            this.borderColor = 'white';
            this.events.emit('focusout');
        }
    }

    handle(events) {
        if (this.eventHandling === Label.TargetPolicy.Ignore || this.rendering === Label.TargetPolicy.Ignore) { return }

        const area = this.areaInGlobal;

        let propagatingEvents = [];

        for (const event of events) {
            if (event.handled) { continue }

            if (event.type.startsWith('mouse')) {
                const containsMousePosition = area.contains(event.position);

                if (event.type === 'mouseup' ||
                    event.type === 'mousemove' && this._mouseIn ||
                    containsMousePosition) {
                    propagatingEvents.push(event);
                }
            }
            else {
                propagatingEvents.push(event);
            }
        }

        if (!(this.eventHandling === Label.TargetPolicy.Self || this.rendering === Label.TargetPolicy.Self)) {
            if (propagatingEvents.length > 0) {
                this._objects.toReversed().forEach(object => object.handle(propagatingEvents));
            }
        }

        if (!(this.eventHandling === Label.TargetPolicy.Children || this.rendering === Label.TargetPolicy.Children)) {
            this.onHandle(events);

            for (const event of events) {
                if (event.type !== 'mousemove' && event.handled) { continue }

                if (event.type === 'mousedown') {
                    if (propagatingEvents.includes(event)) {
                        this.events.emit('mousedown', event);
                        event.handled = true;

                        this.focus = true;

                        this._mouseDown = true;
                    }
                    else {
                        this.focus = false;
                    }
                }
                else if (event.type === 'mousemove') {
                    const screenPosition = event.position;
                    if (area.contains(screenPosition)) {
                        this.events.emit('mousemove', event);
                        event.handled = true;

                        if (!this._mouseIn) {
                            this.events.emit('mousein', event);
                            this._mouseIn = true;
                        }
                    }
                    else {
                        if (this._mouseIn) {
                            this.events.emit('mouseout', event);
                            this._mouseIn = false;
                        }
                    }
                }
                else if (event.type === 'mouseup') {
                    const screenPosition = event.position;
                    if (area.contains(screenPosition)) {
                        this.events.emit('mouseup', event);
                        event.handled = true;

                        if (this._mouseDown) {
                            this.events.emit('click', event);
                        }
                    }
                    else {
                        this.focus = false;
                    }

                    this._mouseDown = false;
                }
                else if (event.type === 'keydown') {
                    if (this._focus) {
                        this.events.emit('keydown');
                        event.handled = true;

                        if (event.key === 'Backspace') {
                            this.#typeBackspaceKey();
                        } else {
                            this.#typeTextKey(event.key);
                        }

                        if (this.parent == null) {
                            this.evaluate(globalThis.screen.size);
                        }
                        else {
                            this.parent?.evaluate();
                        }
                    }
                }
                else if (event.type === 'keyup') {
                    if (this._focus) {
                        this.events.emit('keyup');
                        event.handled = true;
                    }
                }
            }
        }
    }

    #typeBackspaceKey() {
        const previousText = this.text;

        this.text = this.text.slice(0, -1);

        if (this.type === Type.Number) {
            if (this.text === '') {
                this.text = '0';
            }
        }

        if (previousText !== this.text) {
            this.events.emit('change', this.text);
        }
    }

    #typeTextKey(key) {
        const previousText = this.text;

        if (this.type === Type.Number) {
            if (key.startsWith('Digit')) {
                const number = key.slice(-1);

                this.#appendNumberAtLast(number);
            }
        }
        else if (this.type === Type.Text) {
            if (key.startsWith('Digit') || key.startsWith('Key')) {
                const text = key.slice(-1).toLowerCase();

                this.#appendNormalTextAtLast(text);
            }
        }

        if (previousText !== this.text) {
            this.events.emit('change', this.text);
        }
    }

    #appendNumberAtLast(number) {
        if (this.text === '0') {
            this.text = '';
        }

        this.#appendTextAtLast(number);
    }

    #appendNormalTextAtLast(text) {
        this.#appendTextAtLast(text);
    }

    #appendTextAtLast(text) {
        this.text += text;
    }
}