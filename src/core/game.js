import { CollisionSystem } from './collision-system.js';
import { input } from './input.js';
import { Scene } from './scene.js';

// The Core Game Engine Singleton
export class Game {
    constructor(scene = null) {
        this.canvas = null;
        this.context = null;
        this.width = 800;
        this.height = 600;
        this._currentScene = null;
        this._pendingScene = null;
        this._hasPendingScene = false;
        this._transitionScene = null;
        this._isTransitioning = false;
        this._validateScene(scene);
        this._currentScene = scene;
        if (scene !== null) scene.game = this;
        this.lastTime = 0;

        // Systems
        this.collisionSystem = new CollisionSystem(this);

        // Bind loop to maintain 'this' context
        this.loop = this.loop.bind(this);
    }

    // Initialize the engine
    init({ width = 800, height = 600, parent = document.body } = {}) {
        this.width = width;
        this.height = height;

        // Create Canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.display = 'block';
        this.canvas.style.background = '#000'; // Default background

        // Center the canvas
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = '50%';
        this.canvas.style.top = '50%';
        this.canvas.style.transform = 'translate(-50%, -50%)';

        this.context = this.canvas.getContext('2d');
        parent.appendChild(this.canvas);

        console.log(`[Gemmer] Initialized ${width}x${height}`);
    }

    get currentScene() {
        return this._currentScene;
    }

    get entities() {
        return this.currentScene === null ? [] : this.currentScene.entities;
    }

    get entitiesToAdd() {
        return this.currentScene === null ? [] : this.currentScene.entitiesToAdd;
    }

    get entitiesToRemove() {
        return this.currentScene === null ? [] : this.currentScene.entitiesToRemove;
    }

    _validateScene(scene) {
        if (scene === null) return;
        if (!(scene instanceof Scene)) throw new Error('Game: expected a Scene or null');
        if (scene._isClosed) throw new Error('Game: scene is closed');
        if (scene.game !== null && scene.game !== this) {
            throw new Error('Game: scene belongs to another Game');
        }
    }

    changeScene(scene) {
        this._validateScene(scene);
        if (
            this._hasPendingScene &&
            this._pendingScene !== null &&
            this._pendingScene !== this.currentScene
        ) {
            this._pendingScene.game = null;
        }
        const destination = this._isTransitioning ? this._transitionScene : this.currentScene;
        this._pendingScene = scene;
        this._hasPendingScene = scene !== destination;
        if (scene !== null) scene.game = this;
    }

    _processSceneTransition() {
        if (this.context === null) return;
        if (this._hasPendingScene) this._validateScene(this._pendingScene);
        if (this._hasPendingScene) {
            const nextScene = this._pendingScene;
            this._pendingScene = null;
            this._hasPendingScene = false;
            this._transitionScene = nextScene;
            this._isTransitioning = true;
            try {
                if (this.currentScene !== null) this.currentScene._close();
                this._currentScene = nextScene;
            } finally {
                this._isTransitioning = false;
                this._transitionScene = null;
            }
        }
        if (this.currentScene !== null && !this.currentScene._hasEntered) {
            this.currentScene._hasEntered = true;
            this.currentScene.enter();
        }
    }

    add(entity) {
        if (this.currentScene === null) throw new Error('Game.add: no active Scene');
        return this.currentScene.add(entity);
    }

    remove(entity) {
        if (this.currentScene === null) throw new Error('Game.remove: no active Scene');
        this.currentScene.remove(entity);
    }

    _processLifecycle() {
        if (this.currentScene !== null) this.currentScene._processLifecycle();
    }

    // Start the game loop
    start() {
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop);
        console.log('[Gemmer] Game Started');
    }

    // The Main Game Loop
    loop(currentTime) {
        // Calculate Delta Time (in seconds)
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // 0. Process Lifecycle (Add/Remove entities safe from iteration)
        this._processSceneTransition();
        this._processLifecycle();

        // 1. Update
        this.update(deltaTime);

        // 2. Physics
        if (this.currentScene !== null) this.collisionSystem.update();

        input.clearFrame();

        // 3. Draw
        this.draw();

        // Repeat
        requestAnimationFrame(this.loop);
    }

    update(deltaTime) {
        if (this.currentScene === null) return;
        this.currentScene.update(deltaTime);
        this.currentScene._updateEntities(deltaTime);
    }

    draw() {
        this.context.clearRect(0, 0, this.width, this.height);
        if (this.currentScene === null) return;
        this.currentScene.draw(this.context);
        this.currentScene._drawEntities(this.context);
    }
}

export const game = new Game();
