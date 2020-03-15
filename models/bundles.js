/**
 * Titan Ecommerce (Server)
 * models/bundles.js
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 01/12/2020
 * @version 1.0
 */

const oMongoose = require("mongoose");
const { ObjectId } = oMongoose.Schema;

const oBundledProductsSchema = new oMongoose.Schema(
    {
        product: { 
            type: ObjectId,
            ref: "Product",
            required: true
        }
    },
    { _id : false }
);

const oBundleSchema = new oMongoose.Schema(
    {
        products: {
            type: [oBundledProductsSchema],
            required: true
        },
        bundle_name: {
            type: String,
            trim: true,
            required: true
        },
        bundle_description: {
            type: String,
            trim: true,
            required: true
        },
        bundle_thumbnail: {
            type: String,
            trim: true,
            required: true
        },
        bundle_sold: {
            type: Number,
            default: 0
        },
        bundle_price: {
            type: Number,
            required: true
        },
        bundle_stock: {
            type: Number,
            required: true
        },
        bundle_display: {
            type: String,
            enum: ['T', 'F'],
            default: 'F'
        },
        bundle_sold_out: {
            type: String,
            enum: ['T', 'F'],
            default: 'F'
        }
    },
    { timestamps: true }
);
  
module.exports = oMongoose.model("Bundles", oBundleSchema);
  