const oUserModel = require('../models/user');
const oPaymayaModel = require('../models/paymaya');
const oOrderModel = require('../models/order');
const oUuidv1 = require("uuid/v1");
const oSdk = require('paymaya-node-sdk');
const { FRONT_DOMAIN } = require("../config");
const oPaymaya = oSdk.PaymayaSDK;
const oCheckout = oSdk.Checkout;
require('dotenv').config();

oPaymaya.initCheckout(
    process.env.PAYMAYA_PUBLIC_KEY,
    process.env.PAYMAYA_SECRET_KEY,
    oPaymaya.ENVIRONMENT.SANDBOX
);


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
          "line1": oReq.body.order_address,
          "countryCode": "PH"
        },
        "billingAddress": {
          "line1": oReq.body.order_address,
          "countryCode": "PH"
        },
    };
    checkout.totalAmount = {
        "currency": "PHP",
        "value": oReq.body.amount,
        "details": {
            "discount": "0",
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
        "success": `${FRONT_DOMAIN}/payment/paymaya/${oReq.profile._id}/${sRequestId}/success`,
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
                'userId'      : oReq.profile._id
            };
            const oCreate = new oPaymayaModel(oModel);
            oCreate.save((oError, oData) => {
                if (oError) {
                    return oResponse.status(400).json({
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

this.insertOrder = (oReq, oRes, oResult) => {
    var aItems = oResult.items;
    var oOrder = {
        user: oReq.profile._id,
        order_address: oResult.buyer.shippingAddress.line1,
        transaction_id: oResult.paymentDetails.responses.efs.receipt.transactionId,
        amount: oResult.totalAmount.amount,
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
    return this.createOrder(oOrder, oRes);
}

this.createOrder = (oCreate , oResponse) => {
    const oOrder = new oOrderModel(oCreate);
    oOrder.save((oError, oData) => {
        if (oError) {
            return oResponse.status(400).json({
                error: errorHandler(oError)
            });
        }
        return oResponse.json({ data: oData });
    });
};
