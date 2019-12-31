/**
 * Titan Ecommerce (Server)
 * models/order.js
 * @author Richamrk Jinn Ravina <richmark.jinn.ravina@gmail.com>
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
            default: false,
            required: true
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
        type: String,
        default: 'Basic Shipper'
        // type: ObjectId,
        // ref: 'Shipper',
        // required: true
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
        type: [oOrderedProductSchema],
        required: true
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
    order_address: {
        type: String,
        trim: true,
        required: true,
        maxLength: 255
    },
    shipping_fee: {
        type: Number
    }, 
  },
  { timestamps: true }
);

module.exports = oMongoose.model('Order', oOrderSchema);
