var cron = require('node-cron');
var config = require('../config');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var bluebird = require('bluebird');
var Withdrawal = require('../models/withdrawal');
var Payment = require('../modules/payment/payment');
var logger = require('../modules/api/v1/helpers/log');
var async = require('async');

var updateWithdrawalStatus = function(request, tx){
    return new bluebird.Promise(function(resolve, reject){
        mongoose.model('Withdrawal').findOneAndUpdate(
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

var processSingleRequest = function(request){
    return new bluebird.Promise(function(resolve, reject){
        Payment.ethPayment(request.Amount, request.WalletKey, request.WithdrawalAddress)
            .then(function(transaction){
                updateWithdrawalStatus(request, transaction)
            })
            .then(function(data){
                resolve(true)
            })
            .catch(function(error){
                console.log(error);
                reject(error)
            })
    })
};

var processWithdrawal = function(withdrawalRequests){
    async.eachSeries(withdrawalRequests, function(request, cb){
        processSingleRequest(request)
            .then(function(success){
                console.log(success);
                cb();
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
                    Currency: "ETH",
                    WithdrawalSuccess: false
                }).
                limit(5).
                sort({ Timestamp: 1 })
                    .then(function(withdrawalRequests){
                        console.log(withdrawalRequests);
                        processWithdrawal(withdrawalRequests)
                    })
            });
        }
    });

}());