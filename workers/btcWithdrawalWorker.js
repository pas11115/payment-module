var cron = require('node-cron');
var config = require('../config');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var bluebird = require('bluebird');
var Withdrawal = require('../models/withdrawal');
var Payment = require('../modules/payment/payment');
var BitcoinUtils = require('./../modules/payment/utils/bitcoinUtils');

var updateWithdrawalStatus = function(request, tx){
    return new bluebird.Promise(function(resolve, reject){
        Withdrawal.findOneAndUpdate(
            {_id: request._id},
            {$set: {WithdrawalSuccess: true, Extra: tx}}
        )
            .then(function(updatedReq){
                resolve(updatedReq)
            })
            .catch(function(error){
                reject(error)
            })
    })
};

var processWithdrawal = function(withdrawalRequests){
    withdrawalRequests.forEach(function(request){
        BitcoinUtils.getBTCBalance(request.WalletAddress)
            .then(function(response){
                if(parseFloat(response.balanceSat) > parseFloat(request.Amount)){
                    return Payment.btcPayment(parseInt(parseFloat(request.Amount)), request.WalletKey, request.WalletAddress, request.WithdrawalAddress)
                }
                else{
                    throw new Error("balance unavailable")
                }
            })
            .then(function(tx){
                updateWithdrawalStatus(request, tx)
            })
            .catch(function(error){
                console.log(error)
            })
    })
};

(function btcWithdrawal(){
    mongoose.connect(config.db, function(err) {
        if (err) {
            console.log("Mongodb connection error : " + err)
        } else {
            console.log("database connected");
            cron.schedule('*/1 * * * *', function(){
                Withdrawal.find({
                    Currency: "BTC",
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