import { Loop } from "./loop.js";

export class Engine {

	constructor({ screen, input, application }) {
		this.loop = new Loop();
        this.screen = screen;
		this.input = input;
		this.application = application;
	}

	start() {
		this.application.engine = this;
		(async () => {
			const result = await this.application.load();
			this.application.create(result);
		})();

		this.input?.connect();

		this.loop.start(deltaTime => {
			this.application.update(deltaTime / 1000.0, this.input);
			this.screen && this.application?.render(this.screen.context, this.screen);

			this.input?.clear();
		});
	}

	stop() {
		this.loop.stop();

		this.input?.disconnect();

		this.application.destroy();
		this.application.engine = null;
	}
}