/**
 * Titan Ecommerce (Server)
 * models/paymaya.js
 * @author Richamrk Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 01/07/2020
 * @version 1.0
 */

const oMongoose = require("mongoose");

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
        createdAt: {
            type: Date,
            default: Date.now,
            expires: '60m'
        }
    },
    { timestamps: true }
);
  
module.exports = oMongoose.model("PaymayaCheckout", oPaymayaSchema);
  