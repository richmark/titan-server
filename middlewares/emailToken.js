/**
 * Titan Ecommerce (Server)
 * middlewares/emailToken.js
 * @author Carlo Barcena <cbarcena20@gmail.com>
 * @date 11/13/2019 8:09 PM
 * @version 1.0 
 */

/**
 * Middleware that gets tokenId 
 */
exports.tokenById = (oRequest, oResponse, oNext, sTokenId) => {
    oRequest.tokenId = sTokenId;
    oNext();
};