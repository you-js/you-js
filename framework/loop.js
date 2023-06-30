if (!globalThis.requestAnimationFrame) {
	const startTime = new Date().getTime();
	let lastTime = 0;
	globalThis.requestAnimationFrame = function (callback, element) {
		const currTime = new Date().getTime();
		const timeToCall = Math.max(0, 16 - (currTime - lastTime));
		const id = globalThis.setTimeout(function () { callback(currTime + timeToCall - startTime) }, timeToCall);
		lastTime = currTime + timeToCall;
		return id;
	};
}

if (!globalThis.cancelAnimationFrame) {
	globalThis.cancelAnimationFrame = function (id) {
		clearTimeout(id);
	};
}

export class Loop {

    lastTime = null;
    running = false;

	start(handler) {
		this.running = true;
		globalThis.requestAnimationFrame(elapsedTime => this.loop(elapsedTime, handler));
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
			globalThis.requestAnimationFrame(elapsedTime => this.loop(elapsedTime, handler));
		}
	}
}