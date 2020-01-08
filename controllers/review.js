/**
 * Titan Ecommerce (Server)
 * controllers/review.js
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 12/30/2019
 * @version 1.0
 */

const oReviewModel = require("../models/review");
const oOrderModel = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");

/**
 * listReview function
 * gets list of all reviews
 */
exports.listReviews = (oRequest, oResponse) => {
    const iLimit = oRequest.query.limit ? parseInt(oRequest.query.limit, 10) : 6;
    const sOrder = oRequest.query.order ? oRequest.query.order : 'desc';
    const skip = parseInt(oRequest.query.skip);
    const oArgs = oRequest.product ? { product: oRequest.product._id } : {};

    oReviewModel
    .find(oArgs)
    .limit(iLimit)
    .populate("user", "_id email") // first or last name
    .sort([['_id', sOrder]])
    .skip(skip)
    .exec((oError, oData) => {
        if (oError) {
            return oResponse.status(400).json({
                error: errorHandler(oError)
            });
        }
        oResponse.json({ data: oData });
    });
};

/**
 * checkReview function
 * check if ordered product is reviewed
 */
exports.checkReview = (oRequest, oResponse) => {
    const sProductId = JSON.stringify(oRequest.product._id);
    const sIndex = oRequest.order.products.findIndex(oElement => JSON.stringify(oElement.product) === sProductId);

    if (sIndex < 0 || oRequest.order.products[sIndex].reviewed === true) {
        return oResponse.status(400).json({
            error: "Error creating review"
        });
    }
    oRequest.order.products[sIndex].reviewed = true;
    this.createReview(oRequest, oResponse);
};

/**
 * createReview function
 * create review of a certain ordered product
 */
this.createReview = (oRequest, oResponse) => {
    oRequest.body.user = oRequest.profile._id;
    oRequest.body.product = oRequest.product._id;
    const oReview = new oReviewModel(oRequest.body);
    oReview.save((oError, oData) => {
        if (oError) {
            return oResponse.status(400).json({
                error: errorHandler(oError)
            });
        }
        oRequest.review = oData;
        this.updateOrderedProducts(oRequest, oResponse);
    });
};

/**
 * updateOrderedProducts
 * after checking review, update ordered product reviewed field to true
 */
this.updateOrderedProducts = (oRequest, oResponse) => {
    oOrderModel.findOneAndUpdate(
        { _id: oRequest.order._id },
        { $set: oRequest.order },
        { new: true },
        (oError, oData) => {
          if (oError) {
            return oResponse.status(400).json({
              error: errorHandler(oError)
            });
          }
          oResponse.json({ data: oRequest.review });
        }
    )
};

/**
 * updateReview
 * request body depends on admin data
 */
exports.updateReview = (oRequest, oResponse) => {
    oReviewModel.findOneAndUpdate(
        { _id: oRequest.review._id},
        { $set: oRequest.body },
        { new: true},
        (oError, oData) => {
            if (oError) {
                return oResponse.status(400).json({
                    error: errorHandler(oError)
                });
            }
            oResponse.json({data: oData});
        }
    );
}

/**
 * reviewById
 * checks if review exists by id
 */
exports.reviewById = (oRequest, oResponse, oNext, sId) => {
    oReviewModel
    .findById(sId)
    .select()
    .exec((oError, oReview) => {
        if (oError || !oReview) {
            oResponse.status(400).json({
                error: "Review not found"
            });
        }
        oRequest.review = oReview;
        oNext();
    });
};