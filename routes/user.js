
/**
 * Titan Ecommerce (Server)
 * routes/user.js
 * @author Jon Aguilar <jjaguilar08@gmail.com>
 * @author Carlo Barcena <cbarcena20@gmail.com>
 * @date 11/18/2019
 * @version 1.0
 */

const oExpress = require("express");
const oRouter = oExpress.Router();

const { requireSignin, checkAuth, checkAdmin } = require("../controllers/auth");
const { uploadImage } = require('../middlewares/handleUserImage');
const { userById, updateUser } = require("../controllers/user");

oRouter.put('/updateUser/:userId', uploadImage, updateUser);
oRouter.param("userId", userById);

module.exports = oRouter;
