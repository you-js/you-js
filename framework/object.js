import { EventEmitter } from "../utility/event.js";

export class Object {

	constructor({
		events={},
	}={}) {
		globalThis.Object.defineProperty(this, 'event', { value: new EventEmitter(this) });
		globalThis.Object.keys(events).forEach(event => this.event.on(event, events[event]));
	}

	create(...args) {
		this.willCreate(...args);
		this.event.emit('willCreate', ...args);
		this.didCreate(...args);
		this.event.emit('didCreate', ...args);
	}
	willCreate(...args) {}
	didCreate(...args) {}

	destroy(...args) {
		this.willDestroy(...args);
		this.event.emit('willDestroy', ...args);
		this.didDestroy(...args);
		this.event.emit('didDestroy', ...args);
	}
	willDestroy(...args) {}
	didDestroy(...args) {}
}

export class Loopable extends Object {

	update(deltaTime, input) {
		this.willUpdate(deltaTime, input);
		this.event.emit('willUpdate', deltaTime, input);
		this.didUpdate(deltaTime, input);
		this.event.emit('didUpdate', deltaTime, input);
	}
	willUpdate(deltaTime, input) {}
	didUpdate(deltaTime, input) {}

	render(context, screen) {
		this.willRender(context, screen);
		this.event.emit('willRender', context, screen);
		this.didRender(context, screen);
		this.event.emit('didRender', context, screen);
	}
	willRender(context, screen) {}
	didRender(context, screen) {}
}

export const ENABLE = Symbol('enable');

export class Enable extends Loopable {

	constructor({
		enable=true,
		events={},
	}={}) {
		super({ events });

		globalThis.Object.defineProperty(this, ENABLE, { value: enable, writable: true });
	}

	get enable() { return this[ENABLE] }
	set enable(value) {
		if (value === true) {
			this.willEnable();
			this.event.emit('willEnable', value);
			this[ENABLE] = value;
			this.didEnable();
			this.event.emit('didEnable', value);
		}
		else if (value === false) {
			this.willDisable();
			this.event.emit('willDisable', value);
			this[ENABLE] = value;
			this.didDisable();
			this.event.emit('didDisable', value);
		}
	}
	willEnable() {}
	didEnable() {}
	willDisable() {}
	didDisable() {}

	update(deltaTime, input) {
		if (!this[ENABLE]) { return }

		this.willUpdate(deltaTime, input);
		this.event.emit('willUpdate', deltaTime, input);
		this.didUpdate(deltaTime, input);
		this.event.emit('didUpdate', deltaTime, input);
	}

	render(context, screen) {
		if (!this[ENABLE]) { return }

		this.willRender(context, screen);
		this.event.emit('willRender', context, screen);
		this.didRender(context, screen);
		this.event.emit('didRender', context, screen);
	}
}

export const STATES = {
	INSTANTIATED: Symbol('state.instantiated'),
	CREATED: Symbol('state.created'),
	DESTROYING: Symbol('state.destroying'),
	DESTROYED: Symbol('state.destroyed'),
};

export const STATE = Symbol('state');

export class Stateful extends Enable {

	constructor({
		enable=true,
		events={},
	}={}) {
		super({ enable, events });

		globalThis.Object.defineProperty(this, STATE, { value: STATES.INSTANTIATED, writable: true });
	}

	get created() { return this[STATE] === STATES.CREATED }
	create(...args) {
		if (this[STATE] !== STATES.INSTANTIATED) { return }

		this.willCreate(...args);
		this.event.emit('willCreate', ...args);
		this[STATE] = STATES.CREATED;
		this.didCreate(...args);
		this.event.emit('didCreate', ...args);
	}

	get destroyed() { return this[STATE] === STATES.DESTROYED }
	destroy(...args) {
		if (this[STATE] !== STATES.CREATED) { return }

		this[STATE] = STATES.DESTROYING;
		this[ENABLE] = false;

		this.willDestroy(...args);
		this.event.emit('willDestroy', ...args);
		this[STATE] = STATES.DESTROYED;
		this.didDestroy(...args);
		this.event.emit('didDestroy', ...args);
	}

	get enable() { return this[ENABLE] }
	set enable(value) {
		if (this[STATE] === STATES.DESTROYING) { return }
		if (this[STATE] === STATES.DESTROYED) { return }

		if (value === true) {
			this.willEnable();
			this.event.emit('willEnable', value);
			this[ENABLE] = value;
			this.didEnable();
			this.event.emit('didEnable', value);
		}
		else if (value === false) {
			this.willDisable();
			this.event.emit('willDisable', value);
			this[ENABLE] = value;
			this.didDisable();
			this.event.emit('didDisable', value);
		}
	}

	update(deltaTime, input) {
		if (this[STATE] !== STATES.CREATED) { return }
		if (!this[ENABLE]) { return }

		this.willUpdate(deltaTime, input);
		this.event.emit('willUpdate', deltaTime, input);
		this.didUpdate(deltaTime, input);
		this.event.emit('didUpdate', deltaTime, input);
	}

	render(context, screen) {
		if (this[STATE] !== STATES.CREATED) { return }
		if (!this[ENABLE]) { return }

		this.willRender(context, screen);
		this.event.emit('willRender', context, screen);
		this.didRender(context, screen);
		this.event.emit('didRender', context, screen);
	}
}