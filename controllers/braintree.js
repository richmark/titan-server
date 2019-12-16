const oUserModel = require('../models/user');
const oBraintree = require('braintree');
require('dotenv').config();

const oGateway = oBraintree.connect({
    environment: oBraintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY
});

exports.generateToken = (oReq, oRes) => {
    oGateway.clientToken.generate({}, function(oError, oData) {
        if (oError) {
            oRes.status(500).json(oError);
        } else {
            return oRes.json({
               data: oData
            }); 
        }
    });
};

exports.processPayment = (oReq, oRes) => {
    let oNonceFromTheClient = oReq.body.paymentMethodNonce;
    let iAmountFromTheClient = oReq.body.amount;

    // charge the user
    let oNewTransaction = oGateway.transaction.sale({
        amount: iAmountFromTheClient,
        paymentMethodNonce: oNonceFromTheClient,
        options: {
            submitForSettlement: true
        }
    }, (oError, oResult) => {
        if (oError) {
            return oRes.status(500).json(oError);
        } else {
            return oRes.json({
                data: oResult
            });
        }
    });
};