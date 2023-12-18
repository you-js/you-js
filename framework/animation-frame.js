if (requestAnimationFrame == null || cancelAnimationFrame == null) {
    const startTime = Date.now();

	let lastTime = 0;

	requestAnimationFrame = function (callback) {
		const currentTime = Date.now();

		const timeToCall = Math.max(0, 16 - (currentTime - lastTime));

		const id = setTimeout(
            () => callback(currentTime + timeToCall - startTime),
            timeToCall
        );

		lastTime = currentTime + timeToCall;

		return id;
	};

    cancelAnimationFrame = function (id) {
		clearTimeout(id);
	};
}