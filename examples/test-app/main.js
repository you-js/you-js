// Test Game Application (Modified for standalone module execution)
import {
    Game,
    Scene,
    Entity,
    Sprite,
    SpriteRenderer,
    BoxCollider,
    Vector2,
    InputManager,
    input,
    Random,
    Animator,
    Animation,
    Loader,
} from '../../src/index.js';

const game = new Game(new Scene());

console.log('Starting Game Test...');

// --- Assets ---
// Helper to create placeholders if image fails, but we prefer real assets
function createPlaceholderImage(width, height, color) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);

    // Add some details to see rotation
    ctx.fillStyle = 'white';
    ctx.fillRect(width * 0.8, height * 0.2, width * 0.1, height * 0.1); // Eye/Mark

    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
}

// --- Game Logic ---
const spr = await Loader.loadSprite('assets/player.png');

class Player extends Entity {
    constructor(x, y) {
        super(x, y, 32, 32);
        this.speed = 200;

        // Add Collider
        this.addComponent(new BoxCollider({ width: 32, height: 32 }));

        // Try to load real asset, fallback to placeholder if error
        // Note: In packaged app, assets are served from the root or ./assets
        // With our custom Vite config, 'assets' folder is copied to 'dist-game/assets'.
        // So 'assets/player.png' is the correct path relative to index.html.
        // New Sprite API: uses natural size by default.
        this.sprite = new Sprite('assets/player.png');

        // Add Renderer immediately
        this.addComponent(new SpriteRenderer(this.sprite));
    }

    onAdd(game) {
        // No-op
    }

    update(deltaTime) {
        super.update(deltaTime);

        const move = new Vector2(0, 0);

        if (input.isKeyDown('ArrowUp') || input.isKeyDown('w')) move.y -= 1;
        if (input.isKeyDown('ArrowDown') || input.isKeyDown('s')) move.y += 1;
        if (input.isKeyDown('ArrowLeft') || input.isKeyDown('a')) move.x -= 1;
        if (input.isKeyDown('ArrowRight') || input.isKeyDown('d')) move.x += 1;

        if (move.magnitude() > 0) {
            move.normalize().mul(this.speed * deltaTime);
            this.x += move.x;
            this.y += move.y;
        }

        // Mouse interaction
        if (input.wasMouseButtonReleased(0)) {
            // Click logic
            console.log('dd');
        }
    }
}

class Spinner extends Entity {
    constructor(x, y) {
        super(x, y, 64, 64);
        // Use placeholder for spinner
        const img = createPlaceholderImage(64, 64, 'red');
        this.sprite = new Sprite(img);
        this.addComponent(new BoxCollider({ width: 64, height: 64, isStatic: true }));
        this.addComponent(new SpriteRenderer(this.sprite));
    }

    update(deltaTime) {
        this.rotation += 90 * deltaTime;
    }
}

// --- Init Game ---

export async function startGame() {
    // Check if game is already initialized or canvas exists
    if (document.querySelector('canvas')) {
        console.warn('Canvas already exists. Skipping init.');
        return;
    }

    game.init({ width: 800, height: 600 });

    // Add Player
    const player = new Player(400, 300);
    player.transform.localScale = new Vector2(2, 2); // Scale up for visibility
    game.add(player);

    // Add some obstacles
    // for(let i=0; i<5; i++) {
    //     const x = Random.range(50, 750);
    //     const y = Random.range(50, 550);
    //     game.add(new Spinner(x, y));
    // }

    game.start();
}

startGame();

// Check if running in browser context
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Only auto-start if imported directly by a test page
    // We can check if the script is the main entry point if needed, or just let test.html call it.
    // For simplicity, we'll let test.html import and call startGame, or auto-start if appropriate.
    // Let's attach to window for easy calling from HTML
    window.startTestGame = startGame;
}
