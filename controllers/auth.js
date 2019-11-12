/**
 * Titan Ecommerce (Server)
 * controllers/auth.js
 * @author Carlo Barcena <cbarcena20@gmail.com>
 * @date 11/12/2019 8:22 PM
 * @version 1.0 
 */

const oUserModel = require('../models/user');
const oJwt = require('jsonwebtoken');
const oExpressJwt = require('express-jwt');

/**
 * Register User
 */
exports.registerUser = (oRequest, oResponse) => {
    
    const oUser = new oUserModel(oRequest.body);
    oUser.save((oError, oData) => {
        if (oError) {
            return oResponse.status(400).json({
                error : oError 
            });
        }
        oUser.salt = undefined;
        oUser.hashed_password = undefined;
        oResponse.json({
            data: oData
        });
    });
};