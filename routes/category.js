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
  createCategory,
  categoryById,
  getCategory
} = require("../controllers/category");

oRouter.post(
  "/category/create/:userId",
  requireSignin,
  checkAuth,
  checkAdmin,
  createCategory
);

oRouter.get("/category/:categoryId", getCategory);

oRouter.param("userId", userById);
oRouter.param("categoryId", categoryById);

module.exports = oRouter;
