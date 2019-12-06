/**
 * Titan Ecommerce (Server)
 * models/order.js
 * @author Richamrk Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 12/06/2019
 * @version 1.0
 */

const oMongoose = require("mongoose");

const oOrderedProductSchema = new oMongoose.Schema(
    {
        product: { 
            type: ObjectId,
            ref: 'Product',
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        count: {
            type: Number,
            required: true
        }
    }
);

module.exports = oMongoose.model("OrderedProduct", oOrderedProductSchema);

const oOrderSchema = new oMongoose.Schema(
  {
    user: {
        type: ObjectId,
        ref: "User",
        required: true
    },
    shipper: {
        type: ObjectId,
        ref: "Shipper",
        required: true
    },
    status: {
        type: String,
        required: true
    },
    transaction_id: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    products: {
        type: [oOrderedProductSchema],
        required: true
    },
    history: {
        type: [{
            status: {
                type: String,
                required: true
            },
            note: {
                type: String,
                required: true
            },
            process_time: {
                type: Date,
                default: Date.now
            }
        }],
        default: []
    },
    order_address: {
        type: String,
        trim: true,
        required: true,
        maxLength: 255
    }
  },
  { timestamps: true }
);

module.exports = oMongoose.model("Order", oOrderSchema);
