var express = require('express');
var router = express.Router();
var auth = require('./middleware/auth');
var withdrawalController = require('./controllers/withdrawalController');
var keyController = require('./controllers/keyController');

router.use(auth.auth);

// router.post('/withdraw/btc', withdrawalController.btcWithdraw);
// router.post('/withdraw/ltc', withdrawalController.ltcWithdraw);
// router.post('/withdraw/eth', withdrawalController.ethWithdraw);
// router.post('/withdraw/erc20', withdrawalController.erc20Withdraw);
router.post('/withdraw', withdrawalController.Withdraw);
// router.get('/status/:id', withdrawalController.Status);
/* todo add currencies -> bitcoinCash, ethClassic */
router.post('/set', keyController.set);
router.get('/get', keyController.get);


module.exports = router;

