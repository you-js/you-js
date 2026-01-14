import { CollisionSystem } from './collision-system.js';

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

        // Clear input per-frame states
        // Note: We use the imported 'input' singleton from gemmer.js usually.
        // But since Game is in core, we don't import 'input' here to avoid circular dep if input uses game.
        // Instead, we rely on the global exposure or direct import if we refactor.
        // Ideally, InputManager should be updated explicitly by the user or this loop.
        // For now, let's try to access it via global if available, or imports.
        // Actually, let's fix the circular dependency properly later.
        // For now, we assume 'input' might be globally available or we check common locations.
        
        // Fix: Import input directly or pass it in. 
        // Best practice: The game loop drives the systems. 
        // We will assume the global 'gemmer.input' or similar if we were a framework.
        // But here, we can rely on the fact that 'input' module side-effect creates the listener.
        // To clear frame, we need access to the instance.
        
        // Let's use a cleaner approach: expose input on Game or pass it.
        // For now, we'll try to find it on window (if exposed) or leave it to the user?
        // No, 'clearFrame' is essential for 'wasKeyPressed' to work.
        
        // We will try to access the exported 'input' from the module registry if possible,
        // but ES modules don't work like that easily without import.
        
        // TEMPORARY FIX: We look for 'window.input' or just don't clear?
        // If we don't clear, 'wasKeyPressed' stays true forever.
        // Let's import it dynamically or check a known global.
        if (typeof window !== 'undefined') {
            if (window.input && typeof window.input.clearFrame === 'function') {
                 window.input.clearFrame();
            } else if (window.gemmer && window.gemmer.input && typeof window.gemmer.input.clearFrame === 'function') {
                 window.gemmer.input.clearFrame();
            }
        }

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
