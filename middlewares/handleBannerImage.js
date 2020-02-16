/**
 * Titan Ecommerce (Server)
 * middlewares/handleBannerImage.js
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 02/10/2020 7:26 PM
 * @version 1.0
 */

const oMulter = require("multer");

const oStorage = oMulter.diskStorage({
    destination: (oRequest, oFile, oCallback) => {
        oCallback(null, "public/images/banners");
    },
    filename: (oRequest, oFile, oCallback) => {
        const sExtension = oFile.mimetype.split("/")[1];
        const sId = oRequest.banner === undefined ? `banner-${oRequest.profile._id}-${Date.now()}.${sExtension}` : oRequest.banner.banner_image;
        oCallback(null, sId);
    }
});

const oFilter = (oRequest, oFile, oCallback) => {
    if (oFile.mimetype.startsWith("image")) {
        oCallback(null, true);
    } else {
        oCallback("Not an image!", false);
    }
};

const oUpload = oMulter({
    storage: oStorage,
    fileFilter: oFilter
});

exports.uploadImage = oUpload.fields([{ name: "banner_image" }]);