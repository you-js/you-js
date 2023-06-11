import { Loopable } from "./framework/object.js";

export class Application extends Loopable {

	engine = null;

	constructor({
		events={},
		asset,
	}={}) {
		super({ events });
		this.asset = asset;
	}

	get screen() { return this.engine.screen }

	async load(...args) {
		return await this.onLoad(...args);
	}
	async onLoad(...args) {}

	render(context, screen) {
		screen.clear();

		super.render(context, screen);
	}
}

export class SceneApplication extends Application {

	scenes = [];
	queue = [];

	push(scene, ...args) {
		this.queue.push({ type:'push', scene, args });
	}

	pop(...args) {
		this.queue.push({ type: 'pop', args });
	}

	transit(scene, { exitArgs=[], enterArgs=[] }={}) {
		this.pop(...exitArgs);
		this.push(scene, ...enterArgs);
	}

	update(deltaTime, input) {
		while (this.queue.length > 0) {
			const item = this.queue.shift();
			if (item.type === 'push') {
				const scene = item.scene;
				this.scenes.unshift(scene);
				scene.application = this;
				scene.create(...item.args);
			}
			else if (item.type === 'pop') {
				const scene = this.scenes.shift();
				scene.destroy(...item.args);
				scene.application = null;
			}
		}

		this.scenes[0]?.handleUIEvent(input.events);

		this.willUpdate(deltaTime, input);
		this.event.emit('willUpdate', deltaTime, input);
		this.scenes[0]?.update(deltaTime, input);
		this.didUpdate(deltaTime, input);
		this.event.emit('didUpdate', deltaTime, input);
	}

	render(context, screen) {
		super.render(context, screen);

		this.willRender(context, screen);
		this.event.emit('willRender', context, screen);
		this.scenes[0]?.render(context, screen);
		this.didRender(context, screen);
		this.event.emit('didRender', context, screen);
	}
}