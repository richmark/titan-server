const oExpress = require("express");
const oRouter = oExpress.Router();

const { requireSignin, checkAuth, checkAdmin } = require("../controllers/auth");
const {
  registerProduct,
  listProducts,
  getProductById,
  productById,
  listBySearch,
  listRelated,
  listCategories,
  updateProduct,
  deleteProduct,
  countProducts,
  listByCategory
} = require("../controllers/product");
const { userById } = require("../controllers/user");
const { categoryById } = require("../controllers/category");
const { uploadImage } = require("../middlewares/handleProductImage");

oRouter.post(
  "/product/create/:userId",
  requireSignin,
  checkAuth,
  checkAdmin,
  uploadImage,
  registerProduct
);

oRouter.put(
  "/product/:productId/:userId",
  requireSignin,
  checkAuth,
  checkAdmin,
  uploadImage,
  updateProduct
);

oRouter.delete(
  "/product/:productId/:userId",
  requireSignin,
  checkAuth,
  checkAdmin,
  deleteProduct
); // ONGOING

oRouter.get("/products", listProducts);
oRouter.get("/products/count", countProducts);
oRouter.get("/product/:productId", getProductById);
oRouter.post("/products/by/search", listBySearch);
oRouter.get("/products/related/:productId", listRelated);
oRouter.get("/products/categories", listCategories);
oRouter.get("/products/category/:categoryId", listByCategory);

oRouter.param("userId", userById);
oRouter.param("productId", productById);
oRouter.param("categoryId", categoryById);

module.exports = oRouter;
