/**
 * Titan Ecommerce (Server)
 * routes/banner.js
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 02/10/2020 7:26 PM
 * @version 1.0
 */

const oExpress = require("express");
const oRouter = oExpress.Router();

const { requireSignin, checkAuth, checkAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const { uploadImage } = require("../middlewares/handleBannerImage");
const { createBanner, listBanners, updateBanner, bannerById, getBannerById, deleteBanner } = require("../controllers/banner");

oRouter.post(
    "/banner/create/:userId",
    requireSignin,
    checkAuth,
    checkAdmin,
    uploadImage,
    createBanner
);

oRouter.put(
    "/banner/update/:userId/:bannerId",
    requireSignin,
    checkAuth,
    checkAdmin,
    uploadImage,
    updateBanner
);

oRouter.delete(
    "/banner/delete/:userId",
    requireSignin,
    checkAuth,
    checkAdmin,
    deleteBanner
);

/**
 * endpoint for public
 */
oRouter.get('/banners', listBanners);

/**
 * endpoint for admin
 */
oRouter.get('/banners/:userId', requireSignin, checkAuth, checkAdmin, listBanners);
oRouter.get('/banners/:userId/:bannerId', requireSignin, checkAuth, checkAdmin, getBannerById);

oRouter.param("userId", userById);
oRouter.param("bannerId", bannerById);

module.exports = oRouter;