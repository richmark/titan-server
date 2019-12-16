const oExpress = require('express');
const oRouter = oExpress.Router();
const { requireSignin, checkAuth } = require('../controllers/auth');
const { userById } = require('../controllers/user');
const { generateToken, processPayment } = require('../controllers/braintree');

oRouter.get('/braintree/getToken/:userId', requireSignin, checkAuth, generateToken);
oRouter.post('/braintree/payment/:userId', requireSignin, checkAuth, processPayment);

oRouter.param('userId', userById);

module.exports = oRouter;
