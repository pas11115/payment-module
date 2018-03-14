var Withdrawal = require('./../../../../models/withdrawal');
var logger = require('./../helpers/log');
var web3 = require('web3');
var bitcore = require('bitcore-lib');
var config = require('./../../../../config');
function Controller() {}

Controller.prototype.ethWithdraw = function(req, res){
    var amount = req.body.amount;
    var withdrawalAddress = req.body.withdrawalAddress;
    var walletAddress = req.body.walletAddress;
    var walletKey = req.body.walletKey;
    if(parseFloat(amount) <= 0 || isNaN(amount)){
        res.status(400).json({
            "success": false,
            "message": "valid amount is required"
        });
    }
    else if(web3.utils.isAddress(withdrawalAddress) === false){
        res.status(400).json({
            "success": false,
            "message": "invalid withdrawal address"
        });
    }
    else if(web3.utils.isAddress(walletAddress) === false){
        res.status(400).json({
            "success": false,
            "message": "invalid from address"
        });
    }
    /* @todo check if private key is valid or not */
    else{
        var withdrawal = new Withdrawal();
        withdrawal.Currency = "ETH";
        withdrawal.Amount = amount;
        withdrawal.WithdrawalAddress = withdrawalAddress;
        withdrawal.WalletAddress = walletAddress;
        withdrawal.WalletKey = walletKey;
        withdrawal.Timestamp = parseInt(Date.now() / 1000);
        withdrawal.save()
            .then(function(savedWithdrawal){
                logger.log('info', savedWithdrawal._id + " successfully saved");
                res.status(200).json({
                    "requestId": savedWithdrawal._id,
                    "withdrawalAddress": savedWithdrawal.WithdrawalAddress,
                    "amount": savedWithdrawal.Amount
                });
            })
            .catch(function(error){
                logger.log('error', "error saving ethWithdrawal", {"message": error});
                res.status(400).json({
                    "success": false,
                    "message": "withdrawal could not be processed"
                });
            })
    }

};

Controller.prototype.btcWithdraw = function(req, res){
    var amount = req.body.amount;
    var withdrawalAddress = req.body.withdrawalAddress;
    var walletAddress = req.body.walletAddress;
    var walletKey = req.body.walletKey;
    if(parseFloat(amount) <= 0 || isNaN(amount)){
        res.status(400).json({
            "success": false,
            "message": "valid amount is required"
        });
    }
    else if(bitcore.Address.isValid(withdrawalAddress, config.btc[config.btc.network].network) === false){
        res.status(400).json({
            "success": false,
            "message": "invalid withdrawal address"
        });
    }
    else if(bitcore.Address.isValid(walletAddress, config.btc[config.btc.network].network) === false){
        res.status(400).json({
            "success": false,
            "message": "invalid from address"
        });
    }
    /* @todo check if private key is valid or not */
    else{
        var withdrawal = new Withdrawal();
        withdrawal.Currency = "BTC";
        withdrawal.Amount = amount;
        withdrawal.WithdrawalAddress = withdrawalAddress;
        withdrawal.WalletAddress = walletAddress;
        withdrawal.WalletKey = walletKey;
        withdrawal.Timestamp = parseInt(Date.now() / 1000);
        withdrawal.save()
            .then(function(savedWithdrawal){
                logger.log('info', savedWithdrawal._id + " successfully saved");
                res.status(200).json({
                    "requestId": savedWithdrawal._id,
                    "withdrawalAddress": savedWithdrawal.WithdrawalAddress,
                    "amount": savedWithdrawal.Amount
                });
            })
            .catch(function(error){
                logger.log('error', "error saving btcWithdrawal", {"message": error});
                res.status(400).json({
                    "success": false,
                    "message": "withdrawal could not be processed"
                });
            })
    }

};

module.exports = new Controller();