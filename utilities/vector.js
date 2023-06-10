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

Object.defineProperty(Array.prototype, 'equals', {
    value: function (other) {
        if (this.length !== other.length) { throw Error() }
        return this.every((v, i) => v === other[i]);
    }
});

Object.defineProperty(Array.prototype, 'dot', {
    value: function (other) {
        if (this.length !== other.length) { throw Error() }
        return this.reduce((acc, cur, idx) => acc + cur * other[idx], 0);
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