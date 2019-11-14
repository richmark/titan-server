/**
 * Titan Ecommerce (Server)
 * routes/auth.js
 * @author Carlo Barcena <cbarcena20@gmail.com>
 * @date 11/12/2019 8:21 PM
 * @version 1.0
 */

const oExpress = require("express");
const oRouter = oExpress.Router();

const { registerUser, signin } = require("../controllers/auth");

oRouter.post("/register", registerUser);
oRouter.post("/signin", signin);

module.exports = oRouter;
