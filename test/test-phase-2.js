import { Scene } from '../src/core/scene.js';
// Test script for Phase 2: Core ECS Enhancements
import { Entity } from '../src/core/entity.js';
import { Game } from '../src/core/game.js';
import { Transform } from '../src/core/components/transform.js';
import { Vector2 } from '../src/math/vector.js';

console.log('=== Phase 2: ECS & Transform Test ===');

function assert(condition, message) {
    if (condition) {
        console.log(`PASS: ${message}`);
    } else {
        console.error(`FAIL: ${message}`);
        process.exit(1);
    }
}

// Mock Canvas for Game init
const mockParent = {
    appendChild: () => {},
};
globalThis.document = {
    createElement: () => ({
        getContext: () => ({
            clearRect: () => {},
            save: () => {},
            restore: () => {},
            translate: () => {},
            rotate: () => {},
            scale: () => {},
        }),
        style: {},
    }),
    body: mockParent,
};

// 1. Entity & Transform Basic
console.log('\n--- Entity & Transform ---');
const ent = new Entity(100, 200);

assert(ent.getComponent(Transform) !== undefined, 'Entity has default Transform');
assert(ent.x === 100 && ent.y === 200, 'Entity constructor sets position');

ent.x = 300;
assert(ent.transform.localPosition.x === 300, 'Entity.x setter updates transform');

ent.rotation = 45;
assert(ent.transform.localRotation === 45, 'Entity.rotation alias works');

// 2. Hierarchy System
console.log('\n--- Hierarchy ---');
const parent = new Entity(0, 0);
const child = new Entity(100, 0); // Local x=100

child.transform.setParent(parent);
assert(child.transform.parent === parent.transform, 'Parent set correctly');
assert(parent.transform.children.includes(child.transform), "Child added to parent's list");

assert(child.transform.globalPosition.x === 100, 'Global pos initial check');

// Move Parent
parent.x = 50;
assert(child.transform.globalPosition.x === 150, 'Child global pos follows parent move (50 + 100)');

// Rotate Parent 90 deg (Clockwise)
// Child at (100, 0) relative to parent.
// Rotated 90 deg around (0,0) -> (0, 100) (Screen coords: y is down)
parent.x = 0; // Reset pos
parent.rotation = 90;

const childGlobal = child.transform.globalPosition;
// allow small float error
const isClose = (a, b) => Math.abs(a - b) < 0.001;

assert(
    isClose(childGlobal.x, 0) && isClose(childGlobal.y, 100),
    `Child global pos rotates with parent. Got (${childGlobal.x}, ${childGlobal.y})`
);

// 3. Lifecycle & Game Loop Buffer
console.log('\n--- Game Lifecycle ---');
const game = new Game(new Scene());
game.init({ parent: mockParent });

const e1 = new Entity();
game.add(e1);

assert(game.entities.length === 0, 'Entities not added immediately (buffered)');
assert(game.entitiesToAdd.length === 1, 'Entities in add buffer');

game._processLifecycle();
assert(game.entities.length === 1, 'Entities added after lifecycle process');

// Removal
game.remove(e1);
assert(game.entitiesToRemove.length === 1, 'Entity marked for removal');
assert(game.entities.length === 1, 'Still in main list before process');

game._processLifecycle();
assert(game.entities.length === 0, 'Entity removed after lifecycle process');

// 4. Destroy Logic
const e2 = new Entity();
game.add(e2);
game._processLifecycle();

e2.destroy();
assert(e2.isDestroyed === true, 'Entity marked destroyed');

game._processLifecycle(); // Should auto-pickup destroyed entities
assert(game.entities.length === 0, 'Destroyed entity removed by system');

console.log('\n=== Phase 2 Tests Passed ===');
