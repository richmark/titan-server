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
    sold: {
      type: Number,
      default: 0
    },
    additional_info: {
      type: Array,
      default: []
    }
  },
  { timestamps: true }
);

module.exports = oMongoose.model("Product", oProductSchema);
