/**
 * Titan Ecommerce (Server)
 * controllers/order.js
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 12/07/2019
 * @version 1.0
 */

const oOrderModel = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");

/**
 * createShipper function
 * this function create shipper
 */
exports.createOrder = (oRequest, oResponse) => {
    const oOrder = new oOrderModel(oRequest.body);
    oOrder.save((oError, oData) => {
        if (oError) {
        return oResponse.status(400).json({
            error: errorHandler(oError)
        });
        }
        oResponse.json({ data: oData });
    });
};