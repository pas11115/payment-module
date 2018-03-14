var express = require('express');
var router = express.Router();
var auth = require('./middleware/auth');
var withdrawalController = require('./controllers/withdrawalController');

router.use(auth.auth);

// router.post('/withdraw/btc', withdrawalController.btcWithdraw);
router.post('/withdraw/eth', withdrawalController.ethWithdraw);
// router.post('/withdraw/mcap', withdrawalController.mcapWithdraw);


module.exports = router;

