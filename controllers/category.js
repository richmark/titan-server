/**
 * Titan Ecommerce (Server)
 * controllers/category.js
 * @author Jon Aguilar <jjaguilar08@gmail.com>
 * @date 11/18/2019
 * @version 1.0
 */

const ModelCategory = require("../models/category");
const oFormidable = require("formidable");
const _ = require("lodash");
const oFs = require("fs");
const { errorHandler } = require("../helpers/dbErrorHandler");

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
