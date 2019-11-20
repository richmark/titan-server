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

/**
 * productById middleware
 * this functions checks if the product id exists before proceeding to the next function
 */
exports.productById = (oRequest, oResponse, oNext, sId) => {
  oProductModel.findById(sId).exec((oError, oProduct) => {
    if (oError || !oProduct) {
      oResponse.status(400).json({
        error: "Product not found"
      });
    }
    oRequest.product = oProduct;
    oNext();
  });
};

/**
 * getProductById function
 * gets a product with a particular product id
 */
exports.getProductById = (oRequest, oResponse) => {
  return oResponse.json(oRequest.product);
};

/**
 * listBySearch function
 * this function accepts filters for product searching
 */
exports.listBySearch = (oRequest, oResponse) => {
  let order = oRequest.body.order ? oRequest.body.order : "desc";
  let sortBy = oRequest.body.sortBy ? oRequest.body.sortBy : "_id";
  let limit = oRequest.body.limit ? parseInt(oRequest.body.limit) : 100;
  let skip = parseInt(oRequest.body.skip);
  let findArgs = {};

  for (let key in oRequest.body.filters) {
    if (oRequest.body.filters[key].length > 0) {
      if (key === "price") {
        findArgs[key] = {
          $gte: oRequest.body.filters[key][0],
          $lte: oRequest.body.filters[key][1]
        };
      } else {
        findArgs[key] = oRequest.body.filters[key];
      }
    }
  }

  oProductModel
    .find(findArgs)
    .select()
    .populate("category")
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec((err, data) => {
      if (err) {
        return oResponse.status(400).json({
          error: "Products not found"
        });
      }
      oResponse.json({
        size: data.length,
        data
      });
    });
};
