/**
 * Titan Ecommerce (Server)
 * middlewares/handleUserImage.js
 * @author Jon Aguilar <jjaguilar08@gmail.com>
 * @date 11/14/2019 8:19 PM
 * @version 1.0
 */

const oMulter = require("multer");
const oUuidv1 = require("uuid/v1");

const oStorage = oMulter.diskStorage({
  destination: (oRequest, oFile, oCallback) => {
    oCallback(null, "public/images/products");
  },
  filename: (oRequest, oFile, oCallback) => {
    console.log(oFile);
    const sExtension = oFile.mimetype.split("/")[1];
    const sId = `product-${oRequest.profile._id}-${Date.now()}.${sExtension}`;
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

exports.uploadImage = oUpload.fields([{ name: "image" }]);

exports.createFileArray = (oRequest, oResponse, oNext) => {
  oRequest.file = [];
  oNext();
};
