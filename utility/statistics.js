const statistics = {
    combination(n, r) {
        const dp = new Array(n + 1);

        for (let i = 0; i <= n; i++) {
            dp[i] = new Array(r + 1).fill(0);
        }

        for (let i = 0; i <= n; i++) {
            dp[i][0] = 1;
        }

        for (let i = 1; i <= n; i++) {
            for (let j = 1; j <= r; j++) {
                dp[i][j] = dp[i - 1][j - 1] + dp[i - 1][j];
            }
        }

        return dp[n][r];
    },
    sample(distribution) {
        const total = distribution.reduce((sum, value) => sum + value, 0);
        const randomValue = Math.random() * total;

        for (let i = 0, acc = 0; i < distribution.length; i++) {
            acc += distribution[i];

            if (randomValue < acc) {
                return i;
            }
        }
    },
};

export default statistics;