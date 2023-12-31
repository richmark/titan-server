/**
 * Titan Ecommerce (Server)
 * controllers/bundles.js
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 01/12/2020
 * @version 1.0
 */

const oProductModel = require('../models/product');
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
 * List Bundles
 */
exports.listBundles = (oRequest, oResponse) => {
  let sOrder = oRequest.query.order ? oRequest.query.order : "asc";
  let sSortBy = oRequest.query.sortBy ? oRequest.query.sortBy : "_id";
  let iLimit = oRequest.query.limit ? parseInt(oRequest.query.limit, 10) : 6;
  let iOffset = oRequest.query.offset ? parseInt(oRequest.query.offset, 10) : 0;

  oProductModel
    .find({category: null})
    .select()
    .sort([[sSortBy, sOrder]])
    // .limit(iLimit)
    // .skip(iOffset)
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
  oProductModel
  .findById(sId)
  .populate('bundle_product.product', '_id product_name price image ')
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
  oRequest.body.bundle_product = JSON.parse(oRequest.body.bundle_product);
  oRequest.body.delivery_price = JSON.parse(oRequest.body.delivery_price);

  _.assignIn(oRequest.bundle, oRequest.body);

  oProductModel.findOneAndUpdate(
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
  oProductModel.find({'_id': { $in: oRequest.body }})
  .select('_id image')
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
  oProductModel.deleteMany(
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
      oFileSystem.unlink(`public/images/bundles/${oItem.image}`, oError => {
          if (oError) {
              aError.push(oError.message);
          }
      });
  });
  return aError;
};


/**
 * For bundle x category lookup
 */
const oReviewLookup = {
  from: 'reviews',
  let: { product_id: "$_id"},
  pipeline: [
    { $match:
        { $expr:
          { $and:
              [
                { $eq: [ "$product",  "$$product_id" ] },
                { $eq: [ "$visibility", true ] }
              ]
          }
        }
    },
    { $project: {
        _id        : 0,
        rate       : 1
      } 
    }
  ],
  as: 'reviews'
};

/**
 * list Bundle Client function client side
 * this function returns list of products
 * this function accepts query parameters (limit, sortBy, order, offset)
 * include reviews
 */
exports.listClientBundle = (oRequest, oResponse) => {
  let oSort = {};
  let iOrder = parseInt(oRequest.query.order ? oRequest.query.order : 1, 10);
  let sSortBy = oRequest.query.sortBy ? oRequest.query.sortBy : "_id";
  oSort[sSortBy] = iOrder;
  let iLimit = oRequest.query.limit ? parseInt(oRequest.query.limit, 10) : 6;
  let iOffset = oRequest.query.offset ? parseInt(oRequest.query.offset, 10) : 0;
  
  oProductModel.aggregate([
    {
      $match: { category: null, display: 'T'  }
    },
    { 
      $lookup: oReviewLookup,
    },
    { 
      $sort: oSort
    },
    { 
      $skip: iOffset
    },
    { 
      $limit: iLimit
    }
  ]).exec((oError, aData) => {
      if (oError) {
        return oResponse.status(400).json({
          error: "Bundles not found"
        });
      }
      return oResponse.json({ data: aData});
  });
};

/**
 * listRelated bundle function client only
 * lists products with the same category except the product itself
 */
exports.listRelatedBundleClient = (oRequest, oResponse) => {
  let iLimit = oRequest.query.limit ? parseInt(oRequest.query.limit, 10) : 6;
  oProductModel.aggregate([
    { 
      $match : { 
        _id     : { $ne: oRequest.bundle._id },
        category: null,
        display: 'T' 
      } 
    },
    { 
      $lookup: oReviewLookup,
    },
    { 
      $limit: iLimit
    }
  ]).exec((oError, aData) => {
      if (oError) {
        return oResponse.status(400).json({
          error: "Bundles not found"
        });
      }
      return oResponse.json({ data: aData});
  });
};
