const oMongoose = require("mongoose");
const { ObjectId } = oMongoose.Schema;

const oBundledProductsSchema = new oMongoose.Schema(
  {
    product: {
      type: ObjectId,
      ref: "Product"
    }
  },
  { _id: false }
);

/**
 * Delivery Price per Product
 * Price is based on location
 */
const oDeliveryPriceSchema = new oMongoose.Schema(
  {
    metro_manila: {
      type: Number,
      required: true
    },
    luzon: {
      type: Number,
      required: true
    },
    visayas: {
      type: Number,
      required: true
    },
    mindanao: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const oProductSchema = new oMongoose.Schema(
  {
    product_name: {
      type: String,
      trim: true,
      required: true,
      maxLength: 32
    },
    price: {
      type: Number,
      required: true
    },
    stock: {
      type: Number,
      default: 0
    },
    category: {
      type: ObjectId,
      ref: "Category"
    },
    description: {
      type: String,
      required: true,
      maxLength: 2000
    },
    image: {
      type: String,
      trim: true,
      required: true,
      maxLength: 100
    },
    additional_images: {
      type: [String]
    },
    sold: {
      type: Number,
      default: 0
    },
    additional_info: {
      type: Array,
      default: []
    },
    display: {
      type: String,
      enum: ["T", "F"],
      default: "T"
    },
    sold_out: {
      type: String,
      enum: ["T", "F"],
      default: "F"
    },
    display_sale: {
      type: String,
      enum: ["T", "F"],
      default: "F"
    },
    discount_sale: {
      type: Number,
      default: 0
    },
    brand: {
      type: String
    },
    bundle_product: {
      type: [oBundledProductsSchema]
    },
    delivery_price: {
      type: oDeliveryPriceSchema
    }
  },
  { timestamps: true }
);

module.exports = oMongoose.model("Product", oProductSchema);
