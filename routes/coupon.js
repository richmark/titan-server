/**
 * Titan Ecommerce (Server)
 * routes/category.js
 * @author Jon Aguilar <jjaguilar08@gmail.com>
 * @date 11/18/2019
 * @version 1.0
 */

const oExpress = require("express");
const oRouter = oExpress.Router();

const { requireSignin, checkAuth, checkAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const {
  createCoupon,
  couponById,
  couponByCode,
  getCoupon,
  listCoupon,
  updateCoupon,
  deleteCoupon
} = require("../controllers/coupon");

oRouter.post(
  "/coupon/create/:userId",
  requireSignin,
  checkAuth,
  checkAdmin,
  createCoupon
);

oRouter.put(
  "/coupon/:couponId/:userId",
  requireSignin,
  checkAuth,
  checkAdmin,
  updateCoupon
);

oRouter.delete(
  "/coupon/:couponId/:userId",
  requireSignin,
  checkAuth,
  checkAdmin,
  deleteCoupon
);

oRouter.get("/coupon/code/:couponCode", getCoupon);
oRouter.get("/coupon/:couponId", getCoupon);
oRouter.get("/coupon", listCoupon);

oRouter.param("userId", userById);
oRouter.param("couponId", couponById);
oRouter.param("couponCode", couponByCode);

module.exports = oRouter;
