// The Core Game Engine Singleton
export class Game {
    constructor() {
        this.canvas = null;
        this.context = null;
        this.width = 800;
        this.height = 600;
        this.entities = [];
        this.lastTime = 0;
        
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

        console.log(`[You.js] Initialized ${width}x${height}`);
    }

    // Add an entity to the game world
    add(entity) {
        this.entities.push(entity);
        if (entity.onAdd) entity.onAdd(this);
    }

    // Start the game loop
    start() {
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop);
        console.log('[You.js] Game Started');
    }

    // The Main Game Loop
    loop(currentTime) {
        // Calculate Delta Time (in seconds)
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // 1. Update
        this.update(deltaTime);

        // Clear input per-frame states
        if (window.input && typeof window.input.clearFrame === 'function') {
            window.input.clearFrame();
        }

        // 2. Draw
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
        for (const entity of this.entities) {
            if (entity.draw) entity.draw(this.context);
        }
    }
}

// Export a singleton instance for simplicity
export const game = new Game();
