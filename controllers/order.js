/**
 * Titan Ecommerce (Server)
 * controllers/order.js
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 12/07/2019
 * @version 1.0
 */

const oOrderModel = require("../models/order");
const oProductModel = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandler");
const { _ } = require('lodash');

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

exports.listOrders = (oRequest, oResponse) => {
    let sOrder = oRequest.query.order ? oRequest.query.order : "asc";
    let sSortBy = oRequest.query.sortBy ? oRequest.query.sortBy : "_id";
    let iLimit = oRequest.query.limit ? parseInt(oRequest.query.limit, 10) : 6;
    let iOffset = oRequest.query.offset ? parseInt(oRequest.query.offset, 10) : 0;

    oOrderModel
        .find()
        .select('_id status createdAt updatedAt')
        .populate('user', '_id email')
        .sort([[sSortBy, sOrder]])
        .limit(iLimit)
        .skip(iOffset)
        .exec((oError, oData) => {
            if (oError) {
                return oResponse.status(400).json({
                    error: "Orders not found"
                });
            }
            oResponse.json({ data: oData });
        });
};

exports.orderById = (oRequest, oResponse, oNext, sId) => {
    oOrderModel
    .findById(sId)
    .populate('shipper')
    .exec((oError, oOrder) => {
        if (oError || !oOrder) {
            oResponse.status(400).json({
                error: "Order not found"
            });
        }
        oRequest.order = oOrder;
        oNext();
    });
};

/**
 * Get Order By Id
 * Load ordered products
 */
exports.getOrderById = (oRequest, oResponse) => {

    let aProduct = [];
    oRequest.order.products.map((oProduct, iIndex) => {
        aProduct.push(oProduct.product);
    });

    oProductModel
    .find({'_id': { $in: aProduct }})
    .select('product_name image price')
    .exec((oError, oData) => {
        if (oError) {
            return oResponse.status(400).json({
                error: "Products not found"
            });
        }
        var oOrder = JSON.parse(JSON.stringify(oRequest.order));
        var oClonedData = JSON.parse(JSON.stringify(oData));
        oOrder.products = _.merge(oOrder.products, oClonedData);
        oResponse.json({ data: oOrder });
    });
}

/**
 * Update Order By Id
 * Status and History
 */
exports.updateOrderById = (oRequest, oResponse) => {
    let oQuery = this.setQuery(oRequest.body, oRequest.order.status);
    console.log(oQuery);
    oOrderModel.findOneAndUpdate(
        { _id: oRequest.order._id},
        oQuery,
        (oError, oData) => {
            console.log(oError);
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
 * returns note prefix
 */
this.getNote = (sKey) => {
    return {
        Processing: 'Processing with tracking number of ',
        Shipped: '',
        Delivered: '',
        Cancelled: ''
    }[sKey];
};

/**
 * Set Query
 * available to change shipper if status is the same
 * if not the same, set change and push another array to history
 */
this.setQuery = (oNewOrderData, sOrderStatus) => {
    let oHistory = {
        status: oNewOrderData.status,
        note: this.getNote(oNewOrderData.status) + oNewOrderData.tracking_number,
    };
    if (oNewOrderData.status === sOrderStatus) {
        return {$set: { shipper: oNewOrderData.category }};
    }
    return {$set: { shipper: oNewOrderData.category, status: oNewOrderData.status }, $push: { history: oHistory }};
}