import assert from 'node:assert/strict';
import { Game } from '../src/core/game.js';
import { Scene } from '../src/core/scene.js';
import { Entity } from '../src/core/entity.js';
import { BoxCollider } from '../src/core/components/box-collider.js';
import { input } from '../src/core/input.js';

const events = [];
let scheduledFrames = 0;
let nextFrame = null;
const labels = [];
const positions = [];
globalThis.requestAnimationFrame = callback => {
    scheduledFrames += 1;
    nextFrame = callback;
};
const context = {
    clearRect() {
        events.push('clear');
    },
    fillStyle: '',
    font: '',
    fillText(text) {
        labels.push(text);
    },
    fillRect(horizontalPosition) {
        positions.push(horizontalPosition);
    },
};
globalThis.document = {
    body: { appendChild() {} },
    createElement() {
        return {
            style: {},
            getContext() {
                return context;
            },
        };
    },
};

class TestEntity extends Entity {
    constructor(name) {
        super();
        this.name = name;
    }
    onAdd(owner) {
        assert.ok(owner instanceof Game);
        events.push(`${this.name}:add`);
    }
    start() {
        events.push(`${this.name}:start`);
    }
    update() {
        events.push(`${this.name}:update`);
    }
    draw() {
        events.push(`${this.name}:draw`);
    }
    destroy() {
        events.push(`${this.name}:destroy`);
        super.destroy();
    }
    onRemove(owner) {
        assert.ok(owner instanceof Game);
        events.push(`${this.name}:remove`);
    }
}

class TestScene extends Scene {
    constructor(name) {
        super();
        this.name = name;
        this.enterDestination = undefined;
        this.exitDestination = undefined;
        this.updateDestination = undefined;
    }
    enter() {
        assert.ok(this.game.context);
        events.push(`${this.name}:enter`);
        if (this.enterDestination !== undefined) this.game.changeScene(this.enterDestination);
    }
    exit() {
        events.push(`${this.name}:exit`);
        if (this.exitDestination !== undefined) this.game.changeScene(this.exitDestination);
    }
    update() {
        events.push(`${this.name}:update`);
        if (this.updateDestination !== undefined) this.game.changeScene(this.updateDestination);
    }
    draw() {
        events.push(`${this.name}:draw`);
    }
}

function frame(game) {
    events.length = 0;
    game.loop(game.lastTime + 16);
}

const emptyGame = new Game();
assert.equal(emptyGame.currentScene, null);
assert.deepEqual(emptyGame.entities, []);
assert.deepEqual(emptyGame.entitiesToAdd, []);
assert.deepEqual(emptyGame.entitiesToRemove, []);
assert.throws(() => emptyGame.add(new Entity()), /no active Scene/);
assert.throws(() => emptyGame.remove(new Entity()), /no active Scene/);
emptyGame.init();
input.keysPressed.add('Enter');
frame(emptyGame);
assert.deepEqual(events, ['clear']);
assert.equal(input.wasKeyPressed('Enter'), false);
assert.equal(scheduledFrames, 1);

const first = new TestScene('first');
const entity = first.add(new TestEntity('entity'));
const game = new Game(first);
assert.equal(game.currentScene, first);
assert.equal(first.game, game);
game._processSceneTransition();
assert.equal(first._hasEntered, false);
game.init();
assert.equal(first._hasEntered, false);
frame(game);
assert.deepEqual(events, [
    'first:enter',
    'entity:add',
    'entity:start',
    'first:update',
    'entity:update',
    'clear',
    'first:draw',
    'entity:draw',
]);
frame(game);
assert.ok(!events.includes('first:enter'));

const second = new TestScene('second');
const pending = first.add(new TestEntity('pending'));
first.remove(entity);
game.changeScene(second);
assert.equal(game.currentScene, first);
assert.throws(() => new Game(second), /another Game/);
frame(game);
assert.deepEqual(events, [
    'first:exit',
    'entity:destroy',
    'entity:remove',
    'pending:destroy',
    'second:enter',
    'second:update',
    'clear',
    'second:draw',
]);
assert.equal(pending.isDestroyed, true);
assert.equal(first.game, null);
assert.deepEqual(first.entities, []);
assert.deepEqual(first.entitiesToAdd, []);
assert.deepEqual(first.entitiesToRemove, []);
assert.throws(() => game.changeScene(first), /closed/);

