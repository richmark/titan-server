/**
 * Titan Ecommerce (Server)
 * middlewares/handleProductStock.js
 * @author Carlo Barcena <cbarcena20@gmail.com>
 * @date 11/14/2019 8:19 PM
 * @version 1.0 
 */

const oProductModel = require('../models/product');

exports.checkProductStock = (oRequest, oResponse, oNext) => {
    const aProduct = oRequest.body.products;
    var iCount = 0;
    this.runModelPromise(aProduct, iCount, aProduct.length - 1, oResponse, oNext);
};

this.runModelPromise = (aProduct, iCount, iLast, oResponse, oNext) => {
    oProductModel.find({_id : aProduct[iCount].id}).exec((oError, oModelData) => {
        if (oError) {
            return oResponse.status(400).json({
                error: oError
            });
        } else if (aProduct[iCount].count > oModelData[0].stock) {
            return oResponse.status(400).json({
                error: 'insufficient_stock'
            });
        } else if (iCount === iLast) {
            oNext();
        } else {
            iCount++;
            this.runModelPromise(aProduct, iCount, iLast, oResponse, oNext);
        }
    });
}
