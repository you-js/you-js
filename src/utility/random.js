// Random Utility
// Based on sfc32 (Simple Fast Counter) from the original codebase

const randomContextStack = [];

function cyrb128(str) {
    let h1 = 1779033703,
        h2 = 3144134277,
        h3 = 1013904242,
        h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    h1 ^= h2 ^ h3 ^ h4;
    h2 ^= h1;
    h3 ^= h1;
    h4 ^= h1;
    return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

function sfc32(a, b, c, d) {
    return function () {
        a |= 0;
        b |= 0;
        c |= 0;
        d |= 0;
        var t = (((a + b) | 0) + d) | 0;
        d = (d + 1) | 0;
        a = b ^ (b >>> 9);
        b = (c + (c << 3)) | 0;
        c = (c << 21) | (c >>> 11);
        c = (c + t) | 0;
        return (t >>> 0) / 4294967296;
    };
}

function generateRandomNumberGenerator(seed) {
    const stringSeed = seed.toString();
    const hashedSeed = cyrb128(stringSeed);
    return sfc32(hashedSeed[0], hashedSeed[1], hashedSeed[2], hashedSeed[3]);
}

export const Random = {
    // Helper to get the current generator
    get generator() {
        if (randomContextStack.length > 0) {
            return randomContextStack[0][1];
        }
        return Math.random;
    },

    push(seed) {
        const randomNumberGenerator = generateRandomNumberGenerator(seed);
        randomContextStack.unshift([seed, randomNumberGenerator]);
    },

    pop() {
        randomContextStack.shift();
    },

    with(seed, callback) {
        this.push(seed);
        try {
            return callback(seed);
        } finally {
            this.pop();
        }
    },

    // Generate n random numbers
    generate(count) {
        return Array.from({ length: count }, () => this.generator());
    },

    range(start, end) {
        return this.generator() * (end - start) + start;
    },

    color(alpha = false) {
        const r = Math.trunc(this.generator() * 255);
        const g = Math.trunc(this.generator() * 255);
        const b = Math.trunc(this.generator() * 255);
        const a = alpha ? this.generator().toFixed(2) : 1;
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    },

    vector() {
        const angle = this.generator() * 2 * Math.PI;
        // Check if we can import Vector2, otherwise return object literal to avoid circular deps if lazy loaded
        // Ideally returns new Vector2(x, y) if available globally or imported
        return { x: Math.cos(angle), y: Math.sin(angle) };
    },

    vectorInRange(range) {
        const radius = this.generator() * range;
        const angle = this.generator() * 2 * Math.PI;
        return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
    },

    pick(array) {
        if (array.length === 0) return undefined;
        return array[Math.trunc(this.generator() * array.length)];
    },

    popItem(array) {
        if (array.length === 0) return undefined;
        const index = Math.trunc(this.generator() * array.length);
        return array.splice(index, 1)[0];
    },

    binomial(n, p) {
        if (n <= 0 || p <= 0) return 0;
        let result = 0;
        for (let i = 0; i < n; i++) {
            if (this.generator() < p) result++;
        }
        return result;
    },

    sample(array, options) {
        const total = array.reduce((acc, v) => acc + v, 0);
        let number = this.generator() * total;

        for (let i = 0; i < array.length; i++) {
            if (number < array[i]) {
                return options?.returnIndex === true ? i : array[i];
            }
            number -= array[i];
        }
    },
};
