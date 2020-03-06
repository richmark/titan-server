/**
 * Titan Ecommerce (Server)
 * controllers/bundles.js
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 01/12/2020
 * @version 1.0
 */

const oBundleModel = require('../models/bundles');
const { errorHandler } = require('../helpers/dbErrorHandler');
const { _ } = require('lodash');
const oFileSystem = require("fs");

this.setRequestBodyImage = oRequest => {
  if (typeof oRequest.files !== "undefined") {
    Object.keys(oRequest.files).forEach(sKey => {
      oRequest.body[sKey] = oRequest.files[sKey][0].filename;
    });
  }
  return oRequest;
};

/**
 * createBundle function
 * this function create bundle
 */
exports.createBundle = (oRequest, oResponse) => {
  oRequest = this.setRequestBodyImage(oRequest);
  oRequest.body.products = JSON.parse(oRequest.body.products);
  const oBundle = new oBundleModel(oRequest.body);
  oBundle.save((oError, oData) => {
    if (oError) {
      return oResponse.status(400).json({
        error: errorHandler(oError)
      });
    }
    oResponse.json({ data: oData });
  });
};

/**
 * List Bundles
 */
exports.listBundles = (oRequest, oResponse) => {
  let sOrder = oRequest.query.order ? oRequest.query.order : "asc";
  let sSortBy = oRequest.query.sortBy ? oRequest.query.sortBy : "_id";
  let iLimit = oRequest.query.limit ? parseInt(oRequest.query.limit, 10) : 6;
  let iOffset = oRequest.query.offset ? parseInt(oRequest.query.offset, 10) : 0;

  oBundleModel
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
 * Get Bundle by id and returns populated product with selected fields only
 */
exports.bundleById = (oRequest, oResponse, oNext, sId) => {
  oBundleModel
  .findById(sId)
  .populate('products.product', '_id product_name price bundle_thumbnail ')
  .exec((oError, oBundleData) => {
    if (oError || !oBundleData) {
      return oResponse.status(400).json({
        error: "Bundle not found"
      });
    }
    oRequest.bundle = oBundleData;
    oNext();
  });
};

/**
 * returns the bundle return by bundleById function
 */
exports.getBundleById = (oRequest, oResponse) => {
  return oResponse.json({ data: oRequest.bundle });
}

/**
 * updateBundle function
 * this function update bundle
 */
exports.updateBundle = (oRequest, oResponse) => {
  oRequest = this.setRequestBodyImage(oRequest);
  oRequest.body.products = JSON.parse(oRequest.body.products);
  _.assignIn(oRequest.bundle, oRequest.body);
  oBundleModel.findOneAndUpdate(
    { _id: oRequest.bundle._id },
    { $set: oRequest.bundle },
    { new: true },
    (oError, oData) => {
      if (oError) {
        return oResponse.status(400).json({
          error: errorHandler(oError)
        });
      }
      oResponse.json({ data: oData, msg: 'Bundle updated successfully' });
    }
  );
};

exports.deleteBundle = (oRequest, oResponse) => {
  oBundleModel.find({'_id': { $in: oRequest.body }})
  .select('_id bundle_thumbnail')
  .exec((oError, oData) => {
      if (oError || oData.length < 1) {
          return oResponse.status(400).json({
              error: "Bundles not found"
          });
      }
      return this.deleteActualBundle(oData, oResponse);
  });
};

/**
 * Delete actual bundle
 */
this.deleteActualBundle = (oRequest, oResponse) => {
  var oBundleId = oRequest.map(oItem => oItem._id);
  oBundleModel.deleteMany(
      { _id: { $in: oBundleId } },
      (oError, oData) => {
      if (oError) {
          return oResponse.status(400).json({
              error: errorHandler(oError)
          });
      }
      var aError = this.deleteBundleImage(oRequest);
      if (aError.length > 0) {
          return oResponse
          .status(400)
          .json({ error: "Error in deleting images" }); // refactor, delete first before updating
      }
      oResponse.json({ data: oData });
  });
};

/**
* Retrieved bundle data from find function returns with image file name
* Image file name would be also deleted
*/
this.deleteBundleImage = (oRequest) => {
  var aError = [];
  oRequest.forEach(oItem => {
      oFileSystem.unlink(`public/images/bundles/${oItem.bundle_thumbnail}`, oError => {
          if (oError) {
              aError.push(oError.message);
          }
      });
  });
  return aError;
};