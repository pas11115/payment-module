var config = require('./../../../../config');
function Controller() {}

Controller.prototype.get = function(req, res){
    res.status(200).json({
        "success": true,
        "key": config.testKey
    });
};

Controller.prototype.set = function(req, res) {
    if(!req.files){
        res.status(400).json({
            "success": false,
            "message": "file not provided"
        });
    }
    else{
        var key = req.files.key;
        config.testKey = key;
        res.status(200).json({
            "success": true,
            "key": config.testKey
        });
        // key.mv('./uploads/key.pem', function(err){
        //     if(err){
        //         res.status(400).json({
        //             "success": false,
        //             "message": err
        //         });
        //     }
        //     else{
        //         res.status(200).json({
        //             "success": true
        //         });
        //     }
        // });
    }
};

module.exports = new Controller();