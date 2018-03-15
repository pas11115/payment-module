var mongoose = require('mongoose');
var uuid = require('uuid/v4');

var ethErc20AccountSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuid
    },
    Address: {
        type: String,
        required: true
    },
    Nonce: {
        type: Number,
        required: true,
        default: 0
    }
});


module.exports = mongoose.model('ethErc20Account', ethErc20AccountSchema);