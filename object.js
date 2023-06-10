import { ENABLE, STATE, Stateful, STATES } from "./framework/object.js";


export class Object extends Stateful {

	name = null;
	tags = new Set();
	components = [];
	objects = [];

	constructor({
		name='', enable=true,
		tags=[],
		components=[],
		objects=[],
		events={},
	}={}) {
		super({
			enable,
			events,
		});

		this.name = name;
		tags.filter(tag => (tag ?? null) !== null).forEach(tag => this.tags.add(tag));
		components.forEach(component => this.addComponent(component));
		objects.forEach(object => this.add(object));

		window.Object.defineProperty(this, 'parent', { value: null, writable: true });
	}

	get root() { return this.parent?.root ?? this.parent }

	create(...args) {
		if (this[STATE] !== STATES.INSTANTIATED) { return }

		this.willCreate(...args);
		this.event.emit('willCreate', ...args);
		this[STATE] = STATES.CREATED;
		this.components.forEach(component => component.create(...args));
		this.objects.forEach(object => object.create(...args));
		this.didCreate(...args);
		this.event.emit('didCreate', ...args);
	}

	destroy(...args) {
		if (this[STATE] !== STATES.CREATED) { return }

		this[STATE] = STATES.DESTROYING;
		this[ENABLE] = false;

		this.willDestroy(...args);
		this.event.emit('willDestroy', ...args);
		this[STATE] = STATES.DESTROYED;
		this.components.forEach(component => component.destroy(...args));
		this.objects.forEach(object => object.destroy(...args));
		this.didDestroy(...args);
		this.event.emit('didDestroy', ...args);

		if (this.parent) {
			this.parent.remove(this);
			this.parent = null;
		}
	}

	update(deltaTime, input) {
		if (this[STATE] !== STATES.CREATED) { return }
		if (!this[ENABLE]) { return }

		this.willUpdate(deltaTime, input);
		this.event.emit('willUpdate', deltaTime, input);
		this.components.forEach(component => component.update(deltaTime, input));
		this.objects.forEach(object => object.update(deltaTime, input));
		this.didUpdate(deltaTime, input);
		this.event.emit('didUpdate', deltaTime, input);
	}

	render(context, screen) {
		if (this[STATE] !== STATES.CREATED) { return }
		if (!this[ENABLE]) { return }

		this.willRender(context, screen);
		this.event.emit('willRender', context, screen);
		this.components.forEach(component => component.render(context, screen));
		this.objects.forEach(object => object.render(context, screen));
		this.didRender(context, screen);
		this.event.emit('didRender', context, screen);
	}

	add(object) {
		if ((object ?? null) === null) { throw 'object is null' }

		this.objects.push(object);
        object.parent = this;

		if (this[STATE] === STATES.CREATED) {
			object.create();
		}
	}

	remove(object) {
		if ((object ?? null) === null) { throw 'object is null' }

		const index = this.objects.indexOf(object);

        if (index >= 0) {
            this.objects.splice(index, 1);

			if (this[STATE] !== STATES.INSTANTIATED) {
				object.destroy();
			}

			object.parent = null;
			return object;
        }
		else {
			return null;
		}
	}

	find(name) {
		return this.objects.find(object => object.name === name) ?? null;
	}

	findAll(name) {
		return this.objects.filter(object => object.name === name);
	}

	findByTags(...tags) {
		return this.objects.filter(object => tags.some(taglist => taglist.every(tag => object.tags.has(tag))));
	}

	addComponent(component) {
		if ((component ?? null) === null) { throw 'component is null' }

        this.components.push(component);
        component.object = this;
    }

    removeComponent(component) {
		if ((component ?? null) === null) { throw 'component is null' }

        const index = this.components.indexOf(component);

        if (index >= 0) {
            this.components.splice(index, 1);
            component.object = null;
        }
    }

	findComponent(type, requirement=false) {
		const component = this.components.find(component => component instanceof type);

		if (requirement && !component) { throw `The component is required: ${type.name}` }

		return component;
	}

	findAllComponent(type, requirement=false) {
		const components = this.components.filter(component => component instanceof type);

		if (requirement && components.length === 0) { throw `The component is required: ${type}` }

		return components;
	}
}