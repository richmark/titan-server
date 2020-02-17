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
const { uploadImage } = require("../middlewares/handleUserImage");
const {
  userById,
  updateUser,
  getUser,
  updateUserPassword,
  checkUserPassword,
  getAllWholesalers,
  getAllSubadmins,
  wholesalerById,
  getWholesaler,
  updateWholesaler,
  deleteUser
} = require("../controllers/user");

/**
 * TODO: add proper middlewares
 */
oRouter.get(
  "/users/:userId/wholesaler/:wholesalerId",
  requireSignin,
  checkAuth,
  checkAdmin,
  getWholesaler
);
oRouter.put(
  "/users/:userId/wholesaler/:wholesalerId",
  requireSignin,
  checkAuth,
  checkAdmin,
  updateWholesaler
);
oRouter.get(
  "/users/:userId",
  requireSignin,
  checkAuth,
  checkAdmin,
  getAllWholesalers
);
oRouter.get(
  "/users/subadmins/:userId",
  requireSignin,
  checkAuth,
  checkAdmin,
  getAllSubadmins
);

oRouter.get("/user/:userId", requireSignin, checkAuth, getUser);
oRouter.put(
  "/user/password/:userId",
  requireSignin,
  checkAuth,
  updateUserPassword
);
oRouter.put("/user/:userId", requireSignin, uploadImage, updateUser);
oRouter.param("userId", userById);
oRouter.param("wholesalerId", wholesalerById);

oRouter.delete("/user/:userId", requireSignin, deleteUser);

module.exports = oRouter;
