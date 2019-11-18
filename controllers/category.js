/**
 * Titan Ecommerce (Server)
 * controllers/category.js
 * @author Jon Aguilar <jjaguilar08@gmail.com>
 * @date 11/18/2019
 * @version 1.0
 */

const ModelCategory = require("../models/category");
const { errorHandler } = require("../helpers/dbErrorHandler");

/**
 * createCategory function
 * Creates category
 */
exports.createCategory = (oRequest, oResponse) => {
  const oCategory = new ModelCategory(oRequest.body);
  oCategory.save((err, data) => {
    if (err) {
      return oResponse.status(400).json({
        error: errorHandler(err)
      });
    }
    oResponse.json({ data });
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
exports.categoryById = (oRequest, oResponse, next, id) => {
  ModelCategory.findById(id).exec((err, category) => {
    if (err || !category) {
      return oResponse.status(400).json({
        error: "Category does not exist!"
      });
    }
    oRequest.category = category;
    next();
  });
};

/**
 * deleteCategory function
 * deletes category
 */
exports.deleteCategory = (oRequest, oResponse) => {
  const oCategory = oRequest.category;
  oCategory.remove(err => {
    if (err) {
      return oResponse.status(400).json({
        error: errorHandler(err)
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
  oCategory.save((err, data) => {
    if (err) {
      return oResponse.status(400).json({
        error: errorHandler(err)
      });
    }
    oResponse.json(data);
  });
};
