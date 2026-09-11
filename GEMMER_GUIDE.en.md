[한국어](./GEMMER_GUIDE.ko.md) | [**English**](./GEMMER_GUIDE.en.md)

# Gemmer Engine Guide (v0.2.11)

Gemmer is a lightweight 2D Entity Component System (ECS) game engine written in JavaScript. You can develop web games with Vite and package them as desktop applications with Electron and `electron-builder`.

## 1. Development Environment Setup

### 1.1 Prerequisites

Prepare the following tools:

- Node.js 18 or later (an active LTS release is recommended)
- npm, which is installed with Node.js
- A modern web browser
- A code editor of your choice

Check the installation from a terminal:

```bash
node --version
npm --version
```

### 1.2 Create a Game Project

Use `create-gemmer` to create a project and install its dependencies:

```bash
npx create-gemmer my-awesome-game
cd my-awesome-game
npm install
```

The generated project includes the base configuration for Gemmer, Vite, Electron, and `electron-builder`.

## 2. Development, Build, and Distribution

### 2.1 Web Development Server

```bash
npm run dev
```

Open the local address printed by Vite in a browser. Source changes are reflected automatically.

### 2.2 Electron Development

Electron connects to the running Vite development server. Keep the web development server running in the first terminal:

```bash
npm run dev
```

Open a second terminal and start Electron:

```bash
npm run electron
```

The default Electron configuration connects to `http://localhost:5173`. If Vite selects another port, update the development server address in `electron-main.js` to match it.

### 2.3 Web Production Build and Preview

```bash
npm run build
npm run preview
```

The web build is generated in `dist/`. Open the address printed by `npm run preview` to verify the production build.

### 2.4 Desktop Distribution

Before packaging, update `build.appId` and `build.productName` in `package.json` for your game. Then create the desktop package:

```bash
npm run dist
```

This command creates the web build first and then runs `electron-builder`. Outputs are written to `release/` as an unpacked application directory, `.dmg`, `.AppImage`, or another format selected for the current platform and target. Building each target on its corresponding operating system is the default workflow.

## 3. Project Structure

The main files generated for a new project are shown below. Add `assets/` when the game needs images or audio.

```text
my-awesome-game/
├── src/
│   └── main.js        # Game entry point
├── assets/            # Optional image and audio resources
├── electron-main.js   # Electron entry point
├── index.html         # Web entry point
├── package.json       # Scripts and packaging configuration
└── vite.config.js     # Vite build configuration
```

As the game grows, split its logic into modules under `src/` and import them from `src/main.js`.

## 4. Core Concepts

Gemmer uses an ECS approach that composes components on entities. You can also subclass `Entity` or `Component` to organize game logic.

### 4.1 Game

`game` is a singleton that manages the loop, canvas, and collision system. A `Scene` owns entities.

```javascript
import { game, Scene } from 'gemmer';

game.init({ width: 800, height: 600 });
game.changeScene(new Scene());
game.start();
```

`game.init()` creates a Canvas and appends it to the specified parent element, or to `document.body` when no parent is provided.

### Scene

Use `new Game(new Scene())` to supply a scene at construction. Without one,
`currentScene` is `null`; only canvas clearing and frame input cleanup run.
The singleton can use `changeScene(scene)` as shown above.

Transitions apply at the next frame boundary. `game.add/remove` throw without an active scene,
so run the entity snippets below after scene entry or inside `Scene.enter()`.
`changeScene(null)` closes the previous scene and returns to an empty canvas.
Closed scenes are not reusable; construct fresh instances to restart.

Override `enter()`, `exit()`, `update(deltaTime)`, and `draw(context)` as needed.
The engine updates and draws entities separately; these hooks need no super calls.
Release subscriptions and timers in `exit()` and load assets before switching scenes.
See `examples/scene-app/index.html`: press Enter for title → play → result → restart.

### 4.2 Entity

An `Entity` is an object in the game world. Its position and size can be provided to the constructor, and a `Transform` component is added automatically.

```javascript
import { Entity, game } from 'gemmer';

const box = new Entity(100, 100, 32, 32);
box.scale.set(2, 2);
game.add(box);
```

### 4.3 Component

Subclass `Component` to add behavior to an entity. Lifecycle methods have base implementations, so you only need to override the methods your component uses.

```javascript
import { Component, Entity, game, input } from 'gemmer';

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

const player = new Entity(400, 300);
player.addComponent(new PlayerController());
game.add(player);
```

### 4.4 Sprites and Colliders

```javascript
import { BoxCollider, Entity, Sprite, SpriteRenderer } from 'gemmer';

const player = new Entity(400, 300, 32, 32);
const sprite = new Sprite('assets/player.png');

player.addComponent(new SpriteRenderer(sprite));
player.addComponent(new BoxCollider({ width: 32, height: 32 }));
```

`SpriteRenderer` draws the image with the entity's transform. `BoxCollider` provides a non-rotating AABB collision area.

## 5. Main APIs

### 5.1 Lifecycle

The main methods available on `Entity` are:

- `onAdd(game)`: Called when the entity is added to the game world
- `start()`: Called when the entity is processed for the first time
- `update(deltaTime)`: Called every frame to update game logic
- `draw(context)`: Called every frame to draw to the Canvas
- `onRemove(game)`: Called when the entity is removed from the game world
- `destroy()`: Disables the entity and marks it for removal

The main `Component` lifecycle methods are:

- `onAttach(entity)`: Called when the component is attached to an entity
- `start()`: Called once before the first update
- `update(deltaTime)`: Called every frame while enabled
- `draw(context)`: Called with the Canvas context after applying the entity's transform
- `onDetach()`: Called when detached through `removeComponent()`
- `onDestroy()`: Called when the owning entity is destroyed

### 5.2 Input

```javascript
import { Component, input } from 'gemmer';

class PlayerController extends Component {
    update(deltaTime) {
        if (input.isKeyDown('ArrowRight')) {
            this.entity.x += 200 * deltaTime;
        }

        if (input.wasMouseButtonPressed(0)) {
            console.log('Click at:', input.mouse.x, input.mouse.y);
        }
    }
}
```

`input.mouse` is converted to Canvas coordinates when a Canvas exists. Pressed and released keyboard and mouse states are cleared after each frame.

### 5.3 Parent-Child Hierarchy

```javascript
import { Entity } from 'gemmer';

const parent = new Entity(100, 100);
const child = new Entity(10, 0);

child.transform.setParent(parent);
```

The child's global position, rotation, and scale are calculated from its parent's `Transform`.

### 5.4 Component Management

```javascript
import { BoxCollider, Entity } from 'gemmer';

const entity = new Entity();
const collider = new BoxCollider({ width: 32, height: 32 });

entity.addComponent(collider);

if (entity.hasComponent(BoxCollider)) {
    const attachedCollider = entity.getComponent(BoxCollider);
    console.log(attachedCollider.bounds);
}

entity.removeComponent(collider);
```

`addComponent()` accepts only `Component` instances. `removeComponent()` calls `onDetach()` on the removed component.
