const oUserModel = require('../models/user');
const oSdk = require('paymaya-node-sdk');
const oPaymaya = oSdk.PaymayaSDK;
const oCheckout = oSdk.Checkout;
const oContact = oSdk.Contact;
const oAddress = oSdk.Address;
const oBuyer = oSdk.Buyer;
const oItemAmountDetails = oSdk.ItemAmountDetails;
const oItemAmount = oSdk.ItemAmount;
const oItem = oSdk.Item;
const YOUR_REQUEST_REFERENCE_NUMBER = "123456789";
require('dotenv').config();

oPaymaya.initCheckout(
    process.env.PAYMAYA_PUBLIC_KEY,
    process.env.PAYMAYA_SECRET_KEY,
    oPaymaya.ENVIRONMENT.SANDBOX
);


exports.initiateCheckout = (oReq, oRes) => {
    var checkout = new oCheckout();

    var addressOptions = {
        line1 : "9F Robinsons Cybergate 3",
        line2 : "Pioneer Street",
        city : "Mandaluyong City",
        state : "Metro Manila",
        zipCode : "12345",
        countryCode : "PH"
    };
  
    var contactOptions = {
        phone : "+63(2)1234567890",
        email : "paymayabuyer1@gmail.com"
    };
    
    var buyerOptions = {
        firstName : "John",
        middleName : "Michaels",
        lastName : "Doe"
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
        code: "pm_belt",
        description: "Medium-sv"
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
    itemOptions.amount = itemAmount;
    itemOptions.totalAmount = itemAmount;
    
    /**
     * Contruct item here
     */
    var item = new oItem();
    item.name = itemOptions.name;
    item.code = itemOptions.code;
    item.description = itemOptions.description;
    item.amount = itemOptions.amount;
    item.totalAmount = itemOptions.totalAmount;
    
    // Add all items here
    var items = [];
    items.push(item);
    
    checkout.buyer = buyer;
    checkout.totalAmount = itemOptions.totalAmount;
    checkout.requestReferenceNumber = YOUR_REQUEST_REFERENCE_NUMBER;
    checkout.items = items;
    console.log(JSON.stringify(checkout));
    checkout.execute(function (error, response) {
        if (error) {
            oRes.status(500).json(error);
        } else {
            return oRes.json({
                data: response,
                state: checkout
            }); 
        }
    });

}
