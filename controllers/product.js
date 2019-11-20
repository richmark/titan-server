/**
 * Titan Ecommerce (Server)
 * controllers/product.js
 * @author Jon Aguilar <jjaguilar08@gmail.com>
 * @date 11/18/2019
 * @version 1.0
 */

const oProductModel = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandler");

/**
 * registerProduct function
 * this function registers products in DB
 */
exports.registerProduct = (oRequest, oResponse) => {
  const oProduct = new oProductModel(oRequest.body);
  oProduct.save((oError, oData) => {
    if (oError) {
      return oResponse.status(400).json({
        error: errorHandler(oError)
      });
    }
    oResponse.json({ oData });
  });
};

/**
 * listProducts function
 * this function returns list of products
 * this function accepts query parameters (limit, sortBy, order, offset)
 */
exports.listProducts = (oRequest, oResponse) => {
  let sOrder = oRequest.query.order ? oRequest.query.order : "asc";
  let sSortBy = oRequest.query.sortBy ? oRequest.query.sortBy : "_id";
  let iLimit = oRequest.query.limit ? parseInt(oRequest.query.limit, 10) : 6;
  let iOffset = oRequest.query.offset ? parseInt(oRequest.query.offset, 10) : 0;

  oProductModel
    .find()
    .select()
    .populate("category")
    .sort([[sSortBy, sOrder]])
    .limit(iLimit)
    .skip(iOffset)
    .exec((oError, oData) => {
      if (oError) {
        return oResponse.status(400).json({
          error: "Products not found"
        });
      }
      oResponse.json(oData);
    });
};
