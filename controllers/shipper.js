/**
 * Titan Ecommerce (Server)
 * controllers/product.js
 * @author Jon Aguilar <jjaguilar08@gmail.com>
 * @date 11/18/2019
 * @version 1.0
 */

const oShipperModel = require("../models/shipper");
const oFormidable = require("formidable");
const { errorHandler } = require("../helpers/dbErrorHandler");

/**
 * registerProduct function
 * this function registers products in DB
 */
exports.registerProduct = (oRequest, oResponse) => {
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