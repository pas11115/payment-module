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
var LitecoinUtils = require('./utils/litecoinUtils');
var EthUtils = require('./utils/ethUtils');
var litecore = require('litecore-lib');

function Payment() {}

Payment.prototype.ethPayment = function(amount, privateKey, concernedAddress){
    return new bluebird.Promise(function(resolve, reject){
        var wallet = new ethers.Wallet(privateKey);
        wallet.provider = provider;
        var transaction = {
            to: concernedAddress
        };
        var resolvedTx;
        provider.getBalance(wallet.address)
            .then(function(balance){
                transaction.value = utils.parseEther(amount);
                return wallet.estimateGas(transaction)
            })
            .then(function(gasEstimate) {
                console.log(gasEstimate.toString());
                transaction.gasLimit = gasEstimate;
                transaction.value = utils.bigNumberify(transaction.value).add(utils.bigNumberify(gasEstimate * 1000000000));
                return EthUtils.getNonce(wallet.address)
            })
            .then(function(nonce){
                transaction.nonce = nonce;
                console.log(transaction);
                return wallet.sendTransaction(transaction);
            })
            .then(function(tx){
                resolvedTx = tx;
                return EthUtils.updateNonce(wallet.address, transaction.nonce)
            })
            .then(function(success){
                if(success)
                    resolve(resolvedTx);
            })
            .catch(function(error){
                reject(error);
            })
    })

};

Payment.prototype.erc20Payment = function(amount, privateKey, fromAddress, toAddress, contractAddress, decimal){
    var wallet = new ethers.Wallet(privateKey);
    wallet.provider = provider;
    var availableBalance;
    var tokenTx = {
        to: contractAddress
    };
    var to = toAddress;
    return new bluebird.Promise(function(resolve, reject) {
        tokenTx.gasLimit = 81000;
        availableBalance = (parseInt(amount) * Math.pow(10, decimal));

        tokenTx.data = String(EthUtils.createDataForTokenTransfer(to, availableBalance));
        console.log(tokenTx);
        var resolvedTx;
        EthUtils.getNonce(wallet.address)
            .then(function(nonce){
                tokenTx.nonce = nonce;
                return wallet.sendTransaction(tokenTx)
            })
            .then(function(tx){
                resolvedTx = tx;
                return EthUtils.updateNonce(wallet.address, tokenTx.nonce)
            })
            .then(function(success){
                if(success)
                    resolve(resolvedTx);
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

Payment.prototype.ltcPayment = function(amount, privateKey, fromAddress, toAddress){
    var privKey = litecore.PrivateKey.fromWIF(privateKey);
    var sourceAddress;
    if(config.ltc.network === "testnet"){
        sourceAddress = privKey.toAddress(litecore.Networks.testnet);
    }
    else{
        sourceAddress = privKey.toAddress(litecore.Networks.livenet);
    }
    return new bluebird.Promise(function(resolve, reject){
        LitecoinUtils.getUtxos(sourceAddress.toString())
            .then(function(utxos){
                var tx = new litecore.Transaction().fee(3000);

                tx.from(utxos);
                tx.to(toAddress, amount);
                tx.change(sourceAddress);
                tx.sign(privKey);//aes.decrypt(privateKey, config.secretKey).toString(CryptoJS.enc.Utf8));

                return tx.serialize();
            })
            .then(function(serializedTx){
                return LitecoinUtils.broadcastTx(serializedTx)
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