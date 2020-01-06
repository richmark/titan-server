const oExpress = require('express');
const oRouter = oExpress.Router();
const { requireSignin, checkAuth } = require('../controllers/auth');
const { userById } = require('../controllers/user');
const { initiateCheckout } = require('../controllers/paymaya');

oRouter.get('/paymaya/initiateCheckout', initiateCheckout);

oRouter.param('userId', userById);

module.exports = oRouter;
