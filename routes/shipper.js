/**
 * Titan Ecommerce (Server)
 * routes/shipper.js
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 12/06/2019
 * @version 1.0
 */

const oExpress = require("express");
const oRouter = oExpress.Router();

const { requireSignin, checkAuth, checkAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const { createShipper } = require("../controllers/shipper");

oRouter.post("/shipper/create/:userId", requireSignin, checkAuth, checkAdmin, createShipper);

oRouter.param("userId", userById);

module.exports = oRouter;