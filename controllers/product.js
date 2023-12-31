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
this.setRequestBodyImage = (oRequest) => {
  if (typeof oRequest.files !== "undefined") {
    var aAdditionalImages = [];
    Object.keys(oRequest.files).forEach((sKey) => {
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
  if (typeof oRequest.body.bundle_product !== "undefined") {
    oRequest.body.bundle_product = JSON.parse(oRequest.body.bundle_product);
  }
  if (typeof oRequest.body.delivery_price !== "undefined") {
    oRequest.body.delivery_price = JSON.parse(oRequest.body.delivery_price);
  }
  oRequest = this.setRequestBodyImage(oRequest);
  const oProduct = new oProductModel(oRequest.body);
  oProduct.save((oError, oData) => {
    if (oError) {
      return oResponse.status(400).json({
        error: errorHandler(oError),
      });
    }
    oResponse.json({ data: oData });
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
  // let iLimit = oRequest.query.limit ? parseInt(oRequest.query.limit, 10) : 6;
  // let iOffset = oRequest.query.offset ? parseInt(oRequest.query.offset, 10) : 0;

  oProductModel
    .find({ category: { $ne: null } })
    .populate("category")
    .select()
    .sort([[sSortBy, sOrder]])
    // .limit(iLimit)
    // .skip(iOffset)
    .exec((oError, oData) => {
      if (oError) {
        return oResponse.status(400).json({
          error: "Products not found",
        });
      }
      oResponse.json({ data: oData });
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
        error: "Something went wrong!",
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
        error: "Product not found",
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
          $lte: oRequest.body.filters[key][1],
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
          error: "Products not found",
        });
      }
      oResponse.json({
        data: {
          size: oProduct.length,
          oProduct,
        },
      });
    });
};

/**
 * listRelated function
 * lists products with the same category except the product itself
 */
exports.listRelated = (oRequest, oResponse) => {
  let iLimit = oRequest.query.limit ? parseInt(oRequest.query.limit, 10) : 6;

  oProductModel
    .find({
      _id: { $ne: oRequest.product },
      category: oRequest.product.category,
    })
    .limit(iLimit)
    .populate("category", "_id name")
    .exec((oError, oProduct) => {
      if (oError) {
        return oResponse.status(400).json({
          error: "Products not found",
        });
      }
      oResponse.json({ data: oProduct });
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
        error: "Categories not found",
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
  if (typeof oRequest.body.delivery_price !== "undefined") {
    oRequest.body.delivery_price = JSON.parse(oRequest.body.delivery_price);
  }
  oRequest = this.setRequestBodyImage(oRequest);
  oProductModel.findOneAndUpdate(
    { _id: oRequest.product._id },
    { $set: oRequest.body },
    { new: true },
    (oError, oData) => {
      if (oError) {
        return oResponse.status(400).json({
          error: errorHandler(oError),
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

this.deleteUnusedImage = (oRequest) => {
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
    aDeleteImages.forEach((sFile) => {
      oFileSystem.unlink(`public/images/products/${sFile}`, (oError) => {
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
  oProductModel
    .find({ _id: { $in: oRequest.body } })
    .select("_id additional_images image")
    .exec((oError, oData) => {
      if (oError || oData.length < 1) {
        return oResponse.status(400).json({
          error: "Products not found",
        });
      }
      return this.deleteActualProduct(oData, oResponse);
    });
};

/**
 * Delete actual product
 */
this.deleteActualProduct = (oRequest, oResponse) => {
  var aProductId = oRequest.map((oItem) => oItem._id);
  oProductModel.deleteMany({ _id: { $in: aProductId } }, (oError, oData) => {
    if (oError) {
      return oResponse.status(400).json({
        error: errorHandler(oError),
      });
    }

    var aError = this.deleteProductImage(oRequest);

    if (aError.length > 0) {
      return oResponse.status(400).json({ error: "Error in deleting images" }); // refactor, delete first before updating
    }

    oResponse.json({ data: oData });
  });
};

/**
 * Retrieved product data from find function returns with image file name
 * Image file name would be also deleted
 */
this.deleteProductImage = (oRequest) => {
  var aError = [];
  oRequest.forEach((oItem) => {
    if (oItem.additional_images.length > 0) {
      oItem.additional_images.forEach((oAdditionalImage) => {
        oFileSystem.unlink(`public/images/products/${oAdditionalImage}`, (oError) => {
          if (oError) {
            aError.push(oError.message);
          }
        });
      });
    }

    oFileSystem.unlink(`public/images/products/${oItem.image}`, (oError) => {
      if (oError) {
        aError.push(oError.message);
      }
    });
  });

  return aError;
};

exports.listByCategory = (oRequest, oResponse) => {
  let iLimit = oRequest.query.limit ? parseInt(oRequest.query.limit, 10) : 6;
  let sOrder = oRequest.query.order ? oRequest.query.order : "desc";
  let skip = parseInt(oRequest.query.skip);

  oProductModel
    .find({
      category: oRequest.category._id,
    })
    .limit(iLimit)
    .populate("category", "_id name")
    .sort([["_id", sOrder]])
    .skip(skip)
    .exec((oError, data) => {
      if (oError) {
        return oResponse.status(400).json({
          error: "Products not found",
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
          product_name: { $regex: new RegExp(queryString, "i") },
        },
        {
          description: { $regex: new RegExp(queryString, "i") },
        },
      ],
    })
    .populate("category", "_id name")
    .exec((oError, oProduct) => {
      if (oError || !oProduct) {
        return oResponse.status(400).json({
          error: "Product does not exist!",
        });
      }
      oResponse.json({ data: oProduct });
    });
};

/**
 * For product x category lookup
 */
const oReviewLookup = {
  from: "reviews",
  let: { product_id: "$_id" },
  pipeline: [
    {
      $match: {
        $expr: {
          $and: [
            { $eq: ["$product", "$$product_id"] },
            { $eq: ["$visibility", true] },
          ],
        },
      },
    },
    {
      $project: {
        _id: 0,
        rate: 1,
      },
    },
  ],
  as: "reviews",
};

/**
 * For product x category lookup
 */
const oCategoryLookup = {
  from: "categories",
  localField: "category",
  foreignField: "_id",
  as: "category",
};

/**
 * listRelated function
 * lists products with the same category except the product itself
 */
exports.listRelatedClient = (oRequest, oResponse) => {
  let iLimit = oRequest.query.limit ? parseInt(oRequest.query.limit, 10) : 6;
  oProductModel
    .aggregate([
      {
        $match: {
          _id: { $ne: oRequest.product._id },
          category: oRequest.product.category,
        },
      },
      {
        $lookup: oReviewLookup,
      },
      {
        $lookup: oCategoryLookup,
      },
      {
        $limit: iLimit,
      },
    ])
    .exec((oError, aData) => {
      if (oError) {
        return oResponse.status(400).json({
          error: "Products not found",
        });
      }
      return oResponse.json({ data: aData });
    });
};

/**
 * listProducts function
 * this function returns list of products
 * this function accepts query parameters (limit, sortBy, order, offset)
 * include reviews
 */
exports.listProductsClient = (oRequest, oResponse) => {
  let oSort = {};
  let iOrder = parseInt(oRequest.query.order ? oRequest.query.order : 1, 10);
  let sSortBy = oRequest.query.sortBy ? oRequest.query.sortBy : "_id";
  oSort[sSortBy] = iOrder;
  let iLimit = oRequest.query.limit ? parseInt(oRequest.query.limit, 10) : 6;
  let iOffset = oRequest.query.offset ? parseInt(oRequest.query.offset, 10) : 0;

  oProductModel
    .aggregate([
      {
        $match: { 
          category: { $ne: null },
          display: 'T' 
        },
      },
      {
        $lookup: oReviewLookup,
      },
      {
        $lookup: oCategoryLookup,
      },
      {
        $sort: oSort,
      },
      {
        $skip: iOffset,
      },
      {
        $limit: iLimit,
      },
    ])
    .exec((oError, aData) => {
      if (oError) {
        return oResponse.status(400).json({
          error: "Products not found",
        });
      }
      return oResponse.json({ data: aData });
    });
};

/**
 * Product Search Client Side
 * This function searches through the Product table
 */
exports.productSearchClient = (oRequest, oResponse) => {
  let queryString = oRequest.body.query;
  oProductModel
    .aggregate([
      {
        $match: {
          display: 'T', 
          $or: [
            {
              product_name: { $regex: new RegExp(queryString, "i") },
            },
            {
              description: { $regex: new RegExp(queryString, "i") },
            },
          ],
        },
      },
      {
        $lookup: oReviewLookup,
      },
      {
        $lookup: oCategoryLookup,
      },
    ])
    .exec((oError, aData) => {
      if (oError) {
        return oResponse.status(400).json({
          error: "Products not found",
        });
      }
      return oResponse.json({ data: aData });
    });
};

/**
 * List By Category Client Side
 */
exports.listByCategoryClient = (oRequest, oResponse) => {
  var oSort = {};
  let iLimit = oRequest.query.limit ? parseInt(oRequest.query.limit, 10) : 6;
  let iOrder = parseInt(oRequest.query.order ? oRequest.query.order : -1, 10);
  oSort["_id"] = iOrder;
  let iSkip = parseInt(oRequest.query.skip);
  oProductModel
    .aggregate([
      {
        $match: {
          category: oRequest.category._id,
          display: 'T' 
        },
      },
      {
        $lookup: oReviewLookup,
      },
      {
        $lookup: oCategoryLookup,
      },
      {
        $sort: oSort,
      },
      {
        $skip: iSkip,
      },
      {
        $limit: iLimit,
      },
    ])
    .exec((oError, aData) => {
      if (oError) {
        return oResponse.status(400).json({
          error: "Products not found",
        });
      }
      return oResponse.json({ data: aData });
    });
};
