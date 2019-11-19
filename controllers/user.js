/**
 * Titan Ecommerce (Server)
 * controllers/user.js
 * @author Jon Aguilar <jjaguilar08@gmail.com>
 * @author Carlo Barcena <cbarcena20@gmail.com>
 * @date 11/18/2019
 * @version 1.0
 */

 
const oUserModel = require('../models/user');

/**
 * userById middleware
 * checks if user exist
 */
exports.userById = (oRequest, oResponse, oNext, sId) => {
    oUserModel.findById(sId).exec((oError, oUserData) => {
        if (oError || !oUserData) {
            return oResponse.status(400).json({
                error: 'User not found'
            });
        }
        oRequest.profile = oUserData;
        oNext();
    });
};

/**
 * Request Body Image
 */
this.setRequestBodyImage = oRequest => {
    if (typeof oRequest.files !== 'undefined') {
        Object.keys(oRequest.files).forEach(sKey => {
            oRequest.body[sKey] = oRequest.files[sKey][0].filename;
        });
    }
    return oRequest;
};


exports.updateUser = (oRequest, oResponse) => {
    oRequest = this.setRequestBodyImage(oRequest);
    oUserModel.findOneAndUpdate({
        _id: oRequest.profile._id
    }, {
        $set: oRequest.body
    }, {
        new: true
    }, (oError, oUserData) => {
        if (oError === true) {
            return oResponse.status(400).json({
                error: 'You are not authorized to perform this action'
            });
        }
        oUserData.hashed_password = undefined;
        oUserData.salt = undefined;
        oResponse.json({
            data: oUserData
        }); 

    });
};

