import { Loop } from "./loop.js";

export class Engine {

	constructor() {
		this.loop = new Loop();
        this.screen = null;
		this.input = null;
		this.applications = [];
	}

	start() {
		this.applications.forEach(app => {
			app.engine = this;
			app.load().then(app.create.bind(app));
		});

		this.input.connect();

		this.loop.start(deltaTime => {
			this.applications.forEach(app => {
				app.update(deltaTime / 1000.0, this.input);
				app.render(this.screen.context, this.screen);
			});

			this.input.clear();
		});
	}

	stop() {
		this.loop.stop();

		this.input.disconnect();

		this.applications.forEach(app => {
			app.destroy();
			app.engine = null;
		});
	}
}