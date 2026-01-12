// User Game Code
import { game } from '../src/core/game.js';
import { Entity } from '../src/core/entity.js';
import { Component } from '../src/core/component.js';
import { SpriteRenderer } from '../src/core/components/sprite-renderer.js';
import { Loader } from '../src/core/loader.js';

// Define a custom Player Controller Component
class PlayerController extends Component {
    constructor(speed = 200) {
        super();
        this.speed = speed;
    }

    update(deltaTime) {
        if (!this.entity) return;

        if (input.isKeyDown('ArrowLeft')) {
            this.entity.x -= this.speed * deltaTime;
        }
        if (input.isKeyDown('ArrowRight')) {
            this.entity.x += this.speed * deltaTime;
        }
        if (input.isKeyDown('ArrowUp')) {
            this.entity.y -= this.speed * deltaTime;
        }
        if (input.isKeyDown('ArrowDown')) {
            this.entity.y += this.speed * deltaTime;
        }

        // Keep player within bounds (optional)
        this.entity.x = Math.max(0, Math.min(this.entity.x, game.width - this.entity.width));
        this.entity.y = Math.max(0, Math.min(this.entity.y, game.height - this.entity.height));
    }
}

// Initialize Game
game.init({ width: 800, height: 600 });

async function startGame() {
    try {
        // Load assets
        // For demonstration, using a placeholder image since we don't have a real file
        // Ideally: const sprite = await Loader.loadSprite('assets/player.png');
        const sprite = await Loader.loadSprite('assets/player.png');

        // Create Player Entity
        const player = new Entity(100, 300, 50, 50);
        
        // Add Components (ECS Pattern)
        player.addComponent(new SpriteRenderer(sprite));
        player.addComponent(new PlayerController(200));

        game.add(player);

        // Add another entity (Static Box with Color Renderer - simulated by custom component for now, or just fillRect if we had a ShapeRenderer)
        // For this task, we focus on SpriteRenderer as requested. 
        // Let's make another entity with just a sprite.
        const boxSprite = await Loader.loadSprite('assets/player.png');
        const box = new Entity(400, 200, 100, 100);
        box.addComponent(new SpriteRenderer(boxSprite));
        game.add(box);

        // Start!
        game.start();

    } catch (error) {
        console.error("Failed to load game:", error);
    }
}

startGame();
