/**
 * Titan Ecommerce (Server)
 * controllers/level.js
 * @author Jon Aguilar <jjaguilar08@gmail.com>
 * @date 02/26/2020
 * @version 1.0
 */
const oLevelModel = require("../models/level");
const { errorHandler } = require("../helpers/dbErrorHandler");

/**
 * Create Coupon Function
 * This function creates coupon
 */
exports.createLevel = (oRequest, oResponse) => {
  const oLevel = new oLevelModel(oRequest.body);
  oLevel.save((oError, oData) => {
    if (oError) {
      return oResponse.status(400).json({
        error: errorHandler(oError)
      });
    }
    oResponse.json({ data: oData });
  });
};

/**
 * getCategory function
 * Gets category by ID
 */
exports.getLevel = (oRequest, oResponse) => {
  return oResponse.json({ data: oRequest.level });
};

/**
 * Coupon by ID middleware
 * This middle gets coupon by ID
 */
exports.levelById = (oRequest, oResponse, oNext, sId) => {
  oLevelModel.findById(sId).exec((oError, oLevel) => {
    if (oError || !oLevel) {
      return oResponse.status(400).json({
        error: "Level does not exist!"
      });
    }
    oRequest.level = oLevel;
    oNext();
  });
};

/**
 * List Coupon Function
 * This function lists coupon with search filters.
 */
exports.listLevel = (oRequest, oResponse) => {
  oLevelModel.find().exec((oError, oData) => {
    if (oError) {
      return oResponse.status(400).json({
        error: errorHandler(oError)
      });
    }
    oResponse.json({ data: oData });
  });
};

/**
 * update coupon function
 * updates coupon
 */
exports.updateLevel = (oRequest, oResponse) => {
  oLevelModel.findOneAndUpdate(
    { _id: oRequest.level._id },
    { $set: oRequest.body },
    { new: true },
    (oError, oData) => {
      if (oError) {
        return oResponse.status(400).json({
          error: errorHandler(oError)
        });
      }
      oResponse.json({ data: oData });
    }
  );
};

/**
 * deleteCategory function
 * deletes category
 */
exports.deleteLevel = (oRequest, oResponse) => {
  const oLevel = oRequest.level;
  oLevel.remove(oError => {
    if (oError) {
      return oResponse.status(400).json({
        error: errorHandler(oError)
      });
    }
    oResponse.json({
      message: "Level deleted!"
    });
  });
};
