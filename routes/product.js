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
  listByCategory,
  productSearch,
  listProductsClient,
  listRelatedClient,
  productSearchClient,
  listByCategoryClient
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
  "/product/delete/:userId",
  requireSignin,
  checkAuth,
  checkAdmin,
  deleteProduct
); // ONGOING

oRouter.post("/product/search", productSearch);
oRouter.get("/products", listProducts);
oRouter.get("/products/count", countProducts);
oRouter.get("/product/:productId", getProductById);
oRouter.post("/products/by/search", listBySearch);
oRouter.get("/products/related/:productId", listRelated);
oRouter.get("/products/categories", listCategories);
oRouter.get("/products/category/:categoryId", listByCategory);

/**
 * For Script Automation
 */
oRouter.post(
  "/automate/product/create/:userId",
  requireSignin,
  checkAuth,
  checkAdmin,
  registerProduct
);

// Client Side Route
oRouter.get("/products/client/:productId", listRelatedClient);
oRouter.get("/products/client", listProductsClient);
oRouter.post("/product/client/search", productSearchClient);
oRouter.get("/products/client/category/:categoryId", listByCategoryClient);

oRouter.param("userId", userById);
oRouter.param("productId", productById);
oRouter.param("categoryId", categoryById);


module.exports = oRouter;
