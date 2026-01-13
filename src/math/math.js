export const MathUtil = {
    /**
     * Clamps a value between a minimum and maximum.
     * @param {number} value 
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(value, max));
    },

    /**
     * Linearly interpolates between two values.
     * @param {number} start 
     * @param {number} end 
     * @param {number} t Interpolation factor (0-1)
     * @returns {number}
     */
    lerp(start, end, t) {
        return start * (1 - t) + end * t;
    },

    /**
     * Sigmoid activation function.
     * @param {number} x 
     * @returns {number}
     */
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    },

    /**
     * Calculates the sum of an array of numbers.
     * @param {number[]} array 
     * @returns {number}
     */
    sum(array) {
        return array.reduce((sum, value) => sum + value, 0);
    },

    /**
     * Calculates the product of an array of numbers.
     * @param {number[]} array 
     * @returns {number}
     */
    product(array) {
        return array.reduce((acc, cur) => acc * cur, 1);
    },

    /**
     * Generates combinations of indices based on counts.
     * Equivalent to 'cases' in original codebase.
     * @param {number[]} counts 
     */
    *cases(counts) {
        const total = counts.reduce((acc, cur) => acc * cur, 1);
        const temp = Array(counts.length).fill(0);

        for (let i = 0; i < total; i++) {
            yield [...temp];

            temp[counts.length - 1]++;

            for (let j = counts.length - 1; j >= 0; j--) {
                if (temp[j] >= counts[j]) {
                    temp[j] = 0;
                    temp[j - 1]++;
                } else {
                    break;
                }
            }
        }
    }
};
