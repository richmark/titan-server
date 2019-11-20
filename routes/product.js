const oExpress = require("express");
const oRouter = oExpress.Router();

const { requireSignin, checkAuth, checkAdmin } = require("../controllers/auth");
const {
  registerProduct,
  listProducts,
  getProductById,
  productById,
  listBySearch
} = require("../controllers/product");
const { userById } = require("../controllers/user");

oRouter.post(
  "/product/create/:userId",
  requireSignin,
  checkAuth,
  checkAdmin,
  registerProduct
);

oRouter.get("/products", listProducts);
oRouter.get("/product/:productId", getProductById);
oRouter.post("/products/by/search", listBySearch);

oRouter.param("userId", userById);
oRouter.param("productId", productById);

module.exports = oRouter;
