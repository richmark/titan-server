/**
 * Titan Ecommerce (Server)
 * routes/sidebanner.js
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 08/07/2020 7:52 PM
 * @version 1.0
 */

const oExpress = require("express");
const oRouter = oExpress.Router();

const { requireSignin, checkAuth, checkAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const { uploadImage } = require("../middlewares/handleSideBannerImage");
const { createSideBanner, listSideBanners, updateSideBanner, sidebannerById, getSideBannerById, deleteSideBanner, listSideBannersByVisibility } = require("../controllers/sidebanner");

oRouter.post(
    "/sidebanner/create/:userId",
    requireSignin,
    checkAuth,
    checkAdmin,
    uploadImage,
    createSideBanner
);

oRouter.put(
    "/sidebanner/update/:userId/:sidebannerId",
    requireSignin,
    checkAuth,
    checkAdmin,
    uploadImage,
    updateSideBanner
);

oRouter.delete(
    "/sidebanner/delete/:userId",
    requireSignin,
    checkAuth,
    checkAdmin,
    deleteSideBanner
);

/**
 * For Script Automation (ADD SIDEBANNERS)
 */
oRouter.post(
    "/automate/sidebanner/create/:userId",
    requireSignin,
    checkAuth,
    checkAdmin,
    createSideBanner
);

/**
 * endpoint for public
 */
oRouter.get('/sidebanners', listSideBannersByVisibility);

/**
 * endpoint for admin
 */
oRouter.get('/sidebanners/:userId', requireSignin, checkAuth, checkAdmin, listSideBanners);
oRouter.get('/sidebanners/:userId/:sidebannerId', requireSignin, checkAuth, checkAdmin, getSideBannerById);

oRouter.param("userId", userById);
oRouter.param("sidebannerId", sidebannerById);

module.exports = oRouter;