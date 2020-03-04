/**
 * Titan Ecommerce (Server)
 * controllers/product.js
 * @author Jon Aguilar <jjaguilar08@gmail.com>
 * @date 11/18/2019
 * @version 1.0
 */

const oProductModel = require("../models/product");
const oReviewModel = require("../models/review");
const oFormidable = require("formidable");
const { errorHandler } = require("../helpers/dbErrorHandler");
const _ = require("lodash");
const oFileSystem = require("fs");

/**
 * sets product image
 */
this.setRequestBodyImage = oRequest => {
  if (typeof oRequest.files !== "undefined") {
    var aAdditionalImages = [];
    Object.keys(oRequest.files).forEach(sKey => {
      if (sKey === "additional_images") {
        for (var iIndex in oRequest.files[sKey]) {
          aAdditionalImages.push(oRequest.files[sKey][iIndex].filename);
        }
      } else {
        oRequest.body[sKey] = oRequest.files[sKey][0].filename;
      }
    });
    if (aAdditionalImages.length > 0) {
      oRequest.body["additional_images"] = aAdditionalImages;
    }
  }
  return oRequest;
};

/**
 * registerProduct function
 * this function registers products in DB
 */
exports.registerProduct = (oRequest, oResponse) => {
  if (typeof oRequest.body.additional_info !== "undefined") {
    oRequest.body.additional_info = JSON.parse(oRequest.body.additional_info);
  }
  oRequest = this.setRequestBodyImage(oRequest);
  const oProduct = new oProductModel(oRequest.body);
  oProduct.save((oError, oData) => {
    if (oError) {
      return oResponse.status(400).json({
        error: errorHandler(oError)
      });
    }
    oResponse.json({ data: oData });
  });
};

/**
 * listProducts function
 * this function returns list of products
 * this function accepts query parameters (limit, sortBy, order, offset)
 * include reviews
 */
exports.listProducts = (oRequest, oResponse) => {
  let oSort = {};
  let iOrder = parseInt(oRequest.query.order ? oRequest.query.order : 1, 10);
  let sSortBy = oRequest.query.sortBy ? oRequest.query.sortBy : "_id";
  oSort[sSortBy] = iOrder;
  let iLimit = oRequest.query.limit ? parseInt(oRequest.query.limit, 10) : 6;
  let iOffset = oRequest.query.offset ? parseInt(oRequest.query.offset, 10) : 0;
  
  oProductModel.aggregate([
    { 
      $lookup: {
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
      },
    },
    { 
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category'
      }
    },
    { 
      $sort: oSort
    },
    { 
      $skip: iOffset
    },
    { 
      $limit: iLimit
    },
  ]).exec((oError, aData) => {
      if (oError) {
        return oResponse.status(400).json({
          error: "Products not found"
        });
      }
      return oResponse.json({ data: aData});
  });
};


/**
 * countProduct function
 * this function gets the count of all products inserted
 */
exports.countProducts = (oRequest, oResponse) => {
  oProductModel.countDocuments().exec((oError, iCount) => {
    if (oError) {
      return oResponse.status(400).json({
        error: "Something went wrong!"
      });
    }

    oResponse.json({ data: { count: iCount } });
  });
};

/**
 * productById middleware
 * this functions checks if the product id exists before proceeding to the next function
 */
