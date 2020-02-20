/**
 * Titan Ecommerce (Server)
 * models/shipper.js
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 12/06/2019
 * @version 1.0
 */

const oMongoose = require("mongoose");

const oShipperSchema = new oMongoose.Schema(
    {
        shipper_name: {
            type: String,
            trim: true,
            required: true
        },
        contact_person: {
            type: String,
            trim: true,
            required: true
        },
        contact_number: {
            type: String,
            trim: true,
            required: true
        },
        shipper_address: {
            type: String,
            trim: true,
            required: true
        },
        shipper_website: {
            type: String,
            trim: true,
            required: true
        }
    },
    { timestamps: true }
);
  
module.exports = oMongoose.model("Shipper", oShipperSchema);
  