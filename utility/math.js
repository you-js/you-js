Math.clamp = function (min, value, max) {
    return Math.max(min, Math.min(value, max));
};

Math.cases = function* (counts) {
    const total = counts.reduce((acc, cur) => acc * cur, 1);
    const temp = Array.repeat(counts.length, 0);

    for (let i = 0; i < total; i++) {
        yield [...temp];
        temp[counts.length - 1]++;
        for (let j = counts.length - 1; j >= 0; j--) {
            if (temp[j] >= counts[j]) {
                temp[j] = 0;
                temp[j-1]++;
            }
            else { break }
        }
    }
};

Object.defineProperty(Array.prototype, 'sum', {
    value: function () {
        return this.reduce((acc, cur) => acc + cur, 0);
    }
});

Object.defineProperty(Array.prototype, 'product', {
    value: function () {
        return this.reduce((acc, cur) => acc * cur, 1);
    }
});