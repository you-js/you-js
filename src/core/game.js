import { CollisionSystem } from './collision-system.js';
import { input } from './input.js';

// The Core Game Engine Singleton
export class Game {
    constructor() {
        this.canvas = null;
        this.context = null;
        this.width = 800;
        this.height = 600;
        this.entities = [];
        this.entitiesToAdd = []; // Buffer for entities to be added
        this.entitiesToRemove = []; // Buffer for entities to be removed
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

    // Add an entity to the game world (buffered)
    add(entity) {
        this.entitiesToAdd.push(entity);
        return entity;
    }
    
    // Remove an entity from the game world (buffered)
    remove(entity) {
        if (!this.entitiesToRemove.includes(entity)) {
            this.entitiesToRemove.push(entity);
        }
    }

    // Process added/removed entities
    _processLifecycle() {
        // Add new entities
        if (this.entitiesToAdd.length > 0) {
            for (const entity of this.entitiesToAdd) {
                this.entities.push(entity);
                if (entity.onAdd) entity.onAdd(this);
                if (entity.start) entity.start();
            }
            this.entitiesToAdd = [];
        }

        // Remove destroyed entities
        // Also check entities marked as destroyed internally
        const destroyList = this.entities.filter(e => e.isDestroyed);
        for (const e of destroyList) {
             if (!this.entitiesToRemove.includes(e)) {
                 this.entitiesToRemove.push(e);
             }
        }

        if (this.entitiesToRemove.length > 0) {
            for (const entity of this.entitiesToRemove) {
                const index = this.entities.indexOf(entity);
                if (index !== -1) {
                    this.entities.splice(index, 1);
                    if (entity.onRemove) entity.onRemove(this);
                }
            }
            this.entitiesToRemove = [];
        }
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
        this._processLifecycle();

        // 1. Update
        this.update(deltaTime);

        // 2. Physics
        this.collisionSystem.update();

        input.clearFrame();

        // 3. Draw
        this.draw();

        // Repeat
        requestAnimationFrame(this.loop);
    }

    update(deltaTime) {
        // Update all entities
        for (const entity of this.entities) {
            if (entity.update) entity.update(deltaTime);
        }
    }

    draw() {
        // Clear Screen
        this.context.clearRect(0, 0, this.width, this.height);

        // Draw all entities
        // Sort by z-index if needed later (TODO)
        for (const entity of this.entities) {
            if (entity.draw) entity.draw(this.context);
        }
    }
}

// Export a singleton instance for simplicity
export const game = new Game();
