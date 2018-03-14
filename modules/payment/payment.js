var config = require('./../../config');
var Web3 = require('web3');
var web3 = new Web3(config.web3Provider);
var ethers = require('ethers');
var Wallet = ethers.Wallet;
var utils = ethers.utils;
var providers = ethers.providers;
var provider = new providers.JsonRpcProvider(config.web3Provider, config.ethersNetwork);
var mongoose = require('mongoose');
var bluebird = require('bluebird');
var bitcore = require('bitcore-lib');
var BitcoinUtils = require('./utils/bitcoinUtils');

function Payment() {}

Payment.prototype.ethPayment = function(amount, privateKey, concernedAddress, isConcernedAddressHotWallet, isWithdrawal){
    return new bluebird.Promise(function(resolve, reject){
        var wallet = new ethers.Wallet(aes.decrypt(privateKey, config.secretKey).toString(CryptoJS.enc.Utf8));
        wallet.provider = provider;
        var transaction = {
            to: concernedAddress
        };
        provider.getBalance(wallet.address)
            .then(function(balance){
                if(isConcernedAddressHotWallet)
                    transaction.value = balance;
                else
                    transaction.value = utils.parseEther(amount);
                return wallet.estimateGas(transaction)
            })
            .then(function(gasEstimate) {
                console.log(gasEstimate.toString());
                transaction.gasLimit = gasEstimate;
                if(isConcernedAddressHotWallet)
                    transaction.value = transaction.value - (gasEstimate * 10000000000);
                else
                    transaction.value = utils.bigNumberify(transaction.value).add(utils.bigNumberify(gasEstimate * 10000000000));
                return wallet.sendTransaction(transaction);
            })
            .then(function(transaction) {
                var tx = new Transaction();
                tx.Wallet = transaction.from;
                tx.Currency = "ETH";
                tx.ConcernedAddress = transaction.to;
                tx.Amount = transaction.value;
                tx.Merchant = config.merchant.merchantId;
                tx.Hash = transaction.hash;
                tx.Timestamp = parseInt(Date.now() / 1000);
                tx.Extra = transaction;
                return tx.save();
            })
            .then(function(tx){
                if(isWithdrawal){
                    return provider.waitForTransaction(tx.Hash);
                }
                else{
                    return provider.waitForTransaction(tx.Hash);
                }

            })
            .then(function(transaction){
                resolve(transaction);
            })
            .catch(function(error){
                reject(error);
            })
    })

};

Payment.prototype.mcapPayment = function(amount, privateKey, fromAddress, toAddress, isWithdrawal){
    var wallet = new ethers.Wallet(aes.decrypt(privateKey, config.secretKey).toString(CryptoJS.enc.Utf8));
    wallet.provider = provider;
    console.log(toAddress);
    var availableBalance;
    var mcapTx = {
        to: config.mcap.contractAddress
    };
    var to = toAddress;
    return new bluebird.Promise(function(resolve, reject) {
        PaymentUtils.getMCAPBalance(fromAddress)
            .then(function (balance) {
                mcapTx.gasLimit = 81000;
                if(isWithdrawal){
                    availableBalance = (parseInt(amount) * Math.pow(10, config.mcap.decimal));
                }
                else{
                    availableBalance = (parseInt(balance));
                }

                mcapTx.data = String(PaymentUtils.createDataForTokenTransfer(to, availableBalance));
                console.log(mcapTx);
                return wallet.sendTransaction(mcapTx);
            })
            .then(function(transaction) {
                var tx = new Transaction();
                tx.Wallet = fromAddress;
                tx.Currency = "MCAP";
                tx.ConcernedAddress = toAddress;
                tx.Amount = availableBalance;
                tx.Merchant = config.merchant.merchantId;
                tx.Hash = transaction.hash;
                tx.Timestamp = parseInt(Date.now() / 1000);
                tx.Extra = transaction;
                return tx.save();
            })
            .then(function(tx){
                if(isWithdrawal){
                    // return tx.Extra
                    return provider.waitForTransaction(tx.Hash);
                }
                else{
                    return provider.waitForTransaction(tx.Hash);
                }
            })
            .then(function(transaction){
                resolve(transaction);
            })
            .catch(function(error){
                reject(error);
            })
    })
};

Payment.prototype.btcPayment = function(amount, privateKey, fromAddress, toAddress){
    var privKey = bitcore.PrivateKey.fromWIF(privateKey);
    var sourceAddress;
    if(config.btc.network === "testnet"){
        sourceAddress = privKey.toAddress(bitcore.Networks.testnet);
    }
    else{
        sourceAddress = privKey.toAddress(bitcore.Networks.livenet);
    }
    return new bluebird.Promise(function(resolve, reject){
        BitcoinUtils.getUtxos(sourceAddress.toString())
            .then(function(utxos){
                var tx = new bitcore.Transaction().fee(3000);

                tx.from(utxos);
                tx.to(toAddress, amount);
                tx.change(sourceAddress);
                tx.sign(privKey);//aes.decrypt(privateKey, config.secretKey).toString(CryptoJS.enc.Utf8));

                return tx.serialize();
            })
            .then(function(serializedTx){
                return BitcoinUtils.broadcastTx(serializedTx)
            })
            .then(function(res){
                return JSON.parse(JSON.stringify(res)).txid;
            })
            .then(function(tx){
                resolve(tx)
            })
            .catch(function(error){
                reject(error);
            })
    })
};

module.exports = new Payment();