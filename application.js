import { Camera } from "./camera.js";
import { EventQueue } from "./framework/event.js";
import { ProjectSceneInstantiater } from "./project/project-scene-instantiator.js";
import { Scene } from './scene.js';

export class Application {

    _scene = null;
    _nextScene = null;

    _transition = null;
    _didTransitionInThisLoop = false;

    constructor({
        scene=null,
    }={}) {
        this._scene = scene;

        this.eventQueue = new EventQueue();

        this.channels = {
            screen: null,
            mouse: null,
            keyboard: null,
        };
    }

    get scene() { return this._scene }

    connect(channel) {
        if (channel.type === 'screen') {
            this.channels.screen = channel.object;
            this.channels.screen.connect(this.eventQueue);

            if (this._scene != null) {
                this._scene.screen = this.channels.screen;
                this._scene.camera = new Camera({ screen: this.channels.screen });
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
        if (this._scene != null) {
            this._scene.screen = null;
            this._scene.camera = null;
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

    create() {
        this.willCreate();
        this._scene?.create();
		this.didCreate();
    }

    willCreate() {}
	didCreate() {}

    destroy() {
        this.willDestroy();
        this._scene?.destroy();
        this.willDestroy();
    }

	willDestroy() {}
	didDestroy() {}

    update(deltaTime) {
        this.willUpdate(deltaTime);

        this._scene?.handle(this.eventQueue.events);
        this._scene?.update(deltaTime);

		this.didUpdate(deltaTime);

        if (this._transition != null) {
            this._doTransition();
        }

        this.eventQueue.clear();
    }

    willUpdate(deltaTime) {}
    didUpdate(deltaTime) {}

    _doTransition() {
        const { scene, destroyArgs, createArgs } = this._transition;

        this._transition = null;

        if (this._scene != null) {
            this._scene.destroy(...destroyArgs);
            this._scene.screen = null;
            this._scene.camera = null;
        }

        this._scene = scene;

        if (this._scene != null) {
            if (this.channels.screen != null) {
                this._scene.screen = this.channels.screen;
                this._scene.camera = new Camera({ screen: this.channels.screen });
            }

            this._scene.create(...createArgs);
        }

        this._didTransitionInThisLoop = true;
    }

    render() {
        if (this._didTransitionInThisLoop) {
            this._didTransitionInThisLoop = false;
            return;
        }

        if (this.channels.screen == null) { return }

        this.channels.screen.clear();

        this.willRender(this.channels.screen.context);
        this._scene?.render(this.channels.screen.context);
        this.didRender(this.channels.screen.context);
    }

    willRender(context) {}
    didRender(context) {}

    transit(scene, { destroyArgs=[], createArgs=[] }={}) {
        if (!(scene instanceof Scene)) {
            throw `scene is not Scene instance: ${scene}`;
        }

        this._transition = { scene, destroyArgs, createArgs };
    }
}

export class ProjectPlayableApplication extends Application {

    constructor({
        project,
    }={}) {
        super();

        this.project = project;

        this.sceneInstantiater = new ProjectSceneInstantiater();

        this.transit(this.project.scenes[0].name);
    }

    _doTransition() {
        const { sceneName, destroyArgs, createArgs } = this._transition;

        this._transition = null;

        if (this._scene != null) {
            this._scene.destroy(...destroyArgs);
            this._scene.screen = null;
            this._scene.camera = null;
        }

        const projectScene = this.project.scenes.find(scene => scene.name === sceneName);
        const scene = this.sceneInstantiater.instantiate(projectScene, null);

        this._scene = scene;

        if (this._scene != null) {
            if (this.channels.screen != null) {
                this._scene.screen = this.channels.screen;
                this._scene.camera = new Camera({ screen: this.channels.screen });
            }

            this._scene.create(...createArgs);
        }

        this._didTransitionInThisLoop = true;
    }

    transit(sceneName, { destroyArgs=[], createArgs=[] }={}) {
        this._transition = { sceneName, destroyArgs, createArgs };
    }
}