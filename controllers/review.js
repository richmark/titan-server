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
const oProductModel = require("../models/product");
const { _ } = require('lodash');

/**
 * List review count
 * filter by productId
 */
exports.listReviewsCount = (oRequest, oResponse) => {
    oReviewModel.find({
        product: oRequest.product._id
    }).countDocuments((oError, iCount) => {
        if (oError) {
            return oResponse.status(400).json({
                error: errorHandler(oError)
            });
        }
        oResponse.json({ data: { count: iCount } });
    });
};

/**
 * listReview function
 * gets list of all reviews
 * filter by productId
 */
exports.listReviews = (oRequest, oResponse) => {
    const iLimit = oRequest.query.limit ? parseInt(oRequest.query.limit, 10) : 6;
    const sOrder = oRequest.query.order ? oRequest.query.order : 'desc';
    const skip = parseInt(oRequest.query.skip);
    var oArgs = {};

    if (oRequest.product) {
        oArgs = { product: oRequest.product._id };
    }

    if (oRequest.query.visibility) {
        oArgs['visibility'] = true;
    }

    oReviewModel
    .find(oArgs)
    .limit(iLimit)
    .populate("user", "-_id first_name last_name") // id or email
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
 * Get product detail after sorting reviewed products by count
 */
this.getReviewedProductDetail = (oRequest, oResponse, aProducts) => {
    oProductModel
    .find({'_id': { $in: aProducts }})
    .select('product_name image')
    .exec((oError, aData) => {
        if (oError) {
            return oResponse.status(400).json({
                error: "Products not found"
            });
        }

        var aParsedData = JSON.parse(JSON.stringify(aData)); // typecast ObjectId values string
        var aParsedProducts = JSON.parse(JSON.stringify(aProducts)); // typecast ObjectId values string
        var aCombined = [];

        aParsedData.forEach((sValue, sIndex) => {
            aCombined.push({
                ...aParsedData[sIndex],
                ...(aParsedProducts.find((oItem) => oItem._id === aParsedData[sIndex]._id))
            });
        });

        oResponse.json({ data: aCombined });
    });
};

/**
 * Getting reviewed products count and grouping it by productId
 */
exports.listReviewsPerProduct = (oRequest, oResponse) => {
    const iLimit = oRequest.query.limit ? parseInt(oRequest.query.limit, 10) : 6;
    // const sOrder = oRequest.query.order ? oRequest.query.order : 'desc';
    // const skip = parseInt(oRequest.query.skip);

    oReviewModel
    .aggregate([
        { $sortByCount: '$product' }
    ])
    .limit(iLimit)
    .exec((oError, aData) => {
        if (oError) {
            return oResponse.status(400).json({
                error: errorHandler(oError)
            });
        }
        this.getReviewedProductDetail(oRequest, oResponse, aData);
    });
};

exports.getReviewsPerProductCount = (oRequest, oResponse) => {
    oReviewModel
    .aggregate([
        { $sortByCount: '$product' },
        {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }
    ])
    .exec((oError, aData) => {
        if (oError) {
            return oResponse.status(400).json({
                error: errorHandler(oError)
            });
        }
        return oResponse.json({ data: aData });
    });
}

/**
 * checkReview function by orderId
 * check if product is in the ordered product array
 * or if ordered product is reviewed
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
