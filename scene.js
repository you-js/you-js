import { ENABLE, STATE, STATES, Stateful } from "./framework/object.js";
import { Camera } from "./camera.js";
import { View } from "./ui/view.js";


export class Scene extends Stateful {

    application = null;
    objects = [];
    camera = null;

    create(...args) {
        if (this[STATE] === STATES.INSTANTIATED) {
            this.camera = (
                this.application.screen
                ? new Camera(this.application.screen)
                : null
            );

			this.willCreate(...args);
			this.event.emit('willCreate', ...args);
			this[STATE] = STATES.CREATED;
            this.objects.forEach(object => object.create(...args));
			this.didCreate(...args);
			this.event.emit('didCreate', ...args);
		}
	}

	destroy(...args) {
        if (this[STATE] === STATES.CREATED) {
			this.enable = false;

			this.willDestroy(...args);
			this.event.emit('willDestroy', ...args);
			this[STATE] = STATES.DESTROYED;
            this.objects.forEach(object => object.destroy(...args));
			this.didDestroy(...args);
			this.event.emit('didDestroy', ...args);

            this.application = null;
            this.objects = null;
            this.camera = null;
		}
	}

    update(deltaTime, input) {
        if (this[STATE] === STATES.CREATED && this[ENABLE]) {
			this.willUpdate(deltaTime, input);
			this.event.emit('willUpdate', deltaTime, input);
            this.objects.forEach(object => object.update(deltaTime, input));
			this.didUpdate(deltaTime, input);
			this.event.emit('didUpdate', deltaTime, input);
		}
	}

	render(context, screen) {
        if (this[STATE] === STATES.CREATED && this[ENABLE]) {
			this.willRender(context, screen);
			this.event.emit('willRender', context, screen);

            const camera = this.camera;

            if (camera) {
                context.save();
                context.translate(Math.floor(screen.width / 2), Math.floor(screen.height / 2));
                context.scale(...camera.scale);
                context.translate(-Math.floor(camera.position[0]), -Math.floor(camera.position[1]));
            }

            this.objects.forEach(object => {
                if (!(object instanceof View)) { object.render(context, screen) }
            });

            if (camera) {
                context.restore();
            }

            this.objects.forEach(object => {
                if (object instanceof View) { object.render(context, screen) }
            });

			this.didRender(context, screen);
			this.event.emit('didRender', context, screen);
		}
	}

    handleUIEvent(events) {
        if (this[STATE] === STATES.CREATED && this[ENABLE]) {
            for (let i = this.objects.length - 1; i >= 0; i--) {
                this.objects[i].handleUIEvent?.(events);
            }
        }
    }

    add(object, creation=true) {
        this.objects.push(object);
        object.parent = this;

        if (this[STATE] === STATES.CREATED && creation) {
            object.create();
        }
    }

    remove(object, destruction=true) {
        const index = this.objects.indexOf(object);

        if (index >= 0) {
            this.objects.splice(index, 1);
            object.parent = null;

            if (this[STATE] === STATES.CREATED && destruction) {
                object.destroy();
            }

            return object;
        }
        else {
            return null;
        }
    }

    find(name) {
        return this.objects.find(object => object.name === name);
    }

    findAll(name) {
        return this.objects.filter(object => object.name === name);
    }

    findByTags(...tags) {
		return this.objects.filter(object => tags.some(taglist => taglist.every(tag => object.tags.has(tag))));
	}

    push(scene, ...enterArgs) {
        this.application.push(scene, ...enterArgs);
    }

    pop(...exitArgs) {
        this.application.pop(...exitArgs);
    }

    transit(scene, { exitArgs=[], enterArgs=[] }={}) {
        this.application.transit(scene, { exitArgs, enterArgs });
    }
}