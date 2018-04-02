var ursa = require('ursa');
var config = require('./../../../config');

function CryptoUtils() {}

CryptoUtils.prototype.decrypt = function(data){
    try{
        msg = ursa.createPrivateKey(config.testKey).decrypt(data, 'hex', 'utf8', ursa.RSA_PKCS1_PADDING);
        console.log(msg);
        return msg
    }
    catch (err){
        return false
    }
};

module.exports = new CryptoUtils();