// Test script to verify recent changes
import { Vector2 } from '../src/math/vector.js';
import { Rect, getCardinalDirection } from '../src/math/geometry.js';
import { Transform } from '../src/core/components/transform.js';
import { Entity } from '../src/core/entity.js';
import { Game } from '../src/core/game.js';
import { Random } from '../src/utility/random.js';
import { MathUtil } from '../src/math/math.js';

console.log("=== Gemmer Engine Migration Test ===");

// 1. Math Tests
console.log("\n--- Math & Vector Tests ---");
const v1 = new Vector2(10, 20);
const v2 = new Vector2(5, 5);
console.log(`v1: ${v1.toString()}, v2: ${v2.toString()}`);
console.log(`v1 + v2: ${Vector2.add(v1, v2).toString()}`);
console.log(`v1 dot v2: ${v1.dot(v2)} (Expected: 150)`);
console.log(`MathUtil.clamp(150, 0, 100): ${MathUtil.clamp(150, 0, 100)} (Expected: 100)`);
console.log(`Direction (1, 0): ${getCardinalDirection(new Vector2(1, 0))} (Expected: right)`);

// 2. Geometry Tests
console.log("\n--- Geometry Tests ---");
const rect1 = new Rect(0, 0, 50, 50);
const point = new Vector2(25, 25);
console.log(`Rect contains point (25,25): ${rect1.contains(point)} (Expected: true)`);
const rect2 = new Rect(40, 40, 50, 50);
console.log(`Rect intersects rect2: ${rect1.intersects(rect2)} (Expected: true)`);

// 3. Transform & Hierarchy Tests
console.log("\n--- Transform Hierarchy Tests ---");
const parent = new Entity(100, 100);
const child = new Entity(50, 0); // Local offset 50 x
console.log(`Parent Pos: (${parent.x}, ${parent.y})`);
console.log(`Child Local Pos: (${child.x}, ${child.y})`);

child.transform.setParent(parent);
console.log("Set Parent: Child -> Parent");
console.log(`Child Global Pos (Before Rotate): (${child.transform.globalPosition.x}, ${child.transform.globalPosition.y}) (Expected: 150, 100)`);

parent.rotation = 90;
console.log("Parent Rotated 90 degrees");
const childGlobal = child.transform.globalPosition;
console.log(`Child Global Pos (After Rotate): (${Math.round(childGlobal.x)}, ${Math.round(childGlobal.y)}) (Expected: 100, 150)`);

// 4. Utility Tests
console.log("\n--- Utility Tests ---");
console.log(`Random Color: ${Random.color()}`);
console.log(`Random UUID: ${import('../src/utility/uuid.js').then(m => console.log(m.UUID.generate()))}`);

console.log("\n=== Test Complete ===");
