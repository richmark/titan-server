/**
 * Titan Ecommerce (Server)
 * models/category.js
 * @author Jon Aguilar <jjaguilar08@gmail.com>
 * @date 11/18/2019
 * @version 1.0
 */

const oMongoose = require("mongoose");

const oLevelSchema = new oMongoose.Schema(
  {
    level: {
      type: String,
      trim: true,
      required: true,
      maxLength: 32,
      unique: true
    },
    price_threshhold: {
      type: Number,
      default: 0
    },
    percent_discount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = oMongoose.model("Level", oLevelSchema);
