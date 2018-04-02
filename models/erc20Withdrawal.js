var mongoose = require('mongoose');
var uuid = require('uuid/v4');

var erc20WithdrawalSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuid
    },
    Currency: {
        type: String,
        required: true
    },
    Decimal: {
        type: Number,
        required: true
    },
    ContractAddress: {
        type: String,
        required: true
    },
    Amount: {
        type: String,
        required: true
    },
    Timestamp: Number,
    WalletAddress: {
        type: String,
        required: true
    },
    WalletKey: {
        type: String,
        required: true
    },
    WithdrawalAddress: {
        type: String,
        required: true
    },
    WithdrawalSuccess: {
        type: Boolean,
        default: false
    },
    WebhookSuccess: {
        type: Boolean,
        default: false
    },
    Hash: {
        type: String
    },
    Extra: []
});


module.exports = mongoose.model('erc20Withdrawal', erc20WithdrawalSchema);