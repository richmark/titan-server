/**
 * Titan Ecommerce (Server)
 * controllers/category.js
 * @author Jon Aguilar <jjaguilar08@gmail.com>
 * @date 11/18/2019
 * @version 1.0
 */

const oCategoryModel = require("../models/category");
const { errorHandler } = require("../helpers/dbErrorHandler");

/**
 * createCategory function
 * Creates category
 */
exports.createCategory = (oRequest, oResponse) => {
  const oCategory = new oCategoryModel(oRequest.body);
  oCategory.save((oError, oData) => {
    if (oError) {
      return oResponse.status(400).json({
        error: errorHandler(oError)
      });
    }
    oResponse.json({ oData });
  });
};

/**
 * getCategory function
 * Gets category by ID
 */
exports.getCategory = (oRequest, oResponse) => {
  return oResponse.json(oRequest.category);
};

/**
 * categoryById middleware
 * checks if category exists by id
 */
exports.categoryById = (oRequest, oResponse, oNext, sId) => {
  oCategoryModel.findById(sId).exec((oError, oCategory) => {
    if (oError || !oCategory) {
      return oResponse.status(400).json({
        error: "Category does not exist!"
      });
    }
    oRequest.category = oCategory;
    oNext();
  });
};

/**
 * deleteCategory function
 * deletes category
 */
exports.deleteCategory = (oRequest, oResponse) => {
  const oCategory = oRequest.category;
  oCategory.remove(oError => {
    if (oError) {
      return oResponse.status(400).json({
        error: errorHandler(oError)
      });
    }
    oResponse.json({
      message: "Category deleted!"
    });
  });
};

/**
 * update category function
 * updated category
 */
exports.updateCategory = (oRequest, oResponse) => {
  const oCategory = oRequest.category;
  oCategory.name = oRequest.body.name;
  oCategory.save((oError, oData) => {
    if (oError) {
      return oResponse.status(400).json({
        error: errorHandler(oError)
      });
    }
    oResponse.json(oData);
  });
};

/**
 * listCategory function
 * gets list of all categories
 */
exports.listCategory = (oRequest, oResponse) => {
  oCategoryModel.find().exec((oError, oData) => {
    if (oError) {
      return oResponse.status(400).json({
        error: errorHandler(oError)
      });
    }
    oResponse.json(oData);
  });
};
