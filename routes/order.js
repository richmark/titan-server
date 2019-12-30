/**
 * Titan Ecommerce (Server)
 * routes/order.js
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 12/07/2019
 * @version 1.0
 */

const oExpress = require("express");
const oRouter = oExpress.Router();

const { requireSignin, checkAuth, checkAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const { createOrder, listOrders, orderById, getOrderById, updateOrderById, getOrderByUser } = require("../controllers/order");

oRouter.get("/orders/:userId", requireSignin, checkAuth, listOrders);
oRouter.get("/orders/lists/:userId", requireSignin, checkAuth, getOrderByUser);
oRouter.get("/orders/:userId/:orderId", requireSignin, checkAuth, getOrderById);
oRouter.put("/orders/:userId/:orderId", requireSignin, checkAuth, checkAdmin, updateOrderById);
oRouter.post("/order/create/:userId", requireSignin, checkAuth, createOrder);

oRouter.param("userId", userById);
oRouter.param("orderId", orderById);

module.exports = oRouter;