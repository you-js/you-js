Array.range = function* (start, end=null, step=1) {
    if (end === null) {
        end = start;
        start = 0;
    }

    for (let i = start; i < end; i += step) {
        yield i;
    }
};

Array.repeat = function (count, value) {
    if (count instanceof Array) {
        if (count.length === 0) { return null }
        return Array.repeat(
            count[0],
            count.length === 1
                ? value
                : () => Array.repeat(count.slice(1), value)
        );
    }
    else {
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(value instanceof Function ? value() : value);
        }
        return result;
    }
};

Array.zeros = function (...shape) {
    if (shape.length < 1) {
        throw Error();
    }
    else if (shape.length === 1) {
        return Array.repeat(shape[0], 0);
    }
    else {
        return Array.repeat(shape.at(-1), () => Array.zeros(...shape.slice(0, -1)));
    }
};

Object.defineProperty(Array.prototype, 'remove', {
    value: function (object) {
        const index = this.indexOf(object);

        if (index >= 0) {
            return this.splice(index, 1)[0];
        }

        return null;
    }
});