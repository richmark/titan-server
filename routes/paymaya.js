const oExpress = require('express');
const oRouter = oExpress.Router();
const { requireSignin, checkAuth } = require('../controllers/auth');
const { userById } = require('../controllers/user');
const { initiateCheckout, retrieveCheckout, implementWebhook } = require('../controllers/paymaya');
const { checkProductStock } = require('../middlewares/handleProductStock');

oRouter.post('/paymaya/initiateCheckout/:userId', checkProductStock, initiateCheckout);
oRouter.post('/paymaya/retrieveCheckout/:userId', retrieveCheckout);

oRouter.post('/paymaya/checkout/success', implementWebhook);
oRouter.post('/paymaya/checkout/fail', implementWebhook);
oRouter.post('/paymaya/checkout/dropout', implementWebhook);

oRouter.param('userId', userById);

module.exports = oRouter;
