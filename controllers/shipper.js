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