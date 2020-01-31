/**
 * Titan Ecommerce (Server)
 * models/bundles.js
 * @author Richamrk Jinn Ravina <richmark.jinn.ravina@gmail.com>
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
        },
        count: {
            type: Number,
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
        discount_type: {
            type: String,
            trim: true,
            required: true
        },
        discount_value: {
            type: String,
            trim: true,
            required: true
        }
    },
    { timestamps: true }
);
  
module.exports = oMongoose.model("Bundles", oBundleSchema);
  