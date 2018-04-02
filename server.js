var express = require('express');
var mongoose = require('mongoose');
var http = require('http');
var logger = require('morgan');
var bodyParser = require('body-parser');
var winston = require('winston');
mongoose.Promise = require('bluebird');
var config = require('./config');
var cors = require('cors');
var fileUpload = require('express-fileupload');
var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());

winston = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({'timestamp':true,'colorize': true})
    ]
});

mongoose.connect(config.db, function(err) {
    if (err) {
        winston.log('error', "Mongodb connection error", {"message": err})
    } else {
        winston.log('info', "database connected")
    }
});


app.use('/' + config.api , require('./modules/api/' + config.api + '/routes'));

var server = http.createServer(app);

server.listen(config.port, function (err) {
    if (err)
        winston.log('error', "Server error", {"message": err});
    else
        winston.log('info', 'server running at  ' + config.port);

});

