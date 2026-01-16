// Test script for Animation System
import { Vector2 } from '../src/math/vector.js';
import { Sprite } from '../src/core/sprite.js';
import { Animation } from '../src/core/animation.js';
import { Animator } from '../src/core/components/animator.js';

console.log('=== Gemmer Animation System Test ===');

// Mock Image (since we are in Node environment)
class MockImage {
    constructor(w, h) {
        this.width = w;
        this.height = h;
    }
}
const mockImg = new MockImage(64, 64);

// 1. Sprite Pivot Test
console.log('\n--- Sprite Pivot Tests ---');
const sprite = new Sprite(mockImg, { pivot: new Vector2(0.5, 1.0) }); // Bottom-Center pivot
console.log(`Sprite Pivot: ${sprite.pivot.toString()} (Expected: 0.5, 1)`);

// 2. Animation Logic Test
console.log('\n--- Animation Logic Tests ---');
const frames = [
    { sprite: new Sprite(mockImg), duration: 0.1 },
    { sprite: new Sprite(mockImg), duration: 0.2 }, // Total 0.3
    { sprite: new Sprite(mockImg), duration: 0.1 }, // Total 0.4
];

const anim = new Animation(frames, { speed: 1, loop: true });

console.log(`Initial Time: ${anim.currentTime}, Frame: ${anim.currentFrameIndex}`);

// Advance 0.15s -> Should be in frame 1 (0.1 ~ 0.3)
anim.update(0.15);
console.log(
    `After 0.15s: Time=${anim.currentTime.toFixed(2)}, Frame=${anim.currentFrameIndex} (Expected: 1)`
);

// Advance 0.2s -> Total 0.35s -> Should be in frame 2 (0.3 ~ 0.4)
anim.update(0.2);
console.log(
    `After +0.2s (Total 0.35s): Time=${anim.currentTime.toFixed(2)}, Frame=${anim.currentFrameIndex} (Expected: 2)`
);

// Advance 0.1s -> Total 0.45s -> Loop -> 0.05s -> Frame 0
anim.update(0.1);
console.log(
    `After +0.1s (Total 0.45s): Time=${anim.currentTime.toFixed(2)}, Frame=${anim.currentFrameIndex} (Expected: 0)`
);

// 3. Animator Component Test
console.log('\n--- Animator Component Tests ---');
const animator = new Animator({
    animations: { walk: anim },
});

console.log(`Current Animation: ${animator.currentAnimationName} (Expected: walk)`);
animator.update(0.1);
console.log('Animator Updated.');

console.log('\n=== Test Complete ===');
