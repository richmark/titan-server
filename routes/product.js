const oExpress = require("express");
const oRouter = oExpress.Router();

const { requireSignin, checkAuth, checkAdmin } = require("../controllers/auth");
const { registerProduct, listProducts } = require("../controllers/product");
const { userById } = require("../controllers/user");

oRouter.post(
  "/product/create/:userId",
  requireSignin,
  checkAuth,
  checkAdmin,
  registerProduct
);

oRouter.get("/products", listProducts);

oRouter.param("userId", userById);

module.exports = oRouter;
