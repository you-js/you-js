let handle = null;
let startTime = Date.now();
let lastTime = startTime;

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

let lastElapsedTime = 0;

addEventListener('message', e => {
    if (e.data.type === 'request-update') {
        handle = requestAnimationFrame(elapsedTime => {
            const deltaTime = elapsedTime - lastElapsedTime;

            lastElapsedTime = elapsedTime;

            postMessage(deltaTime / 1000.0);
        });
    }
    else if (e.data.type === 'cancel-update') {
        cancelAnimationFrame(handle);
    }
});