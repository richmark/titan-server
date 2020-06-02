/**
 * Titan Ecommerce (Server)
 * routes/order.js
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @author Carlo Barcena <cbarcena20@gmail.com>
 * @date 12/07/2019
 * @version 1.0
 */

const oExpress = require("express");
const oRouter = oExpress.Router();

const { requireSignin, checkAuth, checkAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const {
    createOrder,
    listOrders,
    orderById,
    getOrderById,
    updateOrderById,
    getOrderByUser,
    getOrderSettings,
    createOrderSettings,
    updateOrderSettings,
    settingById,
    customerById,
    getOrderProductsByUser
} = require("../controllers/order");

oRouter.get("/orders/:userId", requireSignin, checkAuth, listOrders);
oRouter.get("/orders/lists/:userId", requireSignin, checkAuth, getOrderByUser);
oRouter.get("/orders/products/:userId/:customerId", requireSignin, checkAuth, getOrderProductsByUser);
oRouter.get("/orders/:userId/:orderId", requireSignin, checkAuth, getOrderById);
oRouter.put("/orders/:userId/:orderId", requireSignin, checkAuth, checkAdmin, updateOrderById);
oRouter.post("/order/create/:userId", requireSignin, checkAuth, createOrder);

/**
 * Order Details Settings
 * Delivery Fee Setting
 */
oRouter.get("/settings", getOrderSettings);
oRouter.post("/settings/:userId", requireSignin, checkAuth, createOrderSettings);
oRouter.put("/settings/:userId/:settingId", requireSignin, checkAuth, updateOrderSettings);

oRouter.param("userId", userById);
oRouter.param("orderId", orderById);
oRouter.param("settingId", settingById);
oRouter.param("customerId", customerById);

module.exports = oRouter;