/**
 * Titan Ecommerce (Server)
 * models/order.js
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 12/06/2019
 * @version 1.0
 */

const oMongoose = require('mongoose');
const { ObjectId } = oMongoose.Schema;

const oOrderedProductSchema = new oMongoose.Schema(
    {
        product: { 
            type: ObjectId,
            ref: "Product",
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        count: {
            type: Number,
            required: true
        },
        reviewed: {
            type: Boolean,
            default: false
        },
        bundled: {
            type: Boolean,
            default: false
        }
    },
    { _id : false }
);

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

module.exports = oMongoose.model('OrderedProduct', oOrderedProductSchema);

const oOrderSchema = new oMongoose.Schema(
  {
    user: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    shipper: {
        type: ObjectId, // objectId without required field and default value
        ref: 'Shipper'
    },
    status: {
        type: String,
        default: 'Not Processed',
        enum: ['Not Processed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
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
        type: [oOrderedProductSchema]
    },
    history: {
        type: [
            {
                status: {
                    type: String,
                    default: 'Not Processed',
                    enum: ['Not Processed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
                },
                note: {
                    type: String
                },
                process_time: {
                    type: Date,
                    default: Date.now
                },
                _id : false
            }
        ],
        default: [
            {
                status: 'Not Processed',
                note: 'Order created',
                process_time: Date.now()
            }
        ]
    },
    billing: {
        type: [oOrderedDetailsSchema],
        required: true
    },
    shipping: {
        type: [oOrderedDetailsSchema],
        required: true
    },
    shipping_fee: {
        type: Number
    },
    discount_fee: {
        type: Number,
        default: 0
    },
    reference_number: {
        type: String,
    },
    tracking_number: { // manual input from client
        type: String,
        default: ''
    }
  },
  { timestamps: true }
);

module.exports = oMongoose.model('Order', oOrderSchema);
