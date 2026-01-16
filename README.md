# Gemmer Engine

Gemmer (formerly you-js) is a lightweight, modern 2D game engine built with JavaScript, Vite, and Electron. It features a robust Entity-Component-System (ECS) architecture designed for simplicity and ease of use.

## Features

- **ECS Architecture:** Flexible `Entity`, `Component`, and `System` structure.
- **Rendering:** Canvas-based `SpriteRenderer` with support for anchors, pivots, and layers.
- **Animation:** Frame-based `Animator` system.
- **Physics:** AABB collision detection via `BoxCollider`.
- **Input:** Unified `InputManager` for Keyboard and Mouse.
- **Audio:** `AudioManager` for background music and sound effects.
- **Cross-Platform:** Builds for Web and Desktop (via Electron).

## Getting Started

### Installation

```bash
npm install gemmer
```

_(Note: Currently in local development. Clone the repository to use.)_

### Quick Start

1.  **Initialize the Game:**

```javascript
import { Game } from 'gemmer';

const game = new Game({
    width: 800,
    height: 600,
    backgroundColor: '#333',
});

game.start();
```

2.  **Create an Entity:**

```javascript
import { Entity, SpriteRenderer, Sprite, Vector2 } from 'gemmer';

// Create a player entity
const player = new Entity('Player');
player.position = new Vector2(400, 300);

// Add a sprite
const sprite = new Sprite('assets/player.png');
player.addComponent(new SpriteRenderer(sprite));

// Add to game
game.addEntity(player);
```

3.  **Create a Custom Component:**

```javascript
import { Component, input } from 'gemmer';

class PlayerController extends Component {
    update(dt) {
        const speed = 200;

        if (input.isKeyDown('ArrowRight')) {
            this.entity.x += speed * dt;
        }
        if (input.isKeyDown('ArrowLeft')) {
            this.entity.x -= speed * dt;
        }
    }
}

player.addComponent(new PlayerController());
```

## Architecture Overview

### Core

- **Game:** The central hub that manages the game loop, scenes (entities), and systems.
- **Entity:** A general-purpose object in the game world. Has a `Transform` (position, rotation, scale) by default.
- **Component:** Data or logic attached to an Entity (e.g., `SpriteRenderer`, `BoxCollider`).

### Systems

- **InputManager (`input`):** Handles user input.
    - `input.isKeyDown(key)`
    - `input.mouse` (Vector2)
- **AudioManager (`audio`):** Handles sound.
    - `audio.play('bgm')`
    - `audio.playOneShot('sfx')`

## Development

### Scripts

- `npm run dev`: Start the Vite development server.
- `npm run dev-test`: Launch the browser test suite.
- `npm run electron`: Launch the Electron desktop app.
- `npm run test`: Run headless unit tests.
- `npm run build:lib`: Build the engine library for distribution (npm).
- `npm run dist`: Build and package the game as a desktop application (.exe, .dmg).

## License

MIT
