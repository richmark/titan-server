/**
 * Titan Ecommerce (Server)
 * models/paymaya.js
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 01/07/2020
 * @version 1.0
 */

const oMongoose = require("mongoose");

const oOrderedDetailsSchema = new oMongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        contact: {
            type: String,
            default: false
        }
    },
    { _id : false }
);

const oPaymayaSchema = new oMongoose.Schema(
    {
        checkoutId: {
            type: String,
            required: true
        },
        referenceId: {
            type: String,
            required: true
        },
        userId: {
            type: String,
            required: true
        },
        billing: {
            type: [oOrderedDetailsSchema],
            required: true
        },
        shipping: {
            type: [oOrderedDetailsSchema],
            required: true
        },
        coupon_code: {
            type: String,
            trim: true,
            maxLength: 24,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: '120m'
        }
    },
    { timestamps: true }
);
  
module.exports = oMongoose.model("PaymayaCheckout", oPaymayaSchema);
  