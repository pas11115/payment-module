var cron = require('node-cron');
var config = require('../config');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var bluebird = require('bluebird');
var Withdrawal = require('../models/withdrawal');
var Erc20Withdrawal = require('../models/erc20Withdrawal');
var rp = require('request-promise');

var hitWebHook = function(invoice){
    return new bluebird.Promise(function(resolve, reject){
        reqBody = {
            "amount": invoice.AmountReceived,
            "status": invoice.Status,
            "paymentId": invoice._id
        };
        options = {
            url: invoice.NotifyUrl,
            method: "POST",
            json: true,
            body: reqBody
        };
        rp(options)
            .then(function(body){
                console.log(body);
                resolve(true)
            })
            .catch(function(error){
                resolve(false);
            })

    })
};

var updateWithdrawalStatus = function(request, tx){
    return new bluebird.Promise(function(resolve, reject){
        Withdrawal.findOneAndUpdate(
            {_id: request._id},
            {$set: {WithdrawalSuccess: true, Hash: tx}}
        )
            .then(function(updatedReq){
                resolve(updatedReq)
            })
            .catch(function(error){
                reject(error)
            })
    })
};

var processWebhook = function(requests){
    var reqBody = [];
    requests.forEach(function(request){
        var temp = {
            requestId: request._id,
            txHash: request.Hash
        };
        reqBody.push(temp);
    });
    console.log(reqBody);
    return new bluebird.Promise(function(resolve, reject){
        options = {
            url: config.webhookUrl,
            method: "POST",
            headers: {
                "Api_Token": config.webhookApiKey
            },
            json: true,
            body: reqBody
        };
        rp(options)
            .then(function(body){
                console.log(body);
                resolve(true)
            })
            .catch(function(error){
                console.log(error);
                resolve(false);
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
                    // WebhookSuccess: false,
                    WithdrawalSuccess: true
                },{
                    _id: 1,
                    Hash: 1
                }).
                limit(5).
                sort({ Timestamp: 1 })
                    .then(function(requests){
                        console.log(requests);
                        processWebhook(requests)
                    })
            });
        }
    });

}());