/**
 * Titan Ecommerce (Server)
 * models/category.js
 * @author Jon Aguilar <jjaguilar08@gmail.com>
 * @date 11/18/2019
 * @version 1.0
 */

const oMongoose = require("mongoose");

const oCategorySchema = new oMongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxLength: 32,
      unique: true
    },
    category_image: {
      type: String,
      trim: true,
      required: true,
      maxLength: 100
    }
  },
  { timestamps: true }
);

module.exports = oMongoose.model("Category", oCategorySchema);
