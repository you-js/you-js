Object.defineProperty(Array.prototype, 'contains', {
    value: function (other) {
        if (this.length === 4) {
            if (other.length === 2) {
                return (
                    this[0] <= other[0] && other[0] < this[0] + this[2] &&
                    this[1] <= other[1] && other[1] < this[1] + this[3]
                );
            }
            else if (other.length === 4) {
                return (
                    this[0] <= other[0] && other[0] + other[2] <= this[0] + this[2] &&
                    this[1] <= other[1] && other[1] + other[3] <= this[1] + this[3]
                );
            }
            else {
                throw `'other' is not 2d point or area: ${other}`;
            }
        }
        else if (this.length === 6) {
            if (other.length === 3) {
                return (
                    this[0] <= other[0] && other[0] < this[0] + this[3] &&
                    this[1] <= other[1] && other[1] < this[1] + this[4] &&
                    this[2] <= other[2] && other[2] < this[2] + this[5]
                );
            }
            else if (other.length === 6) {
                return (
                    this[0] <= other[0] && other[0] + other[3] <= this[0] + this[3] &&
                    this[1] <= other[1] && other[1] + other[4] <= this[1] + this[4] &&
                    this[2] <= other[2] && other[2] + other[5] <= this[2] + this[5]
                );
            }
            else {
                throw `'other' is not 3d point or cube: ${other}`;
            }
        }
        else {
            throw `'this' is not 2d area or 3d cube: ${this}`;
        }
    }
});

Object.defineProperty(Array.prototype, 'intersects', {
    value: function (other) {
        if (this.length === 4) {
            if (other.length === 4) {
                return (
                    this[0] < other[0] + other[2] && other[0] < this[0] + this[2] &&
                    this[1] < other[1] + other[3] && other[1] < this[1] + this[3]
                );
            }
            else {
                throw `'other' is not 2d area: ${other}`;
            }
        }
        else if (this.length === 6) {
            if (other.length === 4) {
                return (
                    this[0] < other[0] + other[3] && other[0] < this[0] + this[3] &&
                    this[1] < other[1] + other[4] && other[1] < this[1] + this[4] &&
                    this[2] < other[2] + other[5] && other[2] < this[2] + this[5]
                );
            }
            else {
                throw `'other' is not 3d cube: ${other}`;
            }
        }
        else {
            throw `'this' is not 2d area or 3d cube: ${this}`;
        }
    }
});

Object.defineProperty(Array.prototype, 'center', {
    get() {
        return this.map((v, i) => v + this[i + this.length / 2] / 2);
    }
});

Object.defineProperty(Array.prototype, 'center2d', {
    get() {
        if (this.length !== 4) { throw `'this' is not 2d area` }
        return [
            this[0] + this[2] / 2,
            this[1] + this[3] / 2
        ];
    }
});

Object.defineProperty(Array.prototype, 'center3d', {
    get() {
        if (this.length !== 6) { throw `'this' is not 3d cube` }
        return [
            this[0] + this[3] / 2,
            this[1] + this[4] / 2,
            this[2] + this[5] / 2
        ];
    }
});

Object.defineProperty(Array.prototype, 'clip', {
    value: function (other) {
        if (this.length * 2 !== other.length) { throw `'this' length(${this}) * 2 must be equal to 'other' length(${other.length})` }
        return this.map((v, i) => Math.max(other[i], Math.min(v, other[i] + other[i + this.length])));
    }
});

Object.defineProperty(Array.prototype, 'enlarge', {
    value: function (size, anchor=null) {
        if (this.length !== size.length * 2) { throw `'this' length(${this.length}) must be equal to 'size' length(${size.length}) * 2` }
        anchor = anchor ?? size.map(_ => .5);
        if (size.length !== anchor.length) { throw `'size' length(${size.length}) must be equal to 'anchor' length(${anchor.length})` }

        return [
            ...this.slice(0, this.length / 2).map((v, i) => v - size[i] * anchor[i]),
            ...this.slice(this.length / 2).map((v, i) => v + size[i])
        ].align();
    }
});

Object.defineProperty(Array.prototype, 'shrink', {
    value: function (size, anchor=null) {
        if (this.length !== size.length * 2) { throw `'this' length(${this.length}) must be equal to 'size' length(${size.length}) * 2` }
        anchor = anchor ?? size.map(_ => .5);
        if (size.length !== anchor.length) { throw `'size' length(${size.length}) must be equal to 'anchor' length(${anchor.length})` }

        return [
            ...this.slice(0, this.length / 2).map((v, i) => v + size[i] * anchor[i]),
            ...this.slice(this.length / 2).map((v, i) => v - size[i])
        ].align();
    }
});

Object.defineProperty(Array.prototype, 'align', {
    value: function () {
        return [
            ...this.slice(0, this.length / 2).map((v, i) => v + (this[i + this.length / 2] < 0 ? this[i + this.length / 2] : 0)),
            ...this.slice(this.length / 2).map(Math.abs)
        ];
    }
});