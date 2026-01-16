export class Vector2 {
    /**
     * Creates a new Vector2.
     * @param {number} x
     * @param {number} y
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * Sets the x and y components of this vector.
     * @param {number} x
     * @param {number} y
     * @returns {Vector2} This vector for chaining.
     */
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * Copies the values from another vector.
     * @param {Vector2} v
     * @returns {Vector2} This vector for chaining.
     */
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    /**
     * Creates a new vector with the same values as this one.
     * @returns {Vector2} A new Vector2 instance.
     */
    clone() {
        return new Vector2(this.x, this.y);
    }

    /**
     * Adds another vector to this one.
     * @param {Vector2} v
     * @returns {Vector2} This vector for chaining.
     */
    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    /**
     * Subtracts another vector from this one.
     * @param {Vector2} v
     * @returns {Vector2} This vector for chaining.
     */
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    /**
     * Multiplies this vector by a scalar.
     * @param {number} scalar
     * @returns {Vector2} This vector for chaining.
     */
    mul(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    /**
     * Divides this vector by a scalar.
     * @param {number} scalar
     * @returns {Vector2} This vector for chaining.
     */
    div(scalar) {
        if (scalar === 0) throw new Error('Vector2.div: Division by zero');
        this.x /= scalar;
        this.y /= scalar;
        return this;
    }

    /**
     * Calculates the dot product with another vector.
     * @param {Vector2} v
     * @returns {number} The dot product.
     */
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    /**
     * Calculates the magnitude (length) of the vector.
     * @returns {number} The magnitude.
     */
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Normalizes the vector (makes it unit length).
     * @returns {Vector2} This vector for chaining.
     */
    normalize() {
        const mag = this.magnitude();
        if (mag === 0) return this;
        return this.div(mag);
    }

    /**
     * Calculates the distance to another vector.
     * @param {Vector2} v
     * @returns {number} The distance.
     */
    distanceTo(v) {
        return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2);
    }

    /**
     * Returns a new normalized vector pointing from this vector to the target.
     * @param {Vector2} v
     * @returns {Vector2} A new Vector2.
     */
    directionTo(v) {
        return new Vector2(v.x - this.x, v.y - this.y).normalize();
    }

    /**
     * Returns a formatted string representation of the vector.
     * @returns {string}
     */
    toString() {
        return `Vector2(${this.x}, ${this.y})`;
    }

    // Static Methods for immutable operations

    static add(v1, v2) {
        return new Vector2(v1.x + v2.x, v1.y + v2.y);
    }

    static sub(v1, v2) {
        return new Vector2(v1.x - v2.x, v1.y - v2.y);
    }

    static mul(v, scalar) {
        return new Vector2(v.x * scalar, v.y * scalar);
    }

    static div(v, scalar) {
        if (scalar === 0) throw new Error('Vector2.div: Division by zero');
        return new Vector2(v.x / scalar, v.y / scalar);
    }

    static get zero() {
        return new Vector2(0, 0);
    }
    static get one() {
        return new Vector2(1, 1);
    }
    static get up() {
        return new Vector2(0, -1);
    } // Screen coordinates: up is -y
    static get down() {
        return new Vector2(0, 1);
    }
    static get left() {
        return new Vector2(-1, 0);
    }
    static get right() {
        return new Vector2(1, 0);
    }
}
