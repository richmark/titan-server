const oUserModel = require('../models/user');
const oPaymayaModel = require('../models/paymaya');
const oUuidv1 = require("uuid/v1");
const oSdk = require('paymaya-node-sdk');
const oPaymaya = oSdk.PaymayaSDK;
const oCheckout = oSdk.Checkout;
const oContact = oSdk.Contact;
const oAddress = oSdk.Address;
const oBuyer = oSdk.Buyer;
const oItemAmountDetails = oSdk.ItemAmountDetails;
const oItemAmount = oSdk.ItemAmount;
const oItem = oSdk.Item;
const sRequestId = oUuidv1();
require('dotenv').config();

oPaymaya.initCheckout(
    process.env.PAYMAYA_PUBLIC_KEY,
    process.env.PAYMAYA_SECRET_KEY,
    oPaymaya.ENVIRONMENT.SANDBOX
);


exports.initiateCheckout = (oReq, oRes) => {
    console.log(oReq.body);
    const oCustomer = oReq.body.customer;
    var checkout = new oCheckout();

    var addressOptions = {
        line1 : oReq.body.order_address,
        line2 : "",
        city : "",
        state : "",
        zipCode : "",
        countryCode : "PH"
    };
  
    var contactOptions = {
        phone : oCustomer.mobile_number,
        email : oCustomer.email
    };
    
    var buyerOptions = {
        firstName : oCustomer.first_name,
        middleName : "",
        lastName : oCustomer.last_name
    };
        
    var contact = new oContact();
    contact.phone = contactOptions.phone;
    contact.email = contactOptions.email;
    buyerOptions.contact = contact;
    
    var address = new oAddress();
    address.line1 = addressOptions.line1;
    address.line2 = addressOptions.line2;
    address.city = addressOptions.city;
    address.state = addressOptions.state;
    address.zipCode = addressOptions.zipCode;
    address.countryCode = addressOptions.countryCode;
    buyerOptions.shippingAddress = address;
    buyerOptions.billingAddress = address;
                
    /**
     * Construct buyer here
     */
    var buyer = new oBuyer();
    buyer.firstName = buyerOptions.firstName;
    buyer.middleName = buyerOptions.middleName;
    buyer.lastName = buyerOptions.lastName;
    buyer.contact = buyerOptions.contact;
    buyer.shippingAddress = buyerOptions.shippingAddress;
    buyer.billingAddress = buyerOptions.billingAddress;
    
    
    var itemAmountDetailsOptions = {
        shippingFee: "14.00",
        tax: "5.00",
        subTotal: "50.00" 
    };
    
    var itemAmountOptions = {
        currency: "PHP",
        value: "69.00"
    };
    
    var itemOptions = {
        name: "Leather Belt",
        quantity: "32",
        code: "pm_belt",
        description: "Medium-sv",
        amount: "32",
        totalAmount: "100"
    };
    
    var itemAmountDetails = new oItemAmountDetails();
    itemAmountDetails.shippingFee = itemAmountDetailsOptions.shippingFee;
    itemAmountDetails.tax = itemAmountDetailsOptions.tax;
    itemAmountDetails.subTotal = itemAmountDetailsOptions.subTotal;
    itemAmountOptions.details = itemAmountDetails;
    
    var itemAmount = new oItemAmount();
    itemAmount.currency = itemAmountOptions.currency;
    itemAmount.value = itemAmountOptions.value;
    itemAmount.details = itemAmountOptions.details;
    console.log(itemAmount, '<----CHECK');
    itemOptions.amount = {
        currency: "PHP",
        value : "100000"
    };
    itemOptions.totalAmount = itemAmount;
    
    /**
     * Contruct item here
     */
    var item = new oItem();
    item.name = itemOptions.name;
    item.code = itemOptions.code;
    item.description = itemOptions.description;
    item.quantity = itemOptions.quantity;
    item.amount = itemOptions.amount;
    item.totalAmount = itemOptions.totalAmount;
    
    // Add all items here
    var items = [];
    items.push(item);
    
    checkout.buyer = buyer;
    checkout.totalAmount = itemOptions.totalAmount;
    checkout.requestReferenceNumber = sRequestId;
    checkout.items = items;
    var oData = {
        "success": `http://localhost:8000/api/v1/paymaya/retrieveCheckout/${oReq.profile._id}?sRequestId=${sRequestId}`,
        "failure": "https://www.facebook.com",
        "cancel" : "https://www.yahoo.com"
    }
    checkout.redirectUrl = oData;
    console.log(checkout);
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
                    data: response,
                    state: checkout
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
    oPaymayaModel.find(oBody).exec((oError, oData) => {
        if (oError || !oData) {
            return oResponse.status(400).json({
              error: "Transaction not found"
            });
        }
        return oRes.json({
            data : oData
        });
    });
};
