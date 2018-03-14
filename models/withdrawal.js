var mongoose = require('mongoose');
var uuid = require('uuid/v4');

var WithdrawalSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuid
    },
    Currency: {
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
    WithdrawalConfirmation: {
        type: Boolean,
        default: false
    },
    Extra: []
});


module.exports = mongoose.model('Withdrawal', WithdrawalSchema);