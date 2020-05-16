const oUserModel = require('../models/user');
const oCouponModel = require("../models/coupon");
const oProductModel = require('../models/product');
const oPaymayaModel = require('../models/paymaya');
const oOrderModel = require('../models/order');
const { errorHandler } = require("../helpers/dbErrorHandler");
const oUuidv1 = require("uuid/v1");
const oSdk = require('paymaya-node-sdk');
const { FRONT_DOMAIN } = require("../config");
const oPaymaya = oSdk.PaymayaSDK;
const oCheckout = oSdk.Checkout;
require('dotenv').config();

/**
 * Set to production if using production keys
 * Currently set to SANDBOX environment
 */
oPaymaya.initCheckout(
    process.env.PAYMAYA_PUBLIC_KEY,
    process.env.PAYMAYA_SECRET_KEY,
    oPaymaya.ENVIRONMENT.SANDBOX
);

/**
 * Paymaya WhiteList Servers
 */
const aPaymayaWhitelist = [
    '13.229.160.234',
    '3.1.199.75',
    '18.138.50.235',
    '3.1.207.200',
    '52.76.121.68'
];

/**
 * Paymaya Webhook
 * (Success, Fail, Dropout)
 * Record our not update during fail and dropout
 */
exports.implementWebhook = (oReq, oRes) => {
    var ip = (oReq.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
        oReq.connection.remoteAddress || 
        oReq.socket.remoteAddress || 
        oReq.connection.socket.remoteAddress;
    var bIp = aPaymayaWhitelist.indexOf(ip) === -1;
    if (bIp === true) {
        return oRes.status(403).json({
            data: 'Invalid Request. Not Authorized!',
            ip_address_1: ip,
            ip_address_2: oReq.connection.remoteAddress,
            ip_address_3: oReq.socket.remoteAddress,
            ip_address_4: oReq.connection.socket.remoteAddress,
        });
    }
    if (!oReq.body) {
        return oRes.status(400).json({
            data: 'Invalid Request. No Payload!'
        });
    }
    if (oReq.body.status === 'PAYMENT_FAILED' || oReq.body.status === 'PAYMENT_EXPIRED') {
        return oRes.status(200).json({
            data: 'Records Updated'
        });
    }
    return this.checkReferenceNumberOrderModel(oReq, oRes);
}

/**
 * Checks if reference number already exists in order database
 */
this.checkReferenceNumberOrderModel = (oReq, oRes) => {
    var oWebhook = oReq.body;
    var oBody = {
        reference_number : oWebhook.requestReferenceNumber
    };
    oOrderModel.find(oBody).exec((oError, aData) => {
        if (oError || aData.length === 0) {
            return this.checkReferenceNumberPaymayaModel(oReq, oRes, oBody);
        }
        return oRes.status(202).json({
            data: 'Transaction already updated'
        });
    });
};

/**
 * Checks if reference number exists in paymaya database
 */
this.checkReferenceNumberPaymayaModel = (oReq, oRes, oBody) => {
    var oPaymayaData = {
        referenceId : oBody.reference_number
    };
    oPaymayaModel.find(oPaymayaData).exec((oError, aData) => {
        if (oError || aData.length === 0) {
            return oRes.status(204).json({
                data: 'Transaction not found'
            });
        }
        return this.updateTransactionOrder(aData[0], oReq, oRes);
    });
}

/**
 * Checks paymaya data vs initial data
 */
this.updateTransactionOrder = (oData, oReq, oRes) => {
    var checkout = new oCheckout();
    checkout.id = oData.checkoutId;
    checkout.retrieve((oErrorCheckout, oResult) => {
        if (oErrorCheckout) {
            return oRes.status(400).json({
                error: oErrorCheckout
            });
        }
        if (oResult.paymentStatus === 'PAYMENT_SUCCESS') {
            return this.getUserDataWebhook(oReq, oRes, oResult, oData);
        }
        
        return oRes.status(400).json({
            error: 'payment status must be success'
        });
    });
}

/**
 * Gets User Data for webhook
 */
this.getUserDataWebhook = (oRequest, oResponse, oResult, oData) => {
    oUserModel.findById(oData.userId).exec((oError, oUserData) => {
        if (oError || !oUserData) {
          return oResponse.status(400).json({
            error: "User does not exist"
          });
        }
        oRequest.profile = oUserData;
        return this.insertOrderWebhook(oRequest, oResponse, oResult, oData);
    });
}

/**
 * Creates order from user after paymaya successful payment (webhook)
 */
this.insertOrderWebhook = (oReq, oRes, oResult, oData) => {
    this.updateCouponAndUser(oData.coupon_code, oReq.profile);
    var aItems = oResult.items;
    var oOrder = {
        user: oReq.profile._id,
        billing: oData.billing,
        shipping: oData.shipping, 
        transaction_id: oResult.paymentDetails.responses.efs.receipt.transactionId,
        amount: oResult.totalAmount.amount,
        discount_fee: oResult.totalAmount.details.discount,
        shipping_fee: oResult.totalAmount.details.shippingFee,
        reference_number: oResult.requestReferenceNumber,
        products: []
    }
    aItems.map((oItem, iIndex) => {
        var oSingleProduct = {
            product: oItem.code,
            price: parseInt(oItem.amount.value, 10),
            count: parseInt(oItem.quantity, 10)
        };
        oOrder.products.push(oSingleProduct); 
    });
    this.decreaseQuantity(oOrder.products);
    return this.createOrder(oOrder, oRes);
}

exports.initiateCheckout = (oReq, oRes) => {
    const sRequestId = oUuidv1();
    const oCustomer = oReq.body.customer;
    var checkout = new oCheckout();

    
    checkout.buyer = {
        "firstName": oCustomer.first_name,
        "lastName": oCustomer.last_name,
        "contact": {
          "phone": oCustomer.mobile_number,
          "email": oCustomer.email
        },
        "shippingAddress": {
          "line1": oReq.body.shipping_address,
          "countryCode": "PH"
        },
        "billingAddress": {
          "line1": oReq.body.billing_address,
          "countryCode": "PH"
        },
    };
    checkout.totalAmount = {
        "currency": "PHP",
        "value": oReq.body.amount,
        "details": {
            "discount": oReq.body.discount,
            "serviceCharge": "0",
            "shippingFee": oReq.body.shipping_fee,
            "tax": "0",
            "subtotal": oReq.body.amount - oReq.body.shipping_fee
        }
    };
    checkout.requestReferenceNumber = sRequestId;
    const aProduct = oReq.body.products;
    const aItem = [];
    aProduct.map((oProduct, iIndex) => {
        var oSingleProduct = {
            name : oProduct.name,
            code : oProduct.id,
            description : oProduct.description,
            quantity: oProduct.count,
            amount : {
                value : oProduct.price,
                details : {
                    discount : "0",
                    subtotal : oProduct.price
                }
            },
            totalAmount : {
                value : oProduct.price * oProduct.count,
                details : {
                    discount : "0",
                    subtotal : oProduct.price * oProduct.count
                }
            }
        }
        aItem.push(oSingleProduct);
    });
    checkout.items = aItem;
    var oData = {
        "success": `${FRONT_DOMAIN}/payment/paymaya/${oReq.profile._id}/${sRequestId}/success?bData=${oReq.body.bBuyNow}&oBilling=${oReq.body.billing}&oShipping=${oReq.body.shipping}&coupon_code=${oReq.body.coupon_code}`,
        "failure": `${FRONT_DOMAIN}/payment/paymaya/${oReq.profile._id}/${sRequestId}/failure`,
        "cancel" : `${FRONT_DOMAIN}/payment/paymaya/${oReq.profile._id}/${sRequestId}/cancel`
    }
    checkout.redirectUrl = oData;
    checkout.execute(function (error, response) {
        if (error) {
            oRes.status(500).json(error);
        } else {
            const oModel = {
                'referenceId' : sRequestId,
                'checkoutId'  : response.checkoutId,
                'userId'      : oReq.profile._id,
                'coupon_code' : oReq.body.coupon_code,
                'billing'     : JSON.parse(Buffer.from(oReq.body.billing, 'base64').toString()),
                'shipping'    : JSON.parse(Buffer.from(oReq.body.shipping, 'base64').toString())
            };
            const oCreate = new oPaymayaModel(oModel);
            oCreate.save((oError, oData) => {
                if (oError) {
                    return oRes.status(400).json({
                        error: errorHandler(oError)
                    });
                }
                return oRes.json({
                    data: response
                });
            });
            
        }
    });

}

exports.retrieveCheckout = (oReq, oRes) => {
    const oBody = {
        'referenceId' : oReq.query.sRequestId,
        'userId'      : oReq.profile._id
    };
    oPaymayaModel.find(oBody).exec((oError, aData) => {
        if (oError || !aData) {
            return oRes.status(400).json({
              error: "Transaction not found"
            });
        }
        return this.checkTransactionOrder(aData[0], oReq, oRes);
    });
};

this.retrieveDetails = (oData, oReq, oRes) => {
    var checkout = new oCheckout();
    checkout.id = oData.checkoutId;
    checkout.retrieve((oErrorCheckout, oResult) => {
        if (oErrorCheckout) {
            return oRes.status(400).json({
                error: oErrorCheckout
            });
        }
        if (oResult.paymentStatus === 'PAYMENT_SUCCESS') {
            return this.insertOrder(oReq, oRes, oResult);
        }
        
        return oRes.status(400).json({
            error: 'payment_failed'
        });
    });
}

this.checkTransactionOrder = (oData, oRequest, oResponse) => {
    const oBody = {
        reference_number: oData.referenceId,
        user            : oData.userId 
    }
    oOrderModel.find(oBody).exec((oError, aData) => {
        if (oError || aData.length === 0) {
            return this.retrieveDetails(oData, oRequest, oResponse);
        }
        return oResponse.json({ data: aData[0] });
    });
}

/**
 * Updates coupon and saves user
 * Gets user info first and inputs email address 
 */
this.updateCouponAndUser = (sCoupon, oUser) => {
    if (sCoupon && oUser.verified_email === true) {
        oCouponModel.findOneAndUpdate(
            { coupon_code : sCoupon },
            { $set: { 
                status  : false,
                used_by : oUser.email 
              } 
            },
            (oError, oData) => {
                
            }
        )
    }
}
/**
 * Creates order from user after paymaya payment
 */
this.insertOrder = (oReq, oRes, oResult) => {
    this.updateCouponAndUser(oReq.body.coupon_code, oReq.profile);
    var aItems = oResult.items;
    var oOrder = {
        user: oReq.profile._id,
        billing: oReq.body.oBilling,
        shipping: oReq.body.oShipping, 
        transaction_id: oResult.paymentDetails.responses.efs.receipt.transactionId,
        amount: oResult.totalAmount.amount,
        discount_fee: oResult.totalAmount.details.discount,
        shipping_fee: oResult.totalAmount.details.shippingFee,
        reference_number: oResult.requestReferenceNumber,
        products: []
    }
    aItems.map((oItem, iIndex) => {
        var oSingleProduct = {
            product: oItem.code,
            price: parseInt(oItem.amount.value, 10),
            count: parseInt(oItem.quantity, 10)
        };
        oOrder.products.push(oSingleProduct); 
    });
    this.decreaseQuantity(oOrder.products);
    return this.createOrder(oOrder, oRes);
}


this.createOrder = (oCreate , oResponse) => {
    oCreate.history = {
        status: 'Not Processed', 
        note: 'Order created'
    };
    const oOrder = new oOrderModel(oCreate);
    oOrder.save((oError, oData) => {
        if (oError) {
            return oResponse.status(400).json({
                error: oError
            });
        }
        return oResponse.json({ data: oData });
    });
};

this.decreaseQuantity = (aProduct) => {
    let oBulkOps = aProduct.map((oItem) => {
        return {
            updateOne: {
                filter: {_id: oItem.product},
                update: {$inc: {stock: -oItem.count, sold: +oItem.count}}
            }
        };
    });

    oProductModel.bulkWrite(oBulkOps, {}, (oError, oProduct) => {
        if (oError) {
            console.log(oError);
        }
    });
};
