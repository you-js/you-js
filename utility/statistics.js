function combination(n, r) {
    // 조합의 경우의 수를 저장할 2차원 배열
    const dp = new Array(n + 1);
    for (let i = 0; i <= n; i++) {
        dp[i] = new Array(r + 1).fill(0);
    }

    // 초기값 설정
    for (let i = 0; i <= n; i++) {
        dp[i][0] = 1;
    }

    // 다이나믹 프로그래밍을 사용하여 조합의 경우의 수 계산
    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= r; j++) {
            dp[i][j] = dp[i - 1][j - 1] + dp[i - 1][j];
        }
    }

    // 결과 반환
    return dp[n][r];
}

export default {
    combination,
};