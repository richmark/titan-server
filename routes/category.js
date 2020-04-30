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
const { uploadImage } = require("../middlewares/handleCategoryImage");
const {
  createCategory,
  categoryById,
  getCategory,
  deleteCategory,
  updateCategory,
  listCategory
} = require("../controllers/category");

oRouter.post(
  "/category/create/:userId",
  requireSignin,
  checkAuth,
  checkAdmin,
  uploadImage,
  createCategory
);

oRouter.delete(
  "/category/delete/:userId",
  requireSignin,
  checkAuth,
  checkAdmin,
  deleteCategory
);

oRouter.put(
  "/category/:categoryId/:userId",
  requireSignin,
  checkAuth,
  checkAdmin,
  uploadImage,
  updateCategory
);

oRouter.get("/category", listCategory);
oRouter.get("/category/:categoryId", getCategory);

/**
 * For script automation
 */
oRouter.post(
  "/automate/category/create/:userId",
  requireSignin,
  checkAuth,
  checkAdmin,
  createCategory
);

oRouter.param("userId", userById);
oRouter.param("categoryId", categoryById);

module.exports = oRouter;
