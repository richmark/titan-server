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
const { createBundle, listBundles, bundleById, getBundleById, updateBundle, deleteBundle, listRelatedBundles, listClientBundle } = require("../controllers/bundles");

// client
oRouter.get("/bundles/client/related/:bundleId", listRelatedBundles);
oRouter.get("/bundles/client/:bundleId", getBundleById);
oRouter.get("/bundles/client", listClientBundle);

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

oRouter.delete(
    '/bundles/delete/:userId',
    requireSignin,
    checkAuth,
    checkAdmin,
    deleteBundle
)

oRouter.param("userId", userById);
oRouter.param("bundleId", bundleById);

module.exports = oRouter;