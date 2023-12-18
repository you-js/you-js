import { EventQueue } from "./framework/event.js";
import { Scene } from './scene.js';
import { Camera } from "./camera.js";

export class Application {

    #scene = null;
    #nextScene = null;

    constructor({
        scene=null,
    }={}) {
        this.#scene = scene;

        this.eventQueue = new EventQueue();

        this.channels = {
            screen: null,
            mouse: null,
            keyboard: null,
        };
    }

    get scene() { return this.#scene }

    connect(channel) {
        if (channel.type === 'screen') {
            this.channels.screen = channel.object;
            this.channels.screen.connect(this.eventQueue);

            if (this.#scene != null) {
                this.#scene.screen = this.channels.screen;
                this.#scene.camera = new Camera({ screen: this.channels.screen });
            }
        }
        else if (channel.type === 'mouse') {
            this.channels.mouse = channel.object;
            this.channels.mouse.connect(this.eventQueue);
        }
        else if (channel.type === 'keyboard') {
            this.channels.keyboard = channel.object;
            this.channels.keyboard.connect(this.eventQueue);
        }
    }

    disconnect() {
        if (this.#scene != null) {
            this.#scene.screen = null;
            this.#scene.camera = null;
        }

        this.channels.screen.disconnect();
        this.channels.screen = null;
        this.channels.mouse.disconnect();
        this.channels.mouse = null;
        this.channels.keyboard.disconnect();
        this.channels.keyboard = null;
    }

    async load(assets) {
        await this.onLoad(assets);
    }

    async onLoad(assets) {}

    transit(scene) {
        if (!(scene instanceof Scene)) {
            throw `scene is not Scene instance: ${scene}`;
        }

        this.#nextScene = scene;
    }

    create() {
        this.willCreate();
        this.#scene?.create();
		this.didCreate();
    }

    willCreate() {}
	didCreate() {}

    destroy() {
        this.willDestroy();
        this.#scene?.destroy();
        this.willDestroy();
    }

	willDestroy() {}
	didDestroy() {}

    update(deltaTime) {
        this.willUpdate(deltaTime);

        this.#scene?.handle(this.eventQueue.events);
        this.#scene?.update(deltaTime);

		this.didUpdate(deltaTime);

        if (this.#nextScene != null) {
            this.#transitNextScene();
        }

        this.eventQueue.clear();
    }

    willUpdate(deltaTime) {}
    didUpdate(deltaTime) {}

    #transitNextScene() {
        if (this.#scene != null) {
            this.#scene.screen = null;
            this.#scene.camera = null;
            this.#scene.destroy();
        }

        this.#scene = this.#nextScene;
        this.#nextScene = null;

        if (this.#scene != null) {
            if (this.channels.screen != null) {
                this.#scene.screen = this.channels.screen;
                this.#scene.camera = new Camera({ screen: this.channels.screen });
            }

            this.#scene.create(this.channels.screen?.size);
        }
    }

    render() {
        if (this.channels.screen == null) { return }

        this.channels.screen.clear();

        this.willRender(this.channels.screen.context);
        this.#scene?.render(this.channels.screen.context);
        this.didRender(this.channels.screen.context);
    }

    willRender(context) {}
    didRender(context) {}
}