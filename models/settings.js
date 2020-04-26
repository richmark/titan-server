/**
 * Titan Ecommerce (Server)
 * models/order.js
 * @author Carlo Barcena <cbarcena20@gmail.com>
 * @date 04/26/2020
 * @version 1.0
 */

const oMongoose = require('mongoose');

const oSettingsSchema = new oMongoose.Schema(
    {
        delivery_fee: {
            type: Number,
            required: true
        }
    },
    { timestamps: true }
);

module.exports = oMongoose.model('Settings', oSettingsSchema);
