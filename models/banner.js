/**
 * Titan Ecommerce (Server)
 * models/banner.js
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 02/10/2020 7:26 PM
 * @version 1.0
 */

const oMongoose = require("mongoose");

const oBannerSchema = new oMongoose.Schema(
    {
        banner_image: {
            type: String,
            trim: true,
            required: true
        },
        banner_link: {
            type: String,
            trim: true,
            required: true
        },
        visibility: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);
  
module.exports = oMongoose.model("Banner", oBannerSchema);