game.changeScene(null);
frame(game);
assert.deepEqual(events, ['second:exit', 'clear']);
assert.equal(game.currentScene, null);

const third = new TestScene('third');
const discarded = new TestScene('discarded');
game.changeScene(discarded);
game.changeScene(third);
assert.equal(discarded.game, null);
frame(game);
assert.equal(game.currentScene, third);
assert.equal(discarded._hasEntered, false);
game.changeScene(discarded);
game.changeScene(third);
frame(game);
assert.equal(game.currentScene, third);
assert.equal(discarded.game, null);

const fourth = new TestScene('fourth');
third.updateDestination = fourth;
frame(game);
assert.equal(game.currentScene, third);
assert.ok(events.includes('third:draw'));
frame(game);
assert.equal(game.currentScene, fourth);

const fifth = new TestScene('fifth');
const sixth = new TestScene('sixth');
fourth.exitDestination = sixth;
game.changeScene(fifth);
frame(game);
assert.equal(game.currentScene, fifth);
frame(game);
assert.equal(game.currentScene, sixth);

const seventh = new TestScene('seventh');
seventh.enterDestination = null;
game.changeScene(seventh);
frame(game);
assert.equal(game.currentScene, seventh);
frame(game);
assert.equal(game.currentScene, null);

const neverEntered = new TestScene('never');
neverEntered.add(new TestEntity('unstarted'));
const replacementGame = new Game(neverEntered);
replacementGame.init();
replacementGame.changeScene(null);
frame(replacementGame);
assert.deepEqual(events, ['unstarted:destroy', 'clear']);

const cleanupScene = new TestScene('cleanup');
const cleanupGame = new Game(cleanupScene);
cleanupGame.init();
const destroyed = cleanupScene.add(new TestEntity('destroyed'));
const removed = cleanupScene.add(new TestEntity('removed'));
frame(cleanupGame);
cleanupScene.remove(removed);
frame(cleanupGame);
assert.equal(removed.isDestroyed, false);
destroyed.destroy();
cleanupGame.changeScene(null);
frame(cleanupGame);
assert.ok(!events.includes('destroyed:destroy'));
assert.ok(events.includes('destroyed:remove'));

const collisionScene = new Scene();
const collisionGame = new Game(collisionScene);
collisionGame.init();
const left = collisionScene.add(new TestEntity('left'));
const right = collisionScene.add(new TestEntity('right'));
left.addComponent(new BoxCollider());
right.addComponent(new BoxCollider());
frame(collisionGame);
assert.equal(left.getComponent(BoxCollider).collisions.length, 1);
const isolatedScene = new Scene();
const isolated = isolatedScene.add(new TestEntity('isolated'));
isolated.addComponent(new BoxCollider());
collisionGame.changeScene(isolatedScene);
frame(collisionGame);
assert.equal(isolated.getComponent(BoxCollider).collisions.length, 0);
assert.throws(() => game.changeScene({}), /Scene or null/);
assert.throws(() => new Game(isolatedScene), /another Game/);

// Exercise the actual example using deterministic frames and Canvas test doubles.
await import('../examples/scene-app/main.js');
let currentTime = performance.now();
function exampleFrame() {
    currentTime += 16;
    labels.length = 0;
    positions.length = 0;
    nextFrame(currentTime);
}
function pressEnter() {
    input.keysPressed.add('Enter');
    exampleFrame();
    exampleFrame();
}
exampleFrame();
assert.equal(labels[0], 'Title');
pressEnter();
assert.equal(labels[0], 'Play');
const startingPosition = positions[0];
exampleFrame();
assert.ok(positions[0] > startingPosition);
pressEnter();
assert.equal(labels[0], 'Result');
assert.deepEqual(positions, []);
pressEnter();
assert.equal(labels[0], 'Play');
assert.equal(positions[0], startingPosition);

console.log('Scene tests passed');
