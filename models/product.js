const oMongoose = require("mongoose");
const { ObjectId } = oMongoose.Schema;

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
      ref: "Category",
      required: true
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
      enum: ['T', 'F'],
      default: 'T'
    },
    sold_out: {
      type: String,
      enum: ['T', 'F'],
      default: 'F'
    },
    brand: {
      type: String,
      enum: ['Yojimbo', 'Titan'],
      default: 'Titan'
    }
  },
  { timestamps: true }
);

module.exports = oMongoose.model("Product", oProductSchema);
