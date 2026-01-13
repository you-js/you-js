// User Game Code
import { game, Entity, Component, SpriteRenderer, BoxCollider, Loader, input, Sprite } from '../../src/index.js';

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
        // Using a solid color placeholder for the basic app if no asset is present
        // or ensure assets are copied. For now, let's use the new Sprite API which supports paths.
        // We will assume 'assets/player.png' might not exist here yet, so let's be safe or just use it if we copied it.
        // Actually, let's just make a simple colored box using a placeholder if we want it self-contained, 
        // OR we rely on the fact that we created an 'assets' folder in basic-app too.
        
        // Let's create a placeholder programmatically for the basic app so it runs out of the box without external images
        const createPlaceholder = (w, h, color) => {
            const c = document.createElement('canvas');
            c.width = w; c.height = h;
            const ctx = c.getContext('2d');
            ctx.fillStyle = color;
            ctx.fillRect(0,0,w,h);
            const img = new Image();
            img.src = c.toDataURL();
            return img;
        };

        const playerSprite = new Sprite(createPlaceholder(32, 32, 'cyan'));
        const boxSprite = new Sprite(createPlaceholder(50, 50, 'orange'));

        // Create Player Entity
        const player = new Entity(100, 300, 32, 32);
        
        // Add Components (ECS Pattern)
        player.addComponent(new SpriteRenderer(playerSprite));
        player.addComponent(new PlayerController(200));
        player.addComponent(new BoxCollider());

        game.add(player);

        // Add another entity (Static Box)
        const box = new Entity(400, 200, 50, 50);
        box.addComponent(new SpriteRenderer(boxSprite));
        box.addComponent(new BoxCollider({ isStatic: true }));
        game.add(box);

        // Start!
        game.start();

    } catch (error) {
        console.error("Failed to load game:", error);
    }
}

startGame();
