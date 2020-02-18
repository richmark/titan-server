/**
 * Titan Ecommerce (Server)
 * middlewares/handleCategoryImage.js
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 12/2/2019 8:52 PM
 * @version 1.0
 */

const oMulter = require("multer");
const oUuidv1 = require("uuid/v1");

const oStorage = oMulter.diskStorage({
  destination: (oRequest, oFile, oCallback) => {
    oCallback(null, "public/images/categories");
  },
  filename: (oRequest, oFile, oCallback) => {
    const sExtension = oFile.mimetype.split("/")[1];
    const sId = oRequest.category === undefined ? `category-${oRequest.profile._id}-${Date.now()}.${sExtension}` : oRequest.category.category_image;
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

exports.uploadImage = oUpload.fields([{ name: "category_image" }]);

exports.createFileArray = (oRequest, oResponse, oNext) => {
  oRequest.file = [];
  oNext();
};
