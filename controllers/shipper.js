/**
 * Titan Ecommerce (Server)
 * controllers/shipper.js
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 12/07/2019
 * @version 1.0
 */

const oShipperModel = require("../models/shipper");
const { errorHandler } = require("../helpers/dbErrorHandler");

/**
 * createShipper function
 * this function create shipper
 */
exports.createShipper = (oRequest, oResponse) => {
  const oShipper = new oShipperModel(oRequest.body);
  oShipper.save((oError, oData) => {
    if (oError) {
      return oResponse.status(400).json({
        error: errorHandler(oError)
      });
    }
    oResponse.json({ data: oData });
  });
};

/**
 * List Shippers
 */
exports.listShippers = (oRequest, oResponse) => {
  let sOrder = oRequest.query.order ? oRequest.query.order : "asc";
  let sSortBy = oRequest.query.sortBy ? oRequest.query.sortBy : "_id";
  let iLimit = oRequest.query.limit ? parseInt(oRequest.query.limit, 10) : 6;
  let iOffset = oRequest.query.offset ? parseInt(oRequest.query.offset, 10) : 0;

  oShipperModel
    .find()
    .select()
    .sort([[sSortBy, sOrder]])
    .limit(iLimit)
    .skip(iOffset)
    .exec((oError, oData) => {
      if (oError) {
        return oResponse.status(400).json({
          error: errorHandler(oError)
        });
      }
      oResponse.json({ data: oData });
    });
};

/**
 * Find Shipper By Id
 */
exports.shipperById = (oRequest, oResponse, oNext, sId) => {
  oShipperModel.findById(sId).exec((oError, oShipper) => {
    if (oError || !oShipper) {
      oResponse.status(400).json({
        error: "Shipper not found"
      });
    }
    oRequest.shipper = oShipper;
    oNext();
  });
};

/**
 * Get Shipper By Id
 * Basically returns found shipper in shipperById
 */
exports.getShipperById = (oRequest, oResponse) => {
  return oResponse.json({ data: oRequest.shipper });
}

/**
 * Update Shipper
 */
exports.updateShipper = (oRequest, oResponse) => {
  oShipperModel.findOneAndUpdate(
    { _id: oRequest.shipper._id },
    { $set: oRequest.body },
    { new: true },
    (oError, oData) => {
      if (oError) {
        return oResponse.status(400).json({
          error: errorHandler(oError)
        });
      }
      oResponse.json({ data: oData });
    }
  );
}