exports.productById = (oRequest, oResponse, oNext, sId) => {
  oProductModel.findById(sId).exec((oError, oProduct) => {
    if (oError || !oProduct) {
      return oResponse.status(400).json({
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
  return oResponse.json({ data: oRequest.product });
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
    .exec((err, oProduct) => {
      if (err) {
        return oResponse.status(400).json({
          error: "Products not found"
        });
      }
      oResponse.json({
        data: {
          size: oProduct.length,
          oProduct
        }
      });
    });
};

/**
 * listRelated function
 * lists products with the same category except the product itself
 */
exports.listRelated = (oRequest, oResponse) => {
  let iLimit = oRequest.query.limit ? parseInt(oRequest.query.limit, 10) : 6;
  oProductModel.aggregate([
    { 
      $match : { 
        _id     : { $ne: oRequest.product._id },
        category: oRequest.product.category 
      } 
    },
    { 
      $lookup: {
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
      },
    },
    { 
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category'
      }
    },
    { 
      $limit: iLimit
    },
  ]).exec((oError, aData) => {
      if (oError) {
        return oResponse.status(400).json({
          error: "Products not found"
        });
      }
      return oResponse.json({ data: aData});
  });
};

/**
 * listCategories function
 * lists categories of products
 */
exports.listCategories = (oRequest, oResponse) => {
  oProductModel.distinct("category", {}, (oError, oCategories) => {
    if (oError) {
      return oResponse.status(400).json({
        error: "Categories not found"
      });
    }
    oResponse.json({ data: oCategories });
  });
};

/**
 * update product function
 * updates products
 */
exports.updateProduct = (oRequest, oResponse) => {
  if (typeof oRequest.body.additional_info !== "undefined") {
    oRequest.body.additional_info = JSON.parse(oRequest.body.additional_info);
  }
  oRequest = this.setRequestBodyImage(oRequest);
  oProductModel.findOneAndUpdate(
    { _id: oRequest.product._id },
    { $set: oRequest.body },
    { new: true },
    (oError, oData) => {
      if (oError) {
        return oResponse.status(400).json({
          error: errorHandler(oError)
        });
      }
      var aError = this.deleteUnusedImage(oRequest);
      if (aError.length > 0) {
        return oResponse
          .status(400)
          .json({ error: "Error in deleting images" }); // refactor, delete first before updating
      }
      oResponse.json({ data: oData });
    }
  );
};

this.deleteUnusedImage = oRequest => {
  if (
    oRequest.body.additional_images &&
    oRequest.body.additional_images.length <
      oRequest.product.additional_images.length
  ) {
    const aDeleteImages = _.difference(
      oRequest.product.additional_images,
      oRequest.body.additional_images
    );
    const aError = [];
    aDeleteImages.forEach(sFile => {
      oFileSystem.unlink(`public/images/products/${sFile}`, oError => {
        if (oError) {
          aError.push(oError.message);
        }
      });
    });
    return aError;
  }
  return [];
};

/**
 * deleteProduct function
 * this function deletes product by id
 */
exports.deleteProduct = (oRequest, oResponse) => {
  let oProduct = oRequest.product;
  oProduct.remove(oError => {
    if (oError) {
      return oResponse.status(400).json({
        error: errorHandler(oError)
      });
    }
    oResponse.json({
      message: "Product deleted successfully!"
    });
  });
};

exports.listByCategory = (oRequest, oResponse) => {
  let iLimit = oRequest.query.limit ? parseInt(oRequest.query.limit, 10) : 6;
  let sOrder = oRequest.query.order ? oRequest.query.order : "desc";
  let skip = parseInt(oRequest.query.skip);

  oProductModel
    .find({
      category: oRequest.category._id
    })
    .limit(iLimit)
    .populate("category", "_id name")
    .sort([["_id", sOrder]])
    .skip(skip)
    .exec((oError, data) => {
      if (oError) {
        return oResponse.status(400).json({
          error: "Products not found"
        });
      }
      oResponse.json({ size: data.length, data });
    });
};

/**
 * Product Search
 * This function searches through the Product table
 */
exports.productSearch = (oRequest, oResponse) => {
  let queryString = oRequest.body.query;
  oProductModel
    .find({
      $or: [
        {
          product_name: { $regex: new RegExp(queryString, "i") }
        },
        {
          description: { $regex: new RegExp(queryString, "i") }
        }
      ]
    })
    .populate("category", "_id name")
    .exec((oError, oProduct) => {
      if (oError || !oProduct) {
        return oResponse.status(400).json({
          error: "Product does not exist!"
        });
      }
      oResponse.json({ data: oProduct });
    });
};
