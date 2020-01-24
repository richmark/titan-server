/**
 * Titan Ecommerce (Server)
 * routes/bundles.js
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 01/12/2020
 * @version 1.0
 */

const oExpress = require("express");
const oRouter = oExpress.Router();

const { requireSignin, checkAuth, checkAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const { uploadImage } = require("../middlewares/handleBundleImage");
const { createBundle, listBundles, bundleById, getBundleById, updateBundle } = require("../controllers/bundles");

oRouter.post(
    "/bundle/create/:userId",
    requireSignin,
    checkAuth,
    checkAdmin,
    uploadImage,
    createBundle
);

oRouter.put(
    "/bundle/update/:userId/:bundleId",
    requireSignin,
    checkAuth,
    checkAdmin,
    uploadImage,
    updateBundle
);

oRouter.get(
    "/bundles/:userId",
    requireSignin,
    checkAuth,
    checkAdmin,
    listBundles
);

oRouter.get(
    "/bundles/:userId/:bundleId",
    requireSignin,
    checkAuth,
    checkAdmin,
    getBundleById
);

oRouter.param("userId", userById);
oRouter.param("bundleId", bundleById);

module.exports = oRouter;