/**
 * Titan Ecommerce (Server)
 * models/review.js
 * @author Richamrk Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 12/30/2019
 * @version 1.0
 */

const oMongoose = require("mongoose");
const { ObjectId } = oMongoose.Schema;

const oReviewSchema = new oMongoose.Schema(
    {
        user: {
            type: ObjectId,
            ref: 'User',
            required: true
        },
        product: {
            type: ObjectId,
            ref: 'Product',
            required: true
        },
        comment: {
            type: String,
            trim: true,
            required: true
        },
        rate: {
            type: Number,
            trim: true,
            required: true
        },
        visibility: {
            type: Boolean,
            default: false,
            required: true
        }
    },
    { timestamps: true }
);
  
module.exports = oMongoose.model("Review", oReviewSchema);
