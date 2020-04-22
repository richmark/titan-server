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
  deleteUser,
  getAllUsers
} = require("../controllers/user");

/**
 * Get wholesaler by id
 */
oRouter.get(
  "/users/:userId/wholesaler/:wholesalerId",
  requireSignin,
  checkAuth,
  checkAdmin,
  getWholesaler
);

/**
 * Update wholesaler by id
 */
oRouter.put(
  "/users/:userId/wholesaler/:wholesalerId",
  requireSignin,
  checkAuth,
  checkAdmin,
  updateWholesaler
);

/**
 * Get all wholesalers (admin)
 */
oRouter.get(
  "/users/:userId",
  requireSignin,
  checkAuth,
  checkAdmin,
  getAllWholesalers
);

/**
 * Get all registered users with verified email (admin)
 */
oRouter.get(
  "/users/all/:userId",
  requireSignin,
  checkAuth,
  checkAdmin,
  getAllUsers
);

/**
 * Get all subadmins (admin)
 */
oRouter.get(
  "/users/subadmins/:userId",
  requireSignin,
  checkAuth,
  checkAdmin,
  getAllSubadmins
);

/**
 * Get User by Id
 */
oRouter.get("/user/:userId", requireSignin, checkAuth, getUser);

/**
 * Update User Password
 */
oRouter.put(
  "/user/password/:userId",
  requireSignin,
  checkAuth,
  updateUserPassword
);

/**
 * Update User Password with Image
 */
oRouter.put("/user/:userId", requireSignin, uploadImage, updateUser);

/**
 * User Id Middleware Checker
 */
oRouter.param("userId", userById);

/**
 * Wholesaler Middleware Checker
 */
oRouter.param("wholesalerId", wholesalerById);

/**
 * Delete User
 */
oRouter.delete("/user/:userId", requireSignin, deleteUser);


module.exports = oRouter;
