var rp = require('request-promise');
var bluebird = require('bluebird');
var config = require('./../../../config');
var ethers = require('ethers');
var utils = ethers.utils;
var Web3 = require('web3');
var web3 = new Web3(config.web3Provider);
var EthErc20Account = require('../../../models/ethErc20Account');

function EthUtils() {}

var addAccount = function(address, nonce){
    return new bluebird.Promise(function(resolve, reject){
        var account = new EthErc20Account();
        account.Address = address;
        account.Nonce = nonce;
        account.save()
            .then(function(savedAccount){
                resolve(true)
            })
            .catch(function(error){
                resolve(false)
            })
    })
};

EthUtils.prototype.getNonce = function(address){
    return new bluebird.Promise(function(resolve, reject){
        var txCount, nonce;
        web3.eth.getTransactionCount(address)
            .then(function(nonce){
                txCount = nonce;
                return EthErc20Account.findOne({Address:address})
            })
            .then(function(account){
                if(account !== null){
                    if(txCount > account.Nonce){
                        nonce = txCount
                    }
                    else{
                        nonce = account.Nonce
                    }
                    resolve(nonce)
                }
                else{
                    return addAccount(address, txCount)
                }
            })
            .then(function(accountAdded){
                if(accountAdded){
                    resolve(nonce)
                }
                else{
                    reject(false)
                }
            })
            .catch(function(err){
                reject(err)
            })
    })

};

EthUtils.prototype.updateNonce = function(address, nonce){
    return new bluebird.Promise(function(resolve, reject){
        EthErc20Account.findOneAndUpdate(
            {Address: address},
            {$set: {Nonce: nonce + 1}})
            .then(function (updatedAccount) {
                resolve(true)
            })
            .catch(function(err){
                resolve(false)
            })
    })
};

EthUtils.prototype.create64BitToken = function(token){
    var len = token.slice(2).length;
    var pre = "";
    while (len < 64){
        pre += "0";
        len++;
    }
    return pre + token.slice(2);
};

EthUtils.prototype.createDataForTokenTransfer = function(toAddress, amount){
    var prefix = "0xa9059cbb000000000000000000000000";
    var address = toAddress.slice(2);
    var suffix = this.create64BitToken(utils.hexlify(amount));
    return prefix + address + suffix
};

module.exports = new EthUtils();