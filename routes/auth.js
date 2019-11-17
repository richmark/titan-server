/**
 * Titan Ecommerce (Server)
 * routes/auth.js
 * @author Carlo Barcena <cbarcena20@gmail.com>
 * @date 11/12/2019 8:21 PM
 * @version 1.0
 */

const oExpress = require('express');
const oRouter = oExpress.Router();

const {
	registerUser,
	forgotPassword,
	resetPassword,
	confirmUser
} = require('../controllers/auth');

oRouter.post('/register', registerUser);
oRouter.get('/confirmation/:tokenId', confirmUser);
oRouter.post('/forgot', forgotPassword);
oRouter.patch('/reset/:tokenId', resetPassword);

module.exports = oRouter;
