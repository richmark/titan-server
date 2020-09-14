/**
 * Titan Ecommerce (Server)
 * models/sidebanner.js
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 08/07/2020 7:45 PM
 * @version 1.0
 */

const oMongoose = require("mongoose");

const oSideBannerSchema = new oMongoose.Schema(
    {
        side_banner_image: {
            type: String,
            trim: true,
            required: true
        },
        side_banner_link: {
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
  
module.exports = oMongoose.model("SideBanner", oSideBannerSchema);