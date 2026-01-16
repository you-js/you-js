// Test script for Phase 1: Utilities & Foundations
import { Vector2 } from '../src/math/vector.js';
import { MathUtil } from '../src/math/math.js';
import { Rect, getCardinalDirection, getHorizontalDirection } from '../src/math/geometry.js';
import { UUID } from '../src/utility/uuid.js';
import { Random } from '../src/utility/random.js';

console.log('=== Phase 1: Utilities & Math Test ===');

function assert(condition, message) {
    if (condition) {
        console.log(`PASS: ${message}`);
    } else {
        console.error(`FAIL: ${message}`);
        process.exit(1);
    }
}

// 1. Vector2 Tests
console.log('\n--- Vector2 ---');
const v1 = new Vector2(10, 20);
const v2 = new Vector2(5, 5);
const v3 = v1.clone().add(v2);

assert(v3.x === 15 && v3.y === 25, 'Vector add & clone');
assert(v1.x === 10, 'Original vector unchanged after clone');
assert(v1.dot(v2) === 150, 'Dot product (10*5 + 20*5)');
assert(new Vector2(3, 4).magnitude() === 5, 'Magnitude (3-4-5 triangle)');

const vNorm = new Vector2(10, 0).normalize();
assert(vNorm.x === 1 && vNorm.y === 0, 'Normalize');

// Static methods
const vStatic = Vector2.add(v1, v2);
assert(vStatic.x === 15, 'Static Add');

// 2. MathUtil Tests
console.log('\n--- MathUtil ---');
assert(MathUtil.clamp(150, 0, 100) === 100, 'Clamp upper bound');
assert(MathUtil.clamp(-10, 0, 100) === 0, 'Clamp lower bound');
assert(MathUtil.lerp(0, 10, 0.5) === 5, 'Lerp 0.5');
assert(MathUtil.sum([1, 2, 3, 4]) === 10, 'Sum');

// 3. Geometry Tests
console.log('\n--- Geometry ---');
const rect1 = new Rect(0, 0, 100, 100);
const pIn = new Vector2(50, 50);
const pOut = new Vector2(150, 50);

assert(rect1.contains(pIn), 'Rect contains point inside');
assert(!rect1.contains(pOut), 'Rect does not contain point outside');

const rect2 = new Rect(50, 50, 100, 100); // Overlaps
const rect3 = new Rect(200, 200, 100, 100); // Disjoint

assert(rect1.intersects(rect2), 'Rect intersects overlapping rect');
assert(!rect1.intersects(rect3), 'Rect does not intersect disjoint rect');

const upVec = new Vector2(0, -1);
assert(getCardinalDirection(upVec) === 'up', 'Cardinal Direction UP');
assert(getHorizontalDirection(new Vector2(-1, 0.1)) === 'left', 'Horizontal Direction LEFT');

// 4. UUID & Random
console.log('\n--- Utilities ---');
const id1 = UUID.generate();
const id2 = UUID.generate();
assert(typeof id1 === 'string' && id1.length > 0, 'UUID generated');
assert(id1 !== id2, 'UUIDs are unique');

const randVal = Random.range(10, 20);
assert(randVal >= 10 && randVal < 20, 'Random Range');

const color = Random.color();
assert(color.startsWith('rgba('), 'Random Color format');

console.log('\n=== Phase 1 Tests Passed ===');
