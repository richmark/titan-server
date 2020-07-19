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
    coupon_type: {
      type: String,
      trim: true,
      required: true
    },
    description: {
      type: String,
      required: true,
      maxLength: 100
    },
    discount: {
      type: String,
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
    used_by: {
      type: String,
      default: "Unused"
    },
    status: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = oMongoose.model("Coupon", oCouponSchema);
