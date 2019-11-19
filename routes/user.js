/**
 * Titan Ecommerce (Server)
 * routes/user.js
 * @author Carlo Barcena <cbarcena20@gmail.com>
 * @date 11/19/2019 6:21 AM
 * @version 1.0
 */

const oExpress = require('express');
const oRouter = oExpress.Router();

const { uploadImage } = require('../middlewares/handleUserImage');
const { userById , updateUser } = require('../controllers/user');

oRouter.put('/updateUser/:userId', uploadImage, updateUser);

oRouter.param('userId', userById);

module.exports = oRouter;