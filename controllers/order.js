/**
 * Titan Ecommerce (Server)
 * controllers/order.js
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @author Carlo Barcena <cbarcena20@gmail.com>
 * @date 12/07/2019
 * @version 1.0
 */

const oOrderModel = require("../models/order");
const oProductModel = require("../models/product");
const oSettingModel = require("../models/settings");
const { errorHandler } = require("../helpers/dbErrorHandler");
const { _ } = require('lodash');

/**
 * createOrder function
 * this function create order
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
    // let iLimit = oRequest.query.limit ? parseInt(oRequest.query.limit, 10) : 6;
    // let iOffset = oRequest.query.offset ? parseInt(oRequest.query.offset, 10) : 0;

    oOrderModel
        .find()
        .select('_id status createdAt updatedAt reference_number')
        .populate('user', '_id email')
        .sort([['createdAt', 'desc']])
        // .limit(iLimit)
        // .skip(iOffset)
        .exec((oError, oData) => {
            if (oError) {
                return oResponse.status(400).json({
                    error: "Orders not found"
                });
            }
            oResponse.json({ data: oData });
        });
};

/**
 * orderById middleware
 * checks if order exists by id
 */
exports.orderById = (oRequest, oResponse, oNext, sId) => {
    oOrderModel
    .findById(sId)
    .populate('shipper')
    .select()
    .exec((oError, oOrder) => {
        if (oError || !oOrder) {
            return oResponse.status(400).json({
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
        oOrder.products = _.values(_.merge(_.keyBy(oClonedData, '_id'), _.keyBy(oOrder.products, 'product')));
        oResponse.json({ data: oOrder });
    });
}

/**
 * Get Order By User
 * Load Orders per User
 */
exports.getOrderByUser = (oRequest, oResponse) => {
    oOrderModel
    .find({
        'user': oRequest.profile._id
    })
    .select()
    .exec((oError, oData) => {
        if (oError) {
            return oResponse.status(400).json({
                error: "No Orders for User"
            });
        }
        oResponse.json({
            data: oData
        });
    })
}

/**
 * Update Order By Id
 * Status and History
 */
exports.updateOrderById = (oRequest, oResponse) => {
    let oQuery = this.setQuery(oRequest.body, oRequest.order.status);
    oOrderModel.findOneAndUpdate(
        { _id: oRequest.order._id},
        oQuery,
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
 * returns note prefix
 */
this.getNote = (oData) => {
    return {
        Processing: `Order is now being processed`,
        Shipped: `Order has been shipped via ${oData.shipper_name} with tracking number of ${oData.tracking_number}`,
        Delivered: 'Order has been delivered',
        Cancelled: 'Order has been cancelled'
    }[oData.status];
};

/**
 * Set Query
 * Assume that tracking_number and shipper are always changing
 */
this.setQuery = (oData) => {
    let oHistory = {
        status: oData.status,
        note: this.getNote(oData),
    };
    return {
        $set: { shipper: oData.shipper_id, status: oData.status, tracking_number: oData.tracking_number },
        $push: { history: oHistory } // push a history for every update of an order 
    };
}

/**
 * Create or Update Order Details  
 * this function create or update order settings
 * Delivery Fee
 */
exports.createOrderSettings = (oRequest, oResponse) => {
    const oOrder = new oSettingModel(oRequest.body);
    oOrder.save((oError, oData) => {
        if (oError) {
            return oResponse.status(400).json({
                error: errorHandler(oError)
            });
        }
        oResponse.json({ data: oData });
    });
};

/**
 * Get Order Settings
 * Gets Delivery Fee
 */
exports.getOrderSettings = (oRequest, oResponse) => {
    oSettingModel
        .find()
        .select()
        .exec((oError, oData) => {
            if (oError) {
                return oResponse.status(400).json({
                    error: "Settings not found"
                });
            }
            oResponse.json({ data: oData });
        });
};

/**
 * Update Order Settings by Id
 * Status and History
 */
exports.updateOrderSettings = (oRequest, oResponse) => {
    oSettingModel.findOneAndUpdate(
        { _id: oRequest.setting._id },
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
 * Find Setting By Id
 */
exports.settingById = (oRequest, oResponse, oNext, sId) => {
    oSettingModel.findById(sId).exec((oError, oSetting) => {
      if (oError || !oSetting) {
        oResponse.status(400).json({
          error: "Setting not found"
        });
      }
      oRequest.setting = oSetting;
      oNext();
    });
};

/**
 * Set Customer Id
 */
exports.customerById = (oRequest, oResponse, oNext, sId) => {
    oRequest.customer_id = sId;
    oNext();
};

/**
 * Get orders with populated products by customer id
 */
exports.getOrderProductsByUser = (oRequest, oResponse) => {
    oOrderModel
    .find({
        'user': oRequest.customer_id
    })
    .select('createdAt')
    .populate("products.product", "product_name image")
    .sort([['createdAt', 'desc']])
    .exec((oError, oData) => {
        if (oError) {
            return oResponse.status(400).json({
                error: "No Orders for User"
            });
        }
        oResponse.json({
            data: oData
        });
    })
}