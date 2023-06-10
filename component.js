import { ENABLE, Enable } from "./framework/object.js";

export class Component extends Enable {

    constructor({
        enable=true, events={},
    }={}) {
        super({ enable, events });

		Object.defineProperty(this, 'object', { value: null, writable: true });
    }

    update(deltaTime, input) {
		if (!this[ENABLE]) { return }
		if (!this.object?.created) { return }

		this.willUpdate(deltaTime, input);
		this.event.emit('willUpdate', deltaTime, input);
		this.didUpdate(deltaTime, input);
		this.event.emit('didUpdate', deltaTime, input);
	}

    render(context, screen) {
		if (!this[ENABLE]) { return }
		if (!this.object?.created) { return }

		this.willRender(context, screen);
		this.event.emit('willRender', context, screen);
		this.didRender(context, screen);
		this.event.emit('didRender', context, screen);
	}
}