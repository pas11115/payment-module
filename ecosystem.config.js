module.exports = {
    apps: [
        {
            name: "Main",
            script: "server.js",
            watch: false,
            instances: 2
        },
        {
            name: "LTC Withdrawal Worker",
            script: "./workers/ltcWithdrawalWorker.js",
            watch: false
        },
        {
            name: "BTC Withdrawal Worker",
            script: "./workers/btcWithdrawalWorker.js",
            watch: false
        },
        {
            name: "ETH Withdrawal Worker",
            script: "./workers/ethWithdrawalWorker.js",
            watch: false
        },
        {
            name: "ERC20 Withdrawal Worker",
            script: "./workers/erc20WithdrawalWorker.js",
            watch: false
        }
    ]
};
