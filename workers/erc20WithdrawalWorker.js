var cron = require('node-cron');
var config = require('../config');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var bluebird = require('bluebird');
var Withdrawal = require('../models/erc20Withdrawal');
var Payment = require('../modules/payment/payment');
var logger = require('../modules/api/v1/helpers/log');

var updateWithdrawalStatus = function(request, tx){
    return new bluebird.Promise(function(resolve, reject){
        Withdrawal.findOneAndUpdate(
            {_id: request._id},
            {$set: {WithdrawalSuccess: true, Extra: tx, Hash: tx.hash}}
        )
            .then(function(updatedReq){
                logger.log('info', updatedReq._id + " successfully updated");
                resolve(updatedReq)
            })
            .catch(function(error){
                reject(error)
            })
    })
};

var processWithdrawal = function(withdrawalRequests){
    withdrawalRequests.forEach(function(request){
        //todo : confirm the request before payment
        Payment.erc20Payment(request.Amount, request.WalletKey, request.WalletAddress, request.WithdrawalAddress, request.ContractAddress, request.Decimal)
            .then(function(transaction){
                updateWithdrawalStatus(request, transaction)
            })
            .catch(function(error){
                console.log(error)
            })
    })
};

(function ethWithdrawal(){
    mongoose.connect(config.db, function(err) {
        if (err) {
            console.log("Mongodb connection error : " + err)
        } else {
            console.log("database connected");
            cron.schedule('*/1 * * * *', function(){
                Withdrawal.find({
                    // Currency: "MCAP",
                    WithdrawalSuccess: false
                }).
                limit(1).
                sort({ Timestamp: 1 })
                    .then(function(withdrawalRequests){
                        console.log(withdrawalRequests);
                        processWithdrawal(withdrawalRequests)
                    })
            });
        }
    });

}());