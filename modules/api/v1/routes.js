var express = require('express');
var router = express.Router();
var auth = require('./middleware/auth');
var withdrawalController = require('./controllers/withdrawalController');
var keyController = require('./controllers/keyController');

router.use(auth.auth);

//TODO: add currencies -> bitcoinCash, ethClassic
router.post('/withdraw', withdrawalController.Withdraw);

//TODO: add status of payment
// router.get('/status/:id', withdrawalController.Status);


module.exports = router;

