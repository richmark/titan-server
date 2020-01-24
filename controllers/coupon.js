/**
 * Titan Ecommerce (Server)
 * controllers/product.js
 * @author Jon Aguilar <jjaguilar08@gmail.com>
 * @date 11/18/2019
 * @version 1.0
 */

const oCouponModel = require("../models/coupon");
const { errorHandler } = require("../helpers/dbErrorHandler");

/**
 * Create Coupon Function
 * This function creates coupon
 */
exports.createCoupon = (oRequest, oResponse) => {
  const oCategory = new oCouponModel(oRequest.body);
  oCategory.save((oError, oData) => {
    if (oError) {
      return oResponse.status(400).json({
        error: errorHandler(oError)
      });
    }
    oResponse.json({ data: oData });
  });
};

/**
 * Coupon by ID middleware
 * This middle gets coupon by ID
 */
exports.couponById = (oRequest, oResponse, oNext, sId) => {
  oCouponModel.findById(sId).exec((oError, oCoupon) => {
    if (oError || !oCoupon) {
      return oResponse.status(400).json({
        error: "Coupon does not exist!"
      });
    }
    oRequest.coupon = oCoupon;
    oNext();
  });
};

/**
 * Coupon by Code middleware
 * This middle gets coupon by code
 */
exports.couponByCode = (oRequest, oResponse, oNext, sCode) => {
  oCouponModel.find({ coupon_code: sCode }).exec((oError, oCoupon) => {
    if (oError || !oCoupon) {
      return oResponse.status(400).json({
        error: "Coupon does not exist!"
      });
    }
    oRequest.coupon = oCoupon;
    oNext();
  });
};

/**
 * Coupon Search
 * This function searches through the coupon table
 */
exports.couponSearch = (oRequest, oResponse) => {
  let queryString = oRequest.body.query;
  oCouponModel
    .find({
      $or: [
        {
          coupon_name: { $regex: queryString }
        },
        {
          coupon_code: { $regex: queryString }
        },
        {
          description: { $regex: queryString }
        },
        {
          coupon_type: { $regex: queryString }
        }
      ]
    })
    .exec((oError, oCoupon) => {
      if (oError || !oCoupon) {
        return oResponse.status(400).json({
          error: "Coupon does not exist!"
        });
      }
      oResponse.json({ data: oCoupon });
    });
};

/**
 * getCoupon function
 * this function gets coupon by ID
 */
exports.getCoupon = (oRequest, oResponse) => {
  return oResponse.json({ data: oRequest.coupon });
};

/**
 * countCoupon function
 * this function gets the count of all products inserted
 */
exports.countCoupon = (oRequest, oResponse) => {
  oCouponModel.countDocuments().exec((oError, iCount) => {
    if (oError) {
      return oResponse.status(400).json({
        error: "Something went wrong!"
      });
    }

    oResponse.json({ data: { count: iCount } });
  });
};

/**
 * List Coupon Function
 * This function lists coupon with search filters.
 */
exports.listCoupon = (oRequest, oResponse) => {
  let sOrder = oRequest.query.order ? oRequest.query.order : "asc";
  let sSortBy = oRequest.query.sortBy ? oRequest.query.sortBy : "_id";
  let iLimit = oRequest.query.limit ? parseInt(oRequest.query.limit, 10) : 6;
  let iOffset = oRequest.query.offset ? parseInt(oRequest.query.offset, 10) : 0;

  oCouponModel
    .find()
    .select()
    .sort([[sSortBy, sOrder]])
    .limit(iLimit)
    .skip(iOffset)
    .exec((oError, oData) => {
      if (oError) {
        return oResponse.status(400).json({
          error: "Products not found"
        });
      }
      oResponse.json({ data: oData });
    });
};

/**
 * update coupon function
 * updates coupon
 */
exports.updateCoupon = (oRequest, oResponse) => {
  oCouponModel.findOneAndUpdate(
    { _id: oRequest.coupon._id },
    { $set: oRequest.body },
    { new: true },
    (oError, oData) => {
      if (oError) {
        return oResponse.status(400).json({
          error: errorHandler(oError)
        });
      }
      oResponse.json({ data: oData });
    }
  );
};

/**
 * deleteCoupon function
 * deletes coupon
 */
exports.deleteCoupon = (oRequest, oResponse) => {
  const oCoupon = oRequest.coupon;
  oCoupon.remove(oError => {
    if (oError) {
      return oResponse.status(400).json({
        error: errorHandler(oError)
      });
    }
    oResponse.json({
      message: "Coupon deleted!"
    });
  });
};
