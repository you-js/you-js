import { Vector2 } from './vector.js';

export class Rect {
    /**
     * Creates a new Rectangle.
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     */
    constructor(x = 0, y = 0, width = 0, height = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    get left() {
        return this.x;
    }
    get top() {
        return this.y;
    }
    get right() {
        return this.x + this.width;
    }
    get bottom() {
        return this.y + this.height;
    }

    /**
     * Checks if a point is inside the rectangle.
     * @param {Vector2|object} point {x, y}
     * @returns {boolean}
     */
    contains(point) {
        return (
            point.x >= this.x &&
            point.x < this.x + this.width &&
            point.y >= this.y &&
            point.y < this.y + this.height
        );
    }

    /**
     * Checks if this rectangle intersects with another.
     * @param {Rect} other
     * @returns {boolean}
     */
    intersects(other) {
        return (
            this.x < other.x + other.width &&
            other.x < this.x + this.width &&
            this.y < other.y + other.height &&
            other.y < this.y + this.height
        );
    }

    /**
     * Returns the center point of the rectangle.
     * @returns {Vector2}
     */
    get center() {
        return new Vector2(this.x + this.width / 2, this.y + this.height / 2);
    }

    /**
     * Creates a Rect from an Entity-like object (must have x, y, width, height).
     * @param {object} entity
     * @returns {Rect}
     */
    static fromEntity(entity) {
        return new Rect(entity.x, entity.y, entity.width, entity.height);
    }
}

/**
 * Returns the cardinal direction (up, down, left, right) from a vector.
 * @param {Vector2} vector
 * @param {string} defaultDirection
 * @returns {string}
 */
export function getCardinalDirection(vector, defaultDirection = 'down') {
    if (!vector) return defaultDirection;

    // Angle in degrees, adjusted so 0 is right, 90 is down (canvas coordinates)
    const angle = (Math.atan2(vector.y, vector.x) * 180) / Math.PI;
    const normalizedAngle = (angle + 360) % 360;

    // Right: 315-45, Down: 45-135, Left: 135-225, Up: 225-315
    if (normalizedAngle >= 45 && normalizedAngle < 135) return 'down';
    if (normalizedAngle >= 135 && normalizedAngle < 225) return 'left';
    if (normalizedAngle >= 225 && normalizedAngle < 315) return 'up';
    return 'right';
}

/**
 * Returns horizontal direction (left, right) from a vector.
 * @param {Vector2} vector
 * @param {string} defaultDirection
 * @returns {string}
 */
export function getHorizontalDirection(vector, defaultDirection = 'left') {
    if (!vector) return defaultDirection;

    const angle = (Math.atan2(vector.y, vector.x) * 180) / Math.PI;
    const normalizedAngle = (angle + 360) % 360;

    if (normalizedAngle >= 90 && normalizedAngle < 270) return 'left';
    return 'right';
}
