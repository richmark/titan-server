/**
 * Titan Ecommerce (Server)
 * controllers/user.js
 * @author Jon Aguilar <jjaguilar08@gmail.com>
 * @date 11/18/2019
 * @version 1.0
 */

const ModelUser = require("../models/user");

/**
 * userById middleware
 * checks if user exist
 */
exports.userById = (oRequest, oResponse, next, id) => {
  ModelUser.findById(id).exec((err, user) => {
    if (err || !user) {
      return oResponse.status(400).json({
        error: "User not found"
      });
    }

    oRequest.profile = user;
    next();
  });
};
