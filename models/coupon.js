/**
 * Titan Ecommerce (Server)
 * models/category.js
 * @author Jon Aguilar <jjaguilar08@gmail.com>
 * @date 11/18/2019
 * @version 1.0
 */

const oMongoose = require("mongoose");

const oCouponSchema = new oMongoose.Schema(
  {
    coupon_name: {
      type: String,
      trim: true,
      required: true,
      maxLength: 32
    },
    coupon_code: {
      type: String,
      trim: true,
      required: true,
      maxLength: 24,
      unique: true
    },
    description: {
      type: String,
      required: true,
      maxLength: 100
    },
    discount: {
      type: Number,
      required: true
    },
    start_date: {
      type: Date,
      required: true
    },
    end_date: {
      type: Date,
      required: true
    },
    status: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = oMongoose.model("Coupon", oCouponSchema);
