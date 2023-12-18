Object.defineProperty(Math, 'clamp', {
    value: function (value, min, max) {
        return Math.max(min, Math.min(value, max));
    }
});

Object.defineProperty(Math, 'cases', {
    value: function* (counts) {
        const total = counts.reduce((acc, cur) => acc * cur, 1);
        const temp = Array(counts.length).fill(0);

        for (let i = 0; i < total; i++) {
            yield [...temp];

            temp[counts.length - 1]++;

            for (let j = counts.length - 1; j >= 0; j--) {
                if (temp[j] >= counts[j]) {
                    temp[j] = 0;
                    temp[j-1]++;
                }
                else {
                    break;
                }
            }
        }
    }
});

Object.defineProperty(Array.prototype, 'sum', {
    value: function () {
        return this.reduce((sum, value) => sum + value, 0);
    }
});

Object.defineProperty(Array.prototype, 'product', {
    value: function () {
        return this.reduce((acc, cur) => acc * cur, 1);
    }
});

Object.defineProperty(Math, 'sigmoid', {
    value: function (x) {
        return 1 / (1 + Math.exp(-x));
    }
});