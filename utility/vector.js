Object.defineProperty(Array.prototype, 'add', {
    value: function (other) {
        if (other instanceof Array) {
            if (this.length !== other.length) { throw Error() }
            return this.map((value, index) => value + other[index]);
        }
        else {
            return this.map(value => value + other);
        }
    }
});

Object.defineProperty(Array.prototype, 'sub', {
    value: function (other) {
        if (other instanceof Array) {
            if (this.length !== other.length) { throw Error() }
            return this.map((value, index) => value - other[index]);
        }
        else {
            return this.map(value => value - other);
        }
    }
});

Object.defineProperty(Array.prototype, 'mul', {
    value: function (other) {
        if (other instanceof Array) {
            if (this.length !== other.length) { throw Error() }
            return this.map((value, index) => value * other[index]);
        }
        else {
            return this.map(value => value * other);
        }
    }
});

Object.defineProperty(Array.prototype, 'div', {
    value: function (other) {
        if (other instanceof Array) {
            if (this.length !== other.length) { throw Error() }
            return this.map((value, index) => value / other[index]);
        }
        else {
            return this.map(value => value / other);
        }
    }
});

Object.defineProperty(Array.prototype, 'to', {
    value: function (other) {
        if (this.length !== other.length) { throw Error() }
        return other.sub(this);
    }
});

Object.defineProperty(Array.prototype, 'dot', {
    value: function (other) {
        if (this.length !== other.length) { throw Error() }
        return this.reduce((acc, cur, idx) => acc + cur * other[idx], 0);
    }
});

Object.defineProperty(Array.prototype, 'cross', {
    value: function (other) {
        if (this.length !== other.length) { throw Error() }
        if (this.length === 2) {
            return this[0] * other[1] - this[1] * other[0];
        }
        else if (this.length === 3) {
            return [
                this[1] * other[2] - this[2] * other[1],
                this[2] * other[0] - this[0] * other[2],
                this[0] * other[1] - this[1] * other[0],
            ];
        }

        throw Error();
    }
});

Object.defineProperty(Array.prototype, 'negate', {
    get() {
        return this.mul(-1);
    }
});

Object.defineProperty(Array.prototype, 'magnitude', {
    get() {
        return Math.sqrt(this.dot(this));
    }
});

Object.defineProperty(Array.prototype, 'normalize', {
    value: function () {
        return this.div(this.magnitude);
    }
});

Object.defineProperty(Array.prototype, 'distanceTo', {
    value: function (other) {
        if (this.length !== other.length) { throw Error() }
        return other.sub(this).magnitude;
    }
});

Object.defineProperty(Array.prototype, 'directionTo', {
    value: function (other) {
        if (this.length !== other.length) { throw Error() }
        return other.sub(this).normalize();
    }
});