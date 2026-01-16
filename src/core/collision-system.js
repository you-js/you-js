import { BoxCollider } from './components/box-collider.js';

// Simple AABB Collision System
export class CollisionSystem {
    constructor(game) {
        this.game = game;
    }

    update() {
        // Collect all colliders
        const colliders = [];
        for (const entity of this.game.entities) {
            const collider = entity.getComponent(BoxCollider);
            if (collider) {
                // Clear previous frame collisions
                collider.collisions = [];
                colliders.push(collider);
            }
        }

        // Check pairs
        for (let i = 0; i < colliders.length; i++) {
            for (let j = i + 1; j < colliders.length; j++) {
                const c1 = colliders[i];
                const c2 = colliders[j];

                // Skip if both are static
                if (c1.isStatic && c2.isStatic) continue;

                if (this.checkAABB(c1, c2)) {
                    this.resolveCollision(c1, c2);
                }
            }
        }
    }

    checkAABB(c1, c2) {
        const b1 = c1.bounds;
        const b2 = c2.bounds;

        return (
            b1.x < b2.x + b2.width &&
            b1.x + b1.width > b2.x &&
            b1.y < b2.y + b2.height &&
            b1.y + b1.height > b2.y
        );
    }

    resolveCollision(c1, c2) {
        // Record collision
        c1.collisions.push(c2);
        c2.collisions.push(c1);

        // Simple resolution: push apart
        // Determine overlap amount
        const b1 = c1.bounds;
        const b2 = c2.bounds;

        const overlapX = Math.min(b1.x + b1.width - b2.x, b2.x + b2.width - b1.x);
        const overlapY = Math.min(b1.y + b1.height - b2.y, b2.y + b2.height - b1.y);

        // Resolve on the shallowest axis
        if (overlapX < overlapY) {
            // Horizontal collision
            // Calculate centers to determine direction
            const center1 = b1.x + b1.width / 2;
            const center2 = b2.x + b2.width / 2;

            // If c1 is to the left of c2, push c1 left (-1), c2 right (+1)
            const dir = center1 < center2 ? -1 : 1;
            this.separate(c1, c2, overlapX, dir, 'x');
        } else {
            // Vertical collision
            const center1 = b1.y + b1.height / 2;
            const center2 = b2.y + b2.height / 2;

            // If c1 is above c2, push c1 up (-1), c2 down (+1)
            const dir = center1 < center2 ? -1 : 1;
            this.separate(c1, c2, overlapY, dir, 'y');
        }
    }

    separate(c1, c2, amount, dir, axis) {
        // dir is the direction c1 should move relative to c2.
        // dir = -1 means c1 moves negative, c2 moves positive
        // dir = 1 means c1 moves positive, c2 moves negative

        // If one is static, the other moves full amount
        if (c1.isStatic) {
            // c1 is static, so c2 must move.
            // If dir was -1 (c1 moves left), c2 must move RIGHT (positive)
            // So c2 moves in -dir * amount
            c2.entity[axis] -= dir * amount;
        } else if (c2.isStatic) {
            // c2 is static, so c1 must move.
            // c1 moves in dir * amount
            c1.entity[axis] += dir * amount;
        } else {
            // Both dynamic: split the move
            c1.entity[axis] += dir * amount * 0.5;
            c2.entity[axis] -= dir * amount * 0.5;
        }
    }
}
