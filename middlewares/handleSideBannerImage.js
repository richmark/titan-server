/**
 * Titan Ecommerce (Server)
 * middlewares/handleSideBannerImage.js
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 08/07/2020 7:50 PM
 * @version 1.0
 */

const oMulter = require("multer");

const oStorage = oMulter.diskStorage({
    destination: (oRequest, oFile, oCallback) => {
        oCallback(null, "public/images/sidebanners");
    },
    filename: (oRequest, oFile, oCallback) => {
        const sExtension = oFile.mimetype.split("/")[1];
        const sId = oRequest.sidebanner === undefined ? `sidebanner-${oRequest.profile._id}-${Date.now()}.${sExtension}` : oRequest.sidebanner.side_banner_image;
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

exports.uploadImage = oUpload.fields([{ name: "side_banner_image" }]);