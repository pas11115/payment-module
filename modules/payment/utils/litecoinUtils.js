var rp = require('request-promise');
var bluebird = require('bluebird');
var config = require('./../../../config');

function LitecoinUtils() {}

LitecoinUtils.prototype.getUtxos = function(address){
    var options;
    return new bluebird.Promise(function(resolve, reject){
        if(config.ltc.network === "testnet"){
            options = {
                url: config.ltc.testnet.apiBaseUrl + "/addr/" + address + "/utxo",
                method: "GET"
            };
        }
        else{
            options = {
                url: config.ltc.livenet.apiBaseUrl + "/addr/" + address + "/utxo",
                method: "GET"
            };
        }
        rp(options)
            .then(function(body){
                console.log(body);
                resolve(JSON.parse(body))
            })
            .catch(function(error){
                reject(error);
            })

    })
};

LitecoinUtils.prototype.getBalanceOfAddress = function(address){
    var options;
    return new bluebird.Promise(function(resolve, reject){
        if(config.ltc.network === "testnet"){
            options = {
                url: config.ltc.testnet.apiBaseUrl + "/addr/" + address + '/?noTxList=1',
                method: "GET"
            };
        }
        else{
            options = {
                url: config.ltc.livenet.apiBaseUrl + "/addr/" + address,
                method: "GET"
            };
        }
        rp(options)
            .then(function(body){
                console.log(body);
                resolve(JSON.parse(body))
            })
            .catch(function(error){
                reject(error);
            })

    })
};

LitecoinUtils.prototype.broadcastTx = function(tx){
    var options;
    return new bluebird.Promise(function(resolve, reject){
        if(config.ltc.network === "testnet"){
            options = {
                url: config.ltc.testnet.apiBaseUrl + "/tx/send",
                method: "POST",
                body: {rawtx: tx},
                json: true
            };
        }
        else{
            options = {
                url: config.ltc.livenet.apiBaseUrl + "/tx/send",
                method: "POST",
                body: {rawtx: tx},
                json: true
            };
        }
        rp(options)
            .then(function(body){
                console.log(body);
                resolve(body)
            })
            .catch(function(error){
                reject(error);
            })

    })
};

LitecoinUtils.prototype.getLTCBalance = function(address){
    return new bluebird.Promise(function(resolve, reject){
        if(config.ltc.network === "testnet"){
            options = {
                url: config.ltc.testnet.apiBaseUrl + "/addr/" + address + '/?noTxList=1',
                method: "GET"
            };
        }
        else{
            options = {
                url: config.ltc.livenet.apiBaseUrl + "/addr/" + address,
                method: "GET"
            };
        }
        rp(options)
            .then(function(body){
                console.log(body);
                resolve(JSON.parse(body))
            })
            .catch(function(error){
                reject(error);
            })

    })
};

module.exports = new LitecoinUtils();