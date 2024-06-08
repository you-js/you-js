import { Camera } from "../../camera.js";
import { Screen } from "../../framework/screen.js";
import { ProjectSceneInstantiater } from "../project-scene-instantiator.js";

export class ProjectPlayer {

    project = null;
    scene = null;
    state = null;
    _transition = null;
    _didTransitionInThisLoop = false;

    constructor({ screen }) {
        this.screen = new Screen({
            canvas: document.createElement('canvas'),
            size: screen.size,
            resizeType: Screen.ResizeType.Pack,
        });

        this.screen.context.imageSmoothingEnabled = screen.context.imageSmoothingEnabled;

        this.sceneInstantiater = new ProjectSceneInstantiater();
    }

    play(project) {
        this.originalApplication = globalThis.application;
        globalThis.application = this;

        this.project = project;

        if (this.project.scenes.length === 0) {
            throw 'Project must have at least one scene.';
        }

        this.scene = this.sceneInstantiater.instantiate(project.scenes[0], this.screen);

        if (this.screen != null) {
            this.scene.screen = this.screen;
            this.scene.camera = new Camera({ screen: this.screen });
        }

        this.scene.create();

        this.state = 'playing';
    }

    pause() {
        this.state = 'paused';
    }

    stop() {
        if (this.scene != null) {
            this.scene.destroy();
        }

        this.state = null;
        this.scene = null;
        this.project = null;

        globalThis.application = this.originalApplication;
    }

    handle(events) {
        if (this.state !== 'playing') { return }

        this.scene.handle(events);
    }

    update(deltaTime) {
        if (this.state !== 'playing') { return }

        this.scene.update(deltaTime);

        if (this._transition != null) {
            this._doTransition();
        }
    }

    render(context, screenSize) {
        if (this._didTransitionInThisLoop) {
            this._didTransitionInThisLoop = false;
            return;
        }

        if (this.state !== 'playing') { return }

        context.save();

        const playerScreen = this.screen;
        const playerScreenSize = playerScreen.size;

        playerScreen.clear();

        this.scene.render(playerScreen.context, playerScreenSize);

        context.drawImage(playerScreen.canvas, 0, 0);

        context.restore();
    }

    transit(sceneName, { destroyArgs=[], createArgs=[] }={}) {
        this._transition = { sceneName, destroyArgs, createArgs };
    }

    _doTransition() {
        const { sceneName, destroyArgs, createArgs } = this._transition;

        this._transition = null;

        if (this.scene != null) {
            this.scene.destroy(...destroyArgs);
            this.scene.screen = null;
            this.scene.camera = null;
        }

        const projectScene = this.project.scenes.find(scene => scene.name === sceneName);
        const scene = this.sceneInstantiater.instantiate(projectScene, null);

        this.scene = scene;

        if (this.scene != null) {
            if (this.screen != null) {
                this.scene.screen = this.screen;
                this.scene.camera = new Camera({ screen: this.screen });
            }

            this.scene.create(...createArgs);
        }

        this._didTransitionInThisLoop = true;
    }
}