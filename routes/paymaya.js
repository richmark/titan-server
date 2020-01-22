const oExpress = require('express');
const oRouter = oExpress.Router();
const { requireSignin, checkAuth } = require('../controllers/auth');
const { userById } = require('../controllers/user');
const { initiateCheckout, retrieveCheckout } = require('../controllers/paymaya');

oRouter.post('/paymaya/initiateCheckout/:userId', initiateCheckout);
oRouter.post('/paymaya/retrieveCheckout/:userId', retrieveCheckout);

oRouter.param('userId', userById);

module.exports = oRouter;
