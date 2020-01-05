/**
 * Titan Ecommerce (Server)
 * middlewares/handleUserImage.js
 * @author Jon Aguilar <jjaguilar08@gmail.com>
 * @date 11/14/2019 8:19 PM
 * @version 1.0
 */

const oMulter = require("multer");
const oUuidv1 = require("uuid/v1");

this.setFileName = (oRequest, oFile, oCallback) => {
  const sExtension = oFile.mimetype.split("/")[1];
  let sId = '';
  if (oRequest.method === 'PUT' && oRequest.product !== undefined) {
    sId = oRequest.product.image;
    if (oFile.fieldname === 'additional_images') {
      sTemp = oRequest.product.additional_images[oRequest.iIndex];
      sId = sTemp === undefined ? `product-${oRequest.profile._id}-${Date.now()}-${oFile.fieldname}.${sExtension}` : sTemp;
      oRequest.iIndex++;
    }
    return oCallback(null, sId);
  }
  sId = `product-${oRequest.profile._id}-${Date.now() + oRequest.iIndex}-${oFile.fieldname}.${sExtension}`;
  oRequest.iIndex++;
  oCallback(null, sId);
};

const oStorage = oMulter.diskStorage({
  destination: (oRequest, oFile, oCallback) => {
    oCallback(null, "public/images/products");
  },
  filename: this.setFileName
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

exports.uploadImage = oUpload.fields([
  {name: 'image', maxCount: 1 },
  {name: 'additional_images', maxCount: 4}
]);

exports.createFileArray = (oRequest, oResponse, oNext) => {
  oRequest.file = [];
  oNext();
};
