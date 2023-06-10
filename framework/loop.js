export class Loop {

    lastTime = null;
    running = false;

	start(handler) {
		this.running = true;
		window.requestAnimationFrame(elapsedTime => this.loop(elapsedTime, handler));
	}

	stop() {
		this.running = false;
	}

	loop(elapsedTime, handler) {
		if (this.lastTime === null) {
			this.lastTime = elapsedTime;
		}
		else {
			const deltaTime = elapsedTime - this.lastTime;
			this.lastTime = elapsedTime;

			handler(deltaTime);
		}

		if (this.running) {
			window.requestAnimationFrame(elapsedTime => this.loop(elapsedTime, handler));
		}
	}
}