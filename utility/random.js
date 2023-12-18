const random = {
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