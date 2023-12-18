import {} from './animation-frame.js';

const LoopingMethod = {
    RequestAnimationFrame: Symbol('looping-method-requestAnimationFrame'),
    WebWorker: Symbol('looping-method-worker'),
};

export class Looper {

    #onVisibilityChangeCallback;
    #loopWithRequestAnimationFrameCallback;
    #useWithVisibilityState;

    #method = LoopingMethod.RequestAnimationFrame;
    #handle;
    #running = false;
    #updateHandler;
    #worker;

    #lastTime;

    constructor() {
        this.#onVisibilityChangeCallback = this.#onVisibilityChange.bind(this);
        this.#loopWithRequestAnimationFrameCallback = this.#loopWithRequestAnimationFrame.bind(this);

        this.#useWithVisibilityState = {
            visible: () => this.#use(LoopingMethod.RequestAnimationFrame),
            hidden: () => this.#use(LoopingMethod.WebWorker),
        };

        this.startWithMethod = {
            [LoopingMethod.RequestAnimationFrame]: this.#startWithRequestAnimationFrame.bind(this),
            [LoopingMethod.WebWorker]: this.#startWithWorker.bind(this),
        };

        this.stopWithMethod = {
            [LoopingMethod.RequestAnimationFrame]: this.#stopWithRequestAnimationFrame.bind(this),
            [LoopingMethod.WebWorker]: this.#stopWithWorker.bind(this),
        };
    }

    #onVisibilityChange(event) {
        this.#useWithVisibilityState[document.visibilityState]();
    }

    start(updateHandler) {
        this.#updateHandler = updateHandler;

        document.addEventListener('visibilitychange', this.#onVisibilityChangeCallback);

        this.#running = true;

        const startFunction = this.startWithMethod[this.#method];
        startFunction();
    }

    stop() {
        document.removeEventListener('visibilitychange', this.#onVisibilityChangeCallback);

		this.#running = false;

        const stopFunction = this.stopWithMethod[this.#method];
        stopFunction();
	}

    #startWithRequestAnimationFrame() {
        this.#handle = requestAnimationFrame(elapsedTime => {
            this.#lastTime = elapsedTime;

            this.#loopWithRequestAnimationFrame(elapsedTime);
        });
    }

    #stopWithRequestAnimationFrame() {
        this.#handle && cancelAnimationFrame(this.#handle);
        this.#handle = null;
    }

    #loopWithRequestAnimationFrame(elapsedTime) {
        const deltaTime = elapsedTime - this.#lastTime;
        this.#lastTime = elapsedTime;

        this.#running && this.#updateHandler(deltaTime / 1000.0);

        if (this.#running === false) { return }

        this.#handle = requestAnimationFrame(this.#loopWithRequestAnimationFrameCallback);
    }

    #startWithWorker() {
        const currentPath = import.meta.url.split('/').slice(0, -1).join('/');
        const workerPath = `${currentPath}/worker.js`;
        this.#worker = new Worker(workerPath);
        this.#worker.addEventListener('message', e => {
            this.#loopWithWorker(e.data);
        });
        this.#worker.postMessage({ type: 'request-update' });
    }

    #stopWithWorker() {
        this.#worker.postMessage({ type: 'cancel-update' });
        this.#worker.terminate();
        this.#worker = null;
    }

    #loopWithWorker(deltaTime) {
        this.#running && this.#updateHandler(deltaTime);

        if (this.#running === false) { return }

        this.#worker.postMessage({ type: 'request-update' });
    }

    #use(method) {
        this.stop();
        this.#method = method;
        this.start(this.#updateHandler);
    }
}