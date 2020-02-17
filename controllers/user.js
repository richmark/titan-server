/**
 * Titan Ecommerce (Server)
 * controllers/user.js
 * @author Jon Aguilar <jjaguilar08@gmail.com>
 * @author Carlo Barcena <cbarcena20@gmail.com>
 * @date 11/18/2019
 * @version 1.0
 */

const oUserModel = require("../models/user");

/**
 * userById middleware
 * checks if user exist
 */
exports.userById = (oRequest, oResponse, oNext, sId) => {
  oUserModel.findById(sId).exec((oError, oUserData) => {
    if (oError || !oUserData) {
      return oResponse.status(400).json({
        error: "User not found"
      });
    }
    oRequest.profile = oUserData;
    oRequest.iIndex = 0;
    oNext();
  });
};

/**
 * Request Body Image
 */
this.setRequestBodyImage = oRequest => {
  if (typeof oRequest.files !== "undefined") {
    Object.keys(oRequest.files).forEach(sKey => {
      oRequest.body[sKey] = oRequest.files[sKey][0].filename;
    });
  }
  return oRequest;
};

/**
 * Update User Password
 */
exports.updateUserPassword = (oRequest, oResponse) => {
  oUserModel.findById(oRequest.profile._id).exec((oError, oUserData) => {
    if (!oUserData.authenticatePassword(oRequest.body.current_password)) {
      return oResponse.status(401).json({ error: "Invalid Password!" });
    }
    delete oRequest.body.current_password;
    return this.changeUserPassword(oRequest, oResponse);
  });
};

/**
 * Change User Password
 */
this.changeUserPassword = async (oRequest, oResponse) => {
  const oUserData = await oUserModel.findOne({
    _id: oRequest.profile._id
  });

  oUserData.password = oRequest.body.password;
  const oSavedData = await oUserData.save();
  if (!oSavedData) {
    return oResponse.status(401).send({
      error: "Unable to change password."
    });
  }
  return oResponse
    .status(200)
    .send({ message: "Successfully changed your password." });
};

exports.updateUser = (oRequest, oResponse) => {
  oRequest = this.setRequestBodyImage(oRequest);
  oUserModel.findOneAndUpdate(
    {
      _id: oRequest.profile._id
    },
    {
      $set: oRequest.body
    },
    {
      new: true
    },
    (oError, oUserData) => {
      if (oError === true) {
        return oResponse.status(400).json({
          error: "You are not authorized to perform this action"
        });
      }
      oUserData.hashed_password = undefined;
      oUserData.salt = undefined;
      oResponse.json({
        data: oUserData
      });
    }
  );
};

exports.getUser = (oRequest, oResponse) => {
  oRequest.profile.hashed_password = undefined;
  oRequest.profile.salt = undefined;

  return oResponse.json(oRequest.profile);
};

/**
 * Get all verified emails with non admin and non personal role
 */
exports.getAllWholesalers = (oRequest, oResponse) => {
  oUserModel
    .find({ role: { $nin: [1, 2] }, verified_email: { $ne: false } })
    .select("company_name verified_admin")
    .exec((oError, oUserData) => {
      if (oError || !oUserData) {
        return oResponse.status(400).json({
          error: "User not found"
        });
      }
      return oResponse.status(200).json({
        data: oUserData
      });
    });
};

/**
 * Get all verified emails with non admin and non personal role
 */
exports.getAllSubadmins = (oRequest, oResponse) => {
  oUserModel
    .find({ role: 5 })
    .select("_id email subadmin_password")
    .exec((oError, oUserData) => {
      if (oError || !oUserData) {
        return oResponse.status(400).json({
          error: "User not found"
        });
      }
      return oResponse.status(200).json({
        data: oUserData
      });
    });
};

/**
 * userById middleware
 * checks if user exist
 */
exports.wholesalerById = (oRequest, oResponse, oNext, sId) => {
  oUserModel
    .findById(sId)
    .select(
      "-hashed_password -salt -role -passwordResetToken -passwordResetExpires -passwordChangedAt"
    )
    .exec((oError, oUserData) => {
      if (oError || !oUserData) {
        return oResponse.status(400).json({
          error: "User not found"
        });
      }
      oRequest.wholesaler = oUserData;
      oNext();
    });
};

exports.getWholesaler = (oRequest, oResponse) => {
  return oResponse.status(200).json({
    data: oRequest.wholesaler
  });
};

exports.updateWholesaler = (oRequest, oResponse) => {
  oUserModel.findOneAndUpdate(
    {
      _id: oRequest.wholesaler._id
    },
    {
      $set: oRequest.body
    },
    {
      new: true
    },
    (oError, oUserData) => {
      if (oError === true) {
        return oResponse.status(400).json({
          error: "You are not authorized to perform this action"
        });
      }
      oUserData.hashed_password = undefined;
      oUserData.salt = undefined;
      oResponse.json({
        data: oUserData
      });
    }
  );
};

/**
 * deleteCoupon function
 * deletes coupon
 */
exports.deleteUser = (oRequest, oResponse) => {
  const oUser = oRequest.profile;
  oUser.remove(oError => {
    if (oError) {
      return oResponse.status(400).json({
        error: errorHandler(oError)
      });
    }
    oResponse.json({
      message: "User deleted!"
    });
  });
};
