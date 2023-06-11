import {} from "./vector.js";
import statistics from "./statistics.js";

export class Random {

    static range(start, end) { return Math.random() * (end - start) + start }
    static repeat(count) {
        return Array.repeat(count, () => Math.random());
    }
    static color(alpha=false) {
        return `rgba(${Random.repeat(3).mul(255).map(Math.trunc).join(', ')}, ${alpha ? Math.random() : 1})`;
    }
    static vector(range) {
        const radius = Math.random() * range;
        const angle = Math.random() * 2 * Math.PI;
        const movementVector = [Math.cos(angle), Math.sin(angle)].mul(radius);
        return movementVector;
    }
    static vectorRadius(radius) {
        const angle = Math.random() * 2 * Math.PI;
        const movementVector = [Math.cos(angle), Math.sin(angle)].mul(radius);
        return movementVector;
    }
    static pop(array) {
        const index = Math.floor(Math.random() * array.length);
        return array.splice(index, 1)[0];
    }
    static sample(candidates) {
        const total = candidates.reduce((acc, cur) => acc + cur, 0);
        const normalized = candidates.map(c => c / total);
        const accumulated = normalized.reduce((acc, cur) => { acc.push(acc[acc.length - 1] + cur); return acc }, [0]);
        const randomValue = Math.random();
        for (let i = 1; i < accumulated.length; i++) {
            const value = accumulated[i];
            if (randomValue < value) {
                return i - 1;
            }
        }
    }
    static choose(array, count=1) {
        const candidates = [...array];
        const result = [];

        for (let i = 0; i < count; i++) {
            const index = Math.trunc(Math.random() * candidates.length);
            const element = candidates.splice(index, 1)[0];
            result.push(element);
        }

        return count === 1 ? result[0] : result;
    }
    static binomial(n, p, size=1) {
        const values = Array.repeat(size, () => Math.random());
        const result = Array.repeat(size, n);
        let cum = 0;
        let prob = Math.pow(1-p, n);
        for (let i = 0; i < n; i++) {
            cum += statistics.combination(n, i) * prob;
            values.forEach((value, index) => {
                if (result[index] === n && value < cum) {
                    result[index] = i;
                }
            });
            prob *= p / (1-p);
        }

        return result;
    }
}