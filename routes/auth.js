/**
 * Titan Ecommerce (Server)
 * routes/auth.js
 * @author Carlo Barcena <cbarcena20@gmail.com>
 * @author Jon Aguilar <jjaguilar08@gmailcom>
 * @date 11/12/2019 8:21 PM
 * @version 1.0
 */

const oExpress = require("express");
const oRouter = oExpress.Router();

const { uploadImage } = require("../middlewares/handleUserImage");

const {
  registerUser,
  forgotPassword,
  resetPassword,
  confirmUser,
  userSignin,
  userSignout
} = require("../controllers/auth");

oRouter.post("/register", uploadImage, registerUser);
oRouter.post("/signin", userSignin);
oRouter.get("/signout", userSignout);
oRouter.get("/confirmation/:tokenId", confirmUser);
oRouter.post("/forgot", forgotPassword);
oRouter.patch("/reset/:tokenId", resetPassword);

module.exports = oRouter;
