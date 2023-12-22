const randomContextStack = [];

function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
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
    h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
    return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}

function sfc32(a, b, c, d) {
    return function() {
        a |= 0; b |= 0; c |= 0; d |= 0; 
        var t = (a + b | 0) + d | 0;
        d = d + 1 | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = (c << 21 | c >>> 11);
        c = c + t | 0;
        return (t >>> 0) / 4294967296;
    }
}

function generateRandomNumberGenerator(seed) {
    const stringSeed = seed.toString();
    const hashedSeed = cyrb128(stringSeed);
    return sfc32(hashedSeed[0], hashedSeed[1], hashedSeed[2], hashedSeed[3]);
}

const random = {
    push(seed) {
        const randomNumberGenerator = generateRandomNumberGenerator(seed);
        randomContextStack.unshift([seed, randomNumberGenerator]);
    },
    pop() {
        randomContextStack.shift();
    },
    with(callback) {
        if (randomContextStack.length === 0) { return callback() }

        const [seed, randomNumberGenerator] = randomContextStack[0];
        const previousRandomNumberGenerator = Math.random;
        Math.random = randomNumberGenerator;
        const result = callback(seed);
        Math.random = previousRandomNumberGenerator;
        return result;
    },
    generate(count) {
        return Array.from({ length: count }, () => Math.random());
    },
    range(start, end) {
        return Math.random() * (end - start) + start
    },
    color(alpha=false) {
        return `rgba(${random.generate(3).map(v => v * 255).map(Math.trunc).join(', ')}, ${alpha ? Math.random() : 1})`;
    },
    vector() {
        const angle = Math.random() * 2 * Math.PI;
        const vector = [Math.cos(angle), Math.sin(angle)];
        return vector;
    },
    vectorInRange(range) {
        const radius = Math.random() * range;
        const angle = Math.random() * 2 * Math.PI;
        const vector = [Math.cos(angle), Math.sin(angle)].map(v => v * radius);
        return vector;
    },
    pick(array) {
        return array[Math.trunc(Math.random() * array.length)];
    },
    pop(array) {
        const index = Math.trunc(Math.random() * array.length);
        return array.splice(index, 1)[0];
    },
    binomial(n, p) {
        if (n <= 0 || p <= 0) { return 0 }

        let result = 0;

        for (let i = 0; i < n; i++) {
            if (Math.random() < p) { result++ }
        }

        return result;
    }
};

export default random;