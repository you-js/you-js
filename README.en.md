[한국어](./README.md) | **English**

# Gemmer

Gemmer is a lightweight, modern 2D game engine built with JavaScript, Vite, and Electron. It provides a robust Entity-Component-System (ECS) architecture designed for simplicity and ease of use.

## Features

- **ECS Architecture:** Flexible `Entity`, `Component`, and `System` structure
- **Rendering:** Canvas-based `SpriteRenderer` with support for image cropping and pivots
- **Animation:** Frame-based `Animator` system
- **Physics:** AABB collision detection via `BoxCollider`
- **Input:** Unified `InputManager` for keyboard and mouse
- **Audio:** `AudioManager` for background music and sound effects
- **Cross-Platform:** Builds for the web and desktop through Electron

## Getting Started

### Installation

```bash
npm install gemmer
```

> This project is currently under local development. Clone the repository to use it if necessary.

### Quick Start

#### 1. Initialize the game

```javascript
import { Game, Scene } from 'gemmer';

const game = new Game(new Scene());

game.init({
    width: 800,
    height: 600,
});

game.start();
```

#### 2. Create an entity

```javascript
import { Entity, SpriteRenderer, Sprite } from 'gemmer';

// Create a player entity at (400, 300)
const player = new Entity(400, 300);

// Add a sprite component
const sprite = new Sprite('assets/player.png');
player.addComponent(new SpriteRenderer(sprite));

// Add it to the game world
game.add(player);
```

#### 3. Create a custom component

```javascript
import { Component, input } from 'gemmer';

class PlayerController extends Component {
    update(deltaTime) {
        const speed = 200;

        if (input.isKeyDown('ArrowRight')) {
            this.entity.x += speed * deltaTime;
        }
        if (input.isKeyDown('ArrowLeft')) {
            this.entity.x -= speed * deltaTime;
        }
    }
}

player.addComponent(new PlayerController());
```

## Architecture Overview

### Core

- **Game:** The central object that manages the game loop, entities, and systems
- **Entity:** A general-purpose object in the game world with a default `Transform` for position, rotation, and scale
- **Component:** Data or behavior attached to an entity, such as `SpriteRenderer` or `BoxCollider`

### Systems

- **InputManager (`input`):** Handles user input
    - `input.isKeyDown(key)`
    - `input.mouse`
- **AudioManager (`audio`):** Handles sound
    - `audio.play('bgm')`
    - `audio.playOneShot('sfx')`

## Documentation

- [한국어 Gemmer 엔진 가이드](./GEMMER_GUIDE.ko.md)
- [English Gemmer Engine Guide](./GEMMER_GUIDE.en.md)

## Development

### Scripts

- `npm run dev`: Start the Vite development server
- `npm run electron`: Launch the Electron desktop app while `npm run dev` is running
- `npm run test`: Run headless unit tests
- `npm run lint`: Run ESLint checks
- `npm run build:lib`: Build the engine library for npm distribution
- `npm run build:game`: Create the web distribution build for the game
- `npm run dist`: Build and package the game as a desktop application

## License

MIT
