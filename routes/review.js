/**
 * Titan Ecommerce (Server)
 * routes/review.js
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 12/30/2019
 * @version 1.0
 */

const oExpress = require("express");
const oRouter = oExpress.Router();

const { requireSignin, checkAuth, checkAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const { productById } = require("../controllers/product");
const { orderById } = require("../controllers/order");
const {
  listReviews,
  checkReview,
  reviewById,
  updateReview
} = require("../controllers/review");

oRouter.post(
  "/review/create/:userId/:productId/:orderId",
  requireSignin,
  checkAuth,
  checkReview
);

oRouter.put(
  "/review/:reviewId/:userId",
  requireSignin,
  checkAuth,
  checkAdmin,
  updateReview
);

oRouter.get('/reviews/product/:productId', listReviews);
oRouter.get('/reviews/:userId', requireSignin, checkAuth, checkAdmin, listReviews);

oRouter.param("userId", userById);
oRouter.param("productId", productById);
oRouter.param("orderId", orderById);
oRouter.param("reviewId", reviewById);

module.exports = oRouter;